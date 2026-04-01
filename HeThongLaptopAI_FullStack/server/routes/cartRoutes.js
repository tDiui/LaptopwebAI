const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// --- HÀM AI CHẤM ĐIỂM RỦI RO (Dùng để chống Spam) ---
function calculateRiskScore(items, userHistory, diaChi) {
    let score = 0.0;
    // 1. Check tần suất: Nếu trong 10 phút đã có đơn -> Tăng rủi ro
    if (userHistory && userHistory.recentOrders > 0) score += 0.5;
    // 2. Check số lượng: Đặt quá 5 máy cùng lúc -> Tăng rủi ro
    const totalQty = items ? items.reduce((sum, i) => sum + i.SoLuong, 0) : 0;
    if (totalQty > 5) score += 0.3;
    // 3. Check địa chỉ: Nếu địa chỉ quá ngắn -> Tăng rủi ro
    if (diaChi && diaChi.length < 10) score += 0.2;

    return Math.min(score, 1.0);
}

// 1. LẤY DANH SÁCH GIỎ HÀNG
router.get('/:maTK', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('maTK', sql.Int, req.params.maTK)
            .query(`
                SELECT gh.MaGH, gh.MaSP, gh.SoLuong, sp.TenSP, sp.GiaBan, sp.HinhAnh, sp.CPU, sp.VGA
                FROM GioHang gh
                JOIN SanPham sp ON gh.MaSP = sp.MaSP
                WHERE gh.MaTK = @maTK
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. THÊM VÀO GIỎ HÀNG (Dùng cho nút thêm ở trang Chi tiết)
router.post('/add', async (req, res) => {
    const { maTK, maSP, soLuong } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('maTK', sql.Int, maTK)
            .input('maSP', sql.Int, maSP)
            .input('soLuong', sql.Int, soLuong)
            .query(`
                IF EXISTS (SELECT 1 FROM GioHang WHERE MaTK = @maTK AND MaSP = @maSP)
                BEGIN
                    UPDATE GioHang SET SoLuong = SoLuong + @soLuong 
                    WHERE MaTK = @maTK AND MaSP = @maSP
                END
                ELSE
                BEGIN
                    INSERT INTO GioHang (MaTK, MaSP, SoLuong) VALUES (@maTK, @maSP, @soLuong)
                END
            `);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. XÓA SẢN PHẨM KHỎI GIỎ
router.delete('/remove', async (req, res) => {
    const { maTK, maSP } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('maTK', sql.Int, maTK)
            .input('maSP', sql.Int, maSP)
            .query('DELETE FROM GioHang WHERE MaTK = @maTK AND MaSP = @maSP');
        res.json({ message: "Đã xóa" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. THANH TOÁN (CHECKOUT) - CÓ CHỐNG SPAM VÀ TRANSACTION
router.post('/checkout', async (req, res) => {
    const { maTK, tongTien, phuongThucTT, items, diaChi } = req.body;

    try {
        const pool = await poolPromise;

        // A. KIỂM TRA SPAM GẦN ĐÂY (10 phút)
        const history = await pool.request()
            .input('maTK', sql.Int, maTK)
            .query(`SELECT COUNT(*) as recentOrders FROM DonHang 
                    WHERE MaTK = @maTK AND NgayDat > DATEADD(MINUTE, -10, GETDATE())`);

        const riskScore = calculateRiskScore(items, history.recordset[0], diaChi);
        const isSpam = riskScore >= 0.8 ? 1 : 0;

        // B. BẮT ĐẦU TRANSACTION
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Tạo Đơn hàng
            const requestOrder = new sql.Request(transaction);
            const orderResult = await requestOrder
                .input('maTK', sql.Int, maTK)
                .input('tongTien', sql.Decimal(18, 2), tongTien)
                .input('pttt', sql.NVarChar, phuongThucTT)
                .input('risk', sql.Float, riskScore)
                .input('isSpam', sql.Bit, isSpam)
                .query(`
                    INSERT INTO DonHang (MaTK, TongTien, PhuongThucThanhToan, TrangThai, RiskScore_AI, IsSpam, NgayDat)
                    OUTPUT INSERTED.MaDH
                    VALUES (@maTK, @tongTien, @pttt, 
                           CASE WHEN @isSpam = 1 THEN N'Bị từ chối (Spam)' ELSE N'Chờ xác nhận' END, 
                           @risk, @isSpam, GETDATE())
                `);

            const maDH = orderResult.recordset[0].MaDH;

            // 2. Thêm Chi tiết đơn hàng (Lặp qua items)
            if (items && items.length > 0) {
                for (const item of items) {
                    const requestDetail = new sql.Request(transaction);
                    await requestDetail
                        .input('maDH', sql.Int, maDH)
                        .input('maSP', sql.Int, item.MaSP)
                        .input('soLuong', sql.Int, item.SoLuong)
                        .input('giaBan', sql.Decimal(18, 2), item.GiaBan)
                        .query(`
                            INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, GiaBan)
                            VALUES (@maDH, @maSP, @soLuong, @giaBan)
                        `);
                }
            }

            // 3. Xóa sạch giỏ hàng
            const requestClear = new sql.Request(transaction);
            await requestClear.input('maTK', sql.Int, maTK).query('DELETE FROM GioHang WHERE MaTK = @maTK');

            await transaction.commit();

            res.json({
                success: true,
                isSpam: !!isSpam,
                maDH: isSpam ? null : maDH,
                message: isSpam ? "Dấu hiệu bất thường, đơn hàng đang được treo để xem xét!" : "Đặt hàng thành công!"
            });

        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        console.error("Checkout Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
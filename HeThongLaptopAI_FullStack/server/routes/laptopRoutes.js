const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    server: '127.0.0.1',
    database: 'QLCuaHangLaptop',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS'
    }
};

// ============================================================
// 1. ROUTE CỐ ĐỊNH (Phải để trên cùng)
// ============================================================

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT * FROM SanPham");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu", details: err.message });
    }
});

// Lấy dữ liệu để So Sánh
router.get('/compare', async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids || ids.trim() === "") return res.json([]);
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT * FROM SanPham WHERE MaSP IN (${ids})`);
        res.json(result.recordset || []);
    } catch (err) {
        res.status(500).json({ error: "Lỗi so sánh", message: err.message });
    }
});

// --- MỚI: Lấy danh sách YÊU THÍCH của người dùng ---
router.get('/favorites/:maTK', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('maTK', sql.Int, req.params.maTK)
            .query(`
                SELECT sp.* FROM SanPham sp
                JOIN SanPhamYeuThich yt ON sp.MaSP = yt.MaSP
                WHERE yt.MaTK = @maTK
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy danh sách yêu thích", message: err.message });
    }
});

// API Lấy danh sách đơn hàng của một User
router.get('/orders/:maTK', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('maTK', sql.Int, req.params.maTK)
            .query(`
                SELECT 
                    MaDH, 
                    NgayDat, 
                    TongTien, 
                    TrangThai 
                FROM DonHang 
                WHERE MaTK = @maTK 
                ORDER BY NgayDat DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy đơn hàng", message: err.message });
    }
});

// --- MỚI: Toggle Yêu thích (Thêm/Xóa) ---
router.post('/toggle-favorite', async (req, res) => {
    const { maTK, maSP } = req.body;
    try {
        let pool = await sql.connect(dbConfig);

        // Kiểm tra xem máy này đã được người này thích chưa
        const check = await pool.request()
            .input('maTK', sql.Int, maTK)
            .input('maSP', sql.Int, maSP)
            .query(`SELECT * FROM SanPhamYeuThich WHERE MaTK = @maTK AND MaSP = @maSP`);

        if (check.recordset.length > 0) {
            // Nếu đã có -> Xóa (Unlike)
            await pool.request()
                .input('maTK', sql.Int, maTK)
                .input('maSP', sql.Int, maSP)
                .query(`DELETE FROM SanPhamYeuThich WHERE MaTK = @maTK AND MaSP = @maSP`);
            res.json({ action: 'removed', message: "Đã xóa khỏi danh sách yêu thích" });
        } else {
            // Nếu chưa có -> Thêm (Like)
            await pool.request()
                .input('maTK', sql.Int, maTK)
                .input('maSP', sql.Int, maSP)
                .query(`INSERT INTO SanPhamYeuThich (MaTK, MaSP) VALUES (@maTK, @maSP)`);
            res.json({ action: 'added', message: "Đã thêm vào danh sách yêu thích" });
        }
    } catch (err) {
        res.status(500).json({ error: "Lỗi xử lý yêu thích", message: err.message });
    }
});

// ============================================================
// 2. ROUTE BIẾN ĐỘNG (/:id) - Phải để dưới cùng
// ============================================================

// Chi tiết sản phẩm
router.get('/:id', async (req, res) => {
    try {
        if (isNaN(req.params.id)) return res.status(400).json({ error: "ID không hợp lệ" });
        await sql.connect(dbConfig);
        const result = await sql.query(`SELECT * FROM SanPham WHERE MaSP = ${req.params.id}`);
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).json({ error: "Không tìm thấy máy" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chat AI
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        const searchQuery = `SELECT TOP 3 * FROM SanPham WHERE TenSP LIKE @msg OR CPU LIKE @msg`;
        let result = await pool.request()
            .input('msg', sql.NVarChar, `%${message}%`)
            .query(searchQuery);

        if (result.recordset.length > 0) {
            let reply = "Gợi ý từ AI dành cho bạn:\n";
            result.recordset.forEach(item => {
                reply += `\n• ${item.TenSP} - ${item.GiaBan.toLocaleString()}đ (CPU: ${item.CPU})`;
            });
            res.json({ reply });
        } else {
            res.json({ reply: "Hiện tại mình chưa tìm thấy máy phù hợp cấu hình này." });
        }
    } catch (err) {
        res.status(500).json({ reply: "AI đang bận một chút bro ơi!" });
    }
});

module.exports = router;
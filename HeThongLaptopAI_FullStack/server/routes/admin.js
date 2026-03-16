const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình Database kết nối
const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=QLCuaHangLaptop;Trusted_Connection=Yes;"
};

// --- CẤU HÌNH UPLOAD ẢNH ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- CÁC API DÀNH RIÊNG CHO ADMIN ---

// 1. Lấy thông số Dashboard
router.get('/stats', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const stats = await pool.request().query(`
            SELECT 
                (SELECT ISNULL(SUM(TongTien), 0) FROM DonHang WHERE IsSpam = 0) as TotalRevenue,
                (SELECT COUNT(*) FROM DonHang) as TotalOrders,
                (SELECT COUNT(*) FROM TaiKhoan WHERE VaiTro = 'Customer') as TotalCustomers,
                (SELECT COUNT(*) FROM DonHang WHERE IsSpam = 1) as SpamBlocked
        `);
        // Không cần "FROM SanPham" ở cuối câu truy vấn
        res.json(stats.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Lấy danh sách sản phẩm
router.get('/products', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM SanPham ORDER BY NgayTao DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Thêm sản phẩm kèm Upload ảnh
router.post('/products', upload.single('HinhAnh'), async (req, res) => {
    // Multer sẽ đưa dữ liệu chữ vào req.body và file vào req.file
    const p = req.body;
    const hinhAnhUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('GiaBan', sql.Decimal, p.GiaBan)
            .input('SoLuongTon', sql.Int, p.SoLuongTon)
            .input('CPU', sql.NVarChar, p.CPU)
            .input('RAM', sql.NVarChar, p.RAM)
            .input('VGA', sql.NVarChar, p.VGA)
            .input('HinhAnh', sql.NVarChar, hinhAnhUrl)
            .query(`INSERT INTO SanPham (TenSP, GiaBan, SoLuongTon, CPU, RAM, VGA, HinhAnh, TrangThai) 
                    VALUES (@TenSP, @GiaBan, @SoLuongTon, @CPU, @RAM, @VGA, @HinhAnh, 1)`);
        res.json({ message: "Thêm thành công!" });
    } catch (err) {
        console.error("Lỗi Server:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// 4. Xóa (Ẩn) sản phẩm - Soft Delete
router.delete('/products/:id', async (req, res) => {
    const maSP = req.params.id;

    try {
        let pool = await sql.connect(dbConfig);

        // Lệnh DELETE để xóa hẳn khỏi database
        const result = await pool.request()
            .input('MaSP', sql.Int, maSP)
            .query("DELETE FROM SanPham WHERE MaSP = @MaSP");

        // rowsAffected[0] trả về số dòng bị ảnh hưởng (số dòng bị xóa)
        if (result.rowsAffected[0] > 0) {
            res.json({ message: "Đã xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu!" });
        } else {
            res.status(404).json({ error: "Không tìm thấy sản phẩm này để xóa." });
        }
    } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa sản phẩm", details: err.message });
    }
});

// 5. Cập nhật sản phẩm
router.put('/products/:id', upload.single('HinhAnh'), async (req, res) => {
    const maSP = req.params.id;
    const p = req.body;
    const hinhAnhUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    try {
        let pool = await sql.connect(dbConfig);

        // Tạo câu lệnh SQL động (có hoặc không có cập nhật ảnh)
        let query = `
            UPDATE SanPham 
            SET TenSP = @TenSP, GiaBan = @GiaBan, SoLuongTon = @SoLuongTon, 
                CPU = @CPU, RAM = @RAM, VGA = @VGA
        `;

        if (hinhAnhUrl) {
            query += `, HinhAnh = @HinhAnh`;
        }

        query += ` WHERE MaSP = @MaSP`;

        const request = pool.request()
            .input('MaSP', sql.Int, maSP)
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('GiaBan', sql.Decimal, p.GiaBan)
            .input('SoLuongTon', sql.Int, p.SoLuongTon)
            .input('CPU', sql.NVarChar, p.CPU)
            .input('RAM', sql.NVarChar, p.RAM)
            .input('VGA', sql.NVarChar, p.VGA);

        if (hinhAnhUrl) {
            request.input('HinhAnh', sql.NVarChar, hinhAnhUrl);
        }

        await request.query(query);
        res.json({ message: "Cập nhật sản phẩm thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật sản phẩm:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// QUẢN LÝ KHÁCH HÀNG (TaiKhoan)
// ==========================================

// 6. Lấy danh sách khách hàng
router.get('/customers', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // Chỉ lấy những tài khoản có vai trò là Customer, không lấy mật khẩu
        let result = await pool.request().query(`
            SELECT MaTK, HoTen, Email, SoDienThoai, DiaChi, NgayTao, TrangThai 
            FROM TaiKhoan 
            WHERE VaiTro = 'Customer' 
            ORDER BY NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Khóa / Mở khóa tài khoản
router.put('/customers/:id/status', async (req, res) => {
    const maTK = req.params.id;
    const { trangThaiMoi } = req.body; // Gửi 1 (Mở khóa) hoặc 0 (Khóa) từ Frontend

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaTK', sql.Int, maTK)
            .input('TrangThai', sql.Bit, trangThaiMoi)
            .query("UPDATE TaiKhoan SET TrangThai = @TrangThai WHERE MaTK = @MaTK");

        res.json({ message: "Cập nhật trạng thái tài khoản thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật trạng thái khách hàng:", err.message);
        res.status(500).json({ error: err.message });
    }
});
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
                (SELECT SUM(TongTien) FROM DonHang WHERE IsSpam = 0) as TotalRevenue,
                (SELECT COUNT(*) FROM DonHang) as TotalOrders,
                (SELECT COUNT(*) FROM TaiKhoan WHERE VaiTro = 'Customer') as TotalCustomers,
                (SELECT COUNT(*) FROM DonHang WHERE IsSpam = 1) as SpamBlocked
            FROM SanPham
        `);
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
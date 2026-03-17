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
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// ==========================================
// QUẢN LÝ SẢN PHẨM (SanPham)
// ==========================================

// 1. Lấy danh sách sản phẩm
router.get('/products', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT sp.*, h.TenHang 
            FROM SanPham sp
            LEFT JOIN Hang h ON sp.MaHang = h.MaHang
            ORDER BY sp.NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm sản phẩm mới (Hỗ trợ 3 ảnh lưu dạng JSON)
router.post('/products', upload.array('HinhAnh', 3), async (req, res) => {
    const p = req.body;

    // Xử lý mảng ảnh
    let hinhAnhUrls = [];
    if (req.files && req.files.length > 0) {
        hinhAnhUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }
    const hinhAnhString = hinhAnhUrls.length > 0 ? JSON.stringify(hinhAnhUrls) : null;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('GiaBan', sql.Decimal, p.GiaBan)
            .input('SoLuongTon', sql.Int, p.SoLuongTon)
            .input('CPU', sql.NVarChar, p.CPU)
            .input('RAM', sql.NVarChar, p.RAM)
            .input('VGA', sql.NVarChar, p.VGA)
            .input('ManHinh', sql.NVarChar, p.ManHinh)
            .input('O_Cung', sql.NVarChar, p.O_Cung)
            .input('TrongLuong', sql.Float, p.TrongLuong ? parseFloat(p.TrongLuong) : 0)
            .input('MoTa', sql.NVarChar, p.MoTa)
            .input('HinhAnh', sql.NVarChar, hinhAnhString)
            .query(`INSERT INTO SanPham (TenSP, GiaBan, SoLuongTon, CPU, RAM, VGA, ManHinh, O_Cung, TrongLuong, MoTa, HinhAnh, TrangThai) 
                    VALUES (@TenSP, @GiaBan, @SoLuongTon, @CPU, @RAM, @VGA, @ManHinh, @O_Cung, @TrongLuong, @MoTa, @HinhAnh, 1)`);
        res.json({ message: "Thêm thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật sản phẩm
router.put('/products/:id', upload.array('HinhAnh', 3), async (req, res) => {
    const maSP = req.params.id;
    const p = req.body;

    let hinhAnhUrls = [];
    if (req.files && req.files.length > 0) {
        hinhAnhUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }
    const hinhAnhString = hinhAnhUrls.length > 0 ? JSON.stringify(hinhAnhUrls) : null;

    try {
        let pool = await sql.connect(dbConfig);
        let query = `
            UPDATE SanPham 
            SET TenSP = @TenSP, GiaBan = @GiaBan, SoLuongTon = @SoLuongTon, 
                CPU = @CPU, RAM = @RAM, VGA = @VGA, ManHinh = @ManHinh, 
                O_Cung = @O_Cung, TrongLuong = @TrongLuong, MoTa = @MoTa
        `;
        if (hinhAnhString) query += `, HinhAnh = @HinhAnh`;
        query += ` WHERE MaSP = @MaSP`;

        const request = pool.request()
            .input('MaSP', sql.Int, maSP)
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('GiaBan', sql.Decimal, p.GiaBan)
            .input('SoLuongTon', sql.Int, p.SoLuongTon)
            .input('CPU', sql.NVarChar, p.CPU)
            .input('RAM', sql.NVarChar, p.RAM)
            .input('VGA', sql.NVarChar, p.VGA)
            .input('ManHinh', sql.NVarChar, p.ManHinh)
            .input('O_Cung', sql.NVarChar, p.O_Cung)
            .input('TrongLuong', sql.Float, p.TrongLuong ? parseFloat(p.TrongLuong) : 0)
            .input('MoTa', sql.NVarChar, p.MoTa);

        if (hinhAnhString) request.input('HinhAnh', sql.NVarChar, hinhAnhString);

        await request.query(query);
        res.json({ message: "Cập nhật sản phẩm thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa sản phẩm (Xóa vĩnh viễn)
router.delete('/products/:id', async (req, res) => {
    const maSP = req.params.id;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaSP', sql.Int, maSP)
            .query("DELETE FROM SanPham WHERE MaSP = @MaSP");
        res.json({ message: "Đã xóa sản phẩm khỏi Database!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// QUẢN LÝ KHÁCH HÀNG (TaiKhoan)
// ==========================================
router.get('/customers', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`SELECT MaTK, HoTen, Email, SoDienThoai, DiaChi, NgayTao, TrangThai FROM TaiKhoan WHERE VaiTro = 'Customer' ORDER BY NgayTao DESC`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/customers/:id/status', async (req, res) => {
    const maTK = req.params.id;
    const { trangThaiMoi } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('MaTK', sql.Int, maTK).input('TrangThai', sql.Bit, trangThaiMoi).query("UPDATE TaiKhoan SET TrangThai = @TrangThai WHERE MaTK = @MaTK");
        res.json({ message: "Cập nhật trạng thái thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
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

// 1. Lấy danh sách sản phẩm (Bổ sung JOIN với bảng DanhMuc để lấy TenDM)
router.get('/products', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT sp.*, h.TenHang, d.TenDM 
            FROM SanPham sp
            LEFT JOIN Hang h ON sp.MaHang = h.MaHang
            LEFT JOIN DanhMuc d ON sp.MaDM = d.MaDM
            ORDER BY sp.NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm sản phẩm mới (Thêm input MaDM)
router.post('/products', upload.array('HinhAnh', 3), async (req, res) => {
    const p = req.body;
    let hinhAnhUrls = req.files ? req.files.map(file => `http://localhost:5000/uploads/${file.filename}`) : [];
    const hinhAnhString = hinhAnhUrls.length > 0 ? JSON.stringify(hinhAnhUrls) : null;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('MaDM', sql.Int, p.MaDM ? parseInt(p.MaDM) : null) // <-- THÊM DÒNG NÀY
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
            .query(`INSERT INTO SanPham (TenSP, MaDM, GiaBan, SoLuongTon, CPU, RAM, VGA, ManHinh, O_Cung, TrongLuong, MoTa, HinhAnh, TrangThai) 
                    VALUES (@TenSP, @MaDM, @GiaBan, @SoLuongTon, @CPU, @RAM, @VGA, @ManHinh, @O_Cung, @TrongLuong, @MoTa, @HinhAnh, 1)`);
        res.json({ message: "Thêm thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật sản phẩm (Thêm input MaDM)
router.put('/products/:id', upload.array('HinhAnh', 3), async (req, res) => {
    const maSP = req.params.id;
    const p = req.body;
    let hinhAnhUrls = req.files ? req.files.map(file => `http://localhost:5000/uploads/${file.filename}`) : [];
    const hinhAnhString = hinhAnhUrls.length > 0 ? JSON.stringify(hinhAnhUrls) : null;

    try {
        let pool = await sql.connect(dbConfig);
        let query = `
            UPDATE SanPham 
            SET TenSP = @TenSP, MaDM = @MaDM, GiaBan = @GiaBan, SoLuongTon = @SoLuongTon, 
                CPU = @CPU, RAM = @RAM, VGA = @VGA, ManHinh = @ManHinh, 
                O_Cung = @O_Cung, TrongLuong = @TrongLuong, MoTa = @MoTa
        `;
        if (hinhAnhString) query += `, HinhAnh = @HinhAnh`;
        query += ` WHERE MaSP = @MaSP`;

        const request = pool.request()
            .input('MaSP', sql.Int, maSP)
            .input('TenSP', sql.NVarChar, p.TenSP)
            .input('MaDM', sql.Int, p.MaDM ? parseInt(p.MaDM) : null) // <-- THÊM DÒNG NÀY
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
        res.json({ message: "Cập nhật thành công!" });
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
// 5. Lấy danh sách TẤT CẢ tài khoản kèm số đơn hàng
router.get('/accounts', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT 
                t.MaTK, t.HoTen, t.Email, t.VaiTro, t.TrangThai, t.NgayTao,
                (SELECT COUNT(*) FROM DonHang d WHERE d.MaTK = t.MaTK) as SoDonHang
            FROM TaiKhoan t 
            ORDER BY t.NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Cập nhật trạng thái tài khoản (Khóa/Mở khóa)
router.put('/accounts/:id/status', async (req, res) => {
    const maTK = req.params.id;
    const { trangThaiMoi } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaTK', sql.Int, maTK)
            .input('TrangThai', sql.Bit, trangThaiMoi)
            .query("UPDATE TaiKhoan SET TrangThai = @TrangThai WHERE MaTK = @MaTK");
        res.json({ message: "Cập nhật trạng thái thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Xóa tài khoản
router.delete('/accounts/:id', async (req, res) => {
    const maTK = req.params.id;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaTK', sql.Int, maTK)
            .query("DELETE FROM TaiKhoan WHERE MaTK = @MaTK");
        res.json({ message: "Xóa tài khoản thành công!" });
    } catch (err) {
        // Bắt lỗi nếu tài khoản đã có đơn hàng/đánh giá (Lỗi khóa ngoại)
        res.status(500).json({ error: "Tài khoản này đã có lịch sử giao dịch. Vui lòng sử dụng tính năng 'Khóa tài khoản' thay vì xóa." });
    }
});

// 8.Thêm tài khoản mới
router.post('/accounts', async (req, res) => {
    const { HoTen, Email, MatKhau, VaiTro } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('HoTen', sql.NVarChar, HoTen)
            .input('Email', sql.VarChar, Email)
            // Trong thực tế, mật khẩu nên được băm (hash) bằng bcrypt. Ở đây ta lưu tạm chuỗi gốc để test
            .input('MatKhau', sql.NVarChar, MatKhau || '123456')
            .input('VaiTro', sql.NVarChar, VaiTro || 'Customer')
            .query("INSERT INTO TaiKhoan (HoTen, Email, MatKhau, VaiTro, TrangThai) VALUES (@HoTen, @Email, @MatKhau, @VaiTro, 1)");

        res.json({ message: "Thêm tài khoản thành công!" });
    } catch (err) {
        // Lỗi 2627 thường là do trùng Email (ràng buộc UNIQUE trong DB)
        if (err.number === 2627) return res.status(400).json({ error: "Email này đã tồn tại trong hệ thống!" });
        res.status(500).json({ error: err.message });
    }
});

// 9.Cập nhật thông tin tài khoản (Không bao gồm đổi mật khẩu)
router.put('/accounts/:id', async (req, res) => {
    const maTK = req.params.id;
    const { HoTen, Email, VaiTro } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaTK', sql.Int, maTK)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('Email', sql.VarChar, Email)
            .input('VaiTro', sql.NVarChar, VaiTro)
            .query("UPDATE TaiKhoan SET HoTen = @HoTen, Email = @Email, VaiTro = @VaiTro WHERE MaTK = @MaTK");

        res.json({ message: "Cập nhật tài khoản thành công!" });
    } catch (err) {
        if (err.number === 2627) return res.status(400).json({ error: "Email này đã được sử dụng bởi người khác!" });
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// QUẢN LÝ DANH MỤC (DanhMuc)
// ==========================================

// 1. Lấy danh sách danh mục (Kèm số lượng sản phẩm bên trong)
router.get('/categories', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT d.*, 
                   (SELECT COUNT(*) FROM SanPham s WHERE s.MaDM = d.MaDM) as SoSanPham
            FROM DanhMuc d
            ORDER BY d.NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm danh mục mới
router.post('/categories', async (req, res) => {
    const { TenDM, MoTa, Slug, Icon, ColorClass } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('TenDM', sql.NVarChar, TenDM)
            .input('MoTa', sql.NVarChar, MoTa)
            .input('Slug', sql.VarChar, Slug)
            .input('Icon', sql.VarChar, Icon || 'FolderTree')
            .input('ColorClass', sql.VarChar, ColorClass || 'cyan')
            .query(`INSERT INTO DanhMuc (TenDM, MoTa, Slug, Icon, ColorClass, TrangThai) 
                    VALUES (@TenDM, @MoTa, @Slug, @Icon, @ColorClass, 1)`);
        res.json({ message: "Thêm danh mục thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật trạng thái hoặc thông tin
router.put('/categories/:id', async (req, res) => {
    const maDM = req.params.id;
    const { TenDM, MoTa, Slug, Icon, ColorClass, TrangThai } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaDM', sql.Int, maDM)
            .input('TenDM', sql.NVarChar, TenDM)
            .input('MoTa', sql.NVarChar, MoTa)
            .input('Slug', sql.VarChar, Slug)
            .input('Icon', sql.VarChar, Icon)
            .input('ColorClass', sql.VarChar, ColorClass)
            .input('TrangThai', sql.Bit, TrangThai)
            .query(`UPDATE DanhMuc 
                    SET TenDM=@TenDM, MoTa=@MoTa, Slug=@Slug, Icon=@Icon, ColorClass=@ColorClass, TrangThai=@TrangThai 
                    WHERE MaDM=@MaDM`);
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa danh mục
router.delete('/categories/:id', async (req, res) => {
    const maDM = req.params.id;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaDM', sql.Int, maDM)
            .query("DELETE FROM DanhMuc WHERE MaDM = @MaDM");
        res.json({ message: "Đã xóa danh mục!" });
    } catch (err) {
        res.status(500).json({ error: "Không thể xóa danh mục đang chứa sản phẩm!" });
    }
});

module.exports = router;
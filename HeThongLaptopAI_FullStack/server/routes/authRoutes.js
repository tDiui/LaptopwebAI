const express = require('express');
const router = express.Router();
const { sql, dbConfig } = require('../config/db'); // Import từ file config vừa tạo

// Endpoints Đăng ký
router.post('/register', async (req, res) => {
    const { hoTen, email, matKhau, soDienThoai } = req.body;
    try {
        await sql.connect(dbConfig);
        const checkUser = await sql.query(`SELECT * FROM TaiKhoan WHERE Email = '${email}'`);
        if (checkUser.recordset.length > 0) return res.status(400).json({ error: "Email đã tồn tại!" });

        await sql.query(`
            INSERT INTO TaiKhoan (HoTen, Email, MatKhau, SoDienThoai, VaiTro, TrangThai, NgayTao)
            VALUES (N'${hoTen}', '${email}', '${matKhau}', '${soDienThoai}', 'User', 1, GETDATE())
        `);
        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoints Đăng nhập
router.post('/login', async (req, res) => {
    const { email, matKhau } = req.body;
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT MaTK, HoTen, Email, VaiTro FROM TaiKhoan 
            WHERE Email = '${email}' AND MatKhau = '${matKhau}' AND TrangThai = 1
        `);
        if (result.recordset.length > 0) {
            res.json({ success: true, user: result.recordset[0] });
        } else {
            res.status(401).json({ error: "Sai email hoặc mật khẩu!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 1. Lấy thông tin chi tiết user
router.get('/profile/:id', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`SELECT MaTK, HoTen, Email, SoDienThoai, DiaChi, VaiTro, NgayTao FROM TaiKhoan WHERE MaTK = ${req.params.id}`);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Cập nhật thông tin
router.put('/profile/update', async (req, res) => {
    const { maTK, hoTen, soDienThoai, diaChi } = req.body;
    try {
        await sql.connect(dbConfig);
        await sql.query(`
            UPDATE TaiKhoan 
            SET HoTen = N'${hoTen}', SoDienThoai = '${soDienThoai}', DiaChi = N'${diaChi}'
            WHERE MaTK = ${maTK}
        `);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
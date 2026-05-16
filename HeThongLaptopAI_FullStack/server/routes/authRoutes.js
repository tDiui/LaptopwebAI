const express = require('express');
const router = express.Router();
const { sql, dbConfig } = require('../config/db');

// 1. Endpoint Đăng ký (Sửa để chống SQL Injection)
router.post('/register', async (req, res) => {
    const { hoTen, email, matKhau, soDienThoai } = req.body;
    try {
        let pool = await sql.connect(dbConfig);

        // Kiểm tra email tồn tại dùng Parameter
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`SELECT * FROM TaiKhoan WHERE Email = @email`);

        if (checkUser.recordset.length > 0)
            return res.status(400).json({ error: "Email đã tồn tại!" });

        // Insert dùng Parameter cho an toàn
        await pool.request()
            .input('hoTen', sql.NVarChar, hoTen)
            .input('email', sql.NVarChar, email)
            .input('matKhau', sql.NVarChar, matKhau)
            .input('soDienThoai', sql.NVarChar, soDienThoai)
            .query(`
                INSERT INTO TaiKhoan (HoTen, Email, MatKhau, SoDienThoai, VaiTro, TrangThai, NgayTao)
                VALUES (@hoTen, @email, @matKhau, @soDienThoai, 'User', 1, GETDATE())
            `);

        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Endpoint Đăng nhập (FIX lỗi trả về ID)
router.post('/login', async (req, res) => {
    const { email, matKhau } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('matKhau', sql.NVarChar, matKhau)
            .query(`
                SELECT MaTK, HoTen, Email, VaiTro FROM TaiKhoan 
                WHERE Email = @email AND MatKhau = @matKhau AND TrangThai = 1
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            // Trả về Object User sạch sẽ
            res.json({
                success: true,
                user: {
                    MaTK: user.MaTK,
                    HoTen: user.HoTen,
                    Email: user.Email,
                    VaiTro: user.VaiTro
                }
            });
        } else {
            res.status(401).json({ error: "Sai email hoặc mật khẩu!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Lấy thông tin chi tiết user
router.get('/profile/:id', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT MaTK, HoTen, Email, SoDienThoai, DiaChi, VaiTro, NgayTao FROM TaiKhoan WHERE MaTK = @id`);

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Cập nhật thông tin (Profile người dùng)
router.put('/profile/update', async (req, res) => {
    const { maTK, hoTen, soDienThoai, diaChi } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('maTK', sql.Int, maTK)
            .input('hoTen', sql.NVarChar, hoTen)
            .input('soDienThoai', sql.NVarChar, soDienThoai)
            .input('diaChi', sql.NVarChar, diaChi)
            .query(`
                UPDATE TaiKhoan 
                SET HoTen = @hoTen, SoDienThoai = @soDienThoai, DiaChi = @diaChi
                WHERE MaTK = @maTK
            `);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// CÁC API DÀNH CHO TRANG SETTINGS (CÀI ĐẶT)
// ============================================================

// 5. Cập nhật thông tin tài khoản (Chỉ Tên & Email từ Settings)
router.put('/settings/update-account/:id', async (req, res) => {
    const { hoTen, email } = req.body;
    const { id } = req.params;

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('HoTen', sql.NVarChar, hoTen)
            .input('Email', sql.NVarChar, email)
            .input('MaTK', sql.Int, id)
            .query(`
                UPDATE TaiKhoan 
                SET HoTen = @HoTen, Email = @Email 
                WHERE MaTK = @MaTK
            `);

        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật user:", err);
        res.status(500).json({ error: "Lỗi máy chủ khi cập nhật" });
    }
});

// 6. Đổi mật khẩu
router.put('/settings/change-password/:id', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    try {
        let pool = await sql.connect(dbConfig);

        // Lấy mật khẩu cũ ra kiểm tra
        const user = await pool.request()
            .input('MaTK', sql.Int, id)
            .query(`SELECT MatKhau FROM TaiKhoan WHERE MaTK = @MaTK`);

        if (user.recordset.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy tài khoản" });
        }

        if (user.recordset[0].MatKhau !== currentPassword) {
            return res.status(400).json({ error: "Mật khẩu hiện tại không chính xác!" });
        }

        // Cập nhật mật khẩu mới
        await pool.request()
            .input('MatKhauMoi', sql.NVarChar, newPassword)
            .input('MaTK', sql.Int, id)
            .query(`UPDATE TaiKhoan SET MatKhau = @MatKhauMoi WHERE MaTK = @MaTK`);

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        console.error("Lỗi đổi mật khẩu:", err);
        res.status(500).json({ error: "Lỗi máy chủ khi đổi mật khẩu" });
    }
});

module.exports = router;
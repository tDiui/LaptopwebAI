const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');

// Lưu ý: dbConfig nên được tách ra file riêng hoặc khai báo lại ở đây
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

// 1. API Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT * FROM SanPham");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu", details: err.message });
    }
});

// 2. API Lấy chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`SELECT * FROM SanPham WHERE MaSP = ${req.params.id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: "Không tìm thấy máy" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. API Chat AI (Đưa về đây cho dễ quản lý)
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
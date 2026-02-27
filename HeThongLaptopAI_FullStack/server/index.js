
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    server: '127.0.0.1', // Dùng IP thay cho localhost
    database: 'QLCuaHangLaptop',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS' // Đưa tên instance vào đây thay vì để ở dòng server
    }
};

app.get('/api/laptops', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT * FROM SanPham");
        res.json(result.recordset); // Trả về mảng JSON
    } catch (err) {
        // Trả về JSON lỗi thay vì chuỗi thô
        res.status(500).json({ error: "Không kết nối được DB", details: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
// API xử lý Chat AI
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        // Tìm máy dựa trên từ khóa người dùng nhập (Tên máy hoặc CPU)
        const searchQuery = `SELECT TOP 3 * FROM SanPham WHERE TenSP LIKE @msg OR CPU LIKE @msg`;
        let result = await pool.request()
            .input('msg', sql.NVarChar, `%${message}%`)
            .query(searchQuery);

        if (result.recordset.length > 0) {
            let reply = "Đây là những mẫu laptop phù hợp với yêu cầu của bạn:\n";
            result.recordset.forEach(item => {
                reply += `\n• ${item.TenSP} - Giá: ${item.GiaBan.toLocaleString()}đ (CPU: ${item.Cpu})`;
            });
            res.json({ reply });
        } else {
            res.json({ reply: "Cảm ơn bạn! Hiện tại mình chưa tìm thấy máy đúng yêu cầu, bạn thử nhập tên hãng hoặc dòng CPU khác nhé." });
        }
    } catch (err) {
        res.status(500).json({ reply: "AI đang bận một chút, bạn thử lại sau nhé!" });
    }
});
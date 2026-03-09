require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin'); // Nạp router admin

const app = express();
app.use(cors());
app.use(express.json());

// Quan trọng: Phải có dòng này để trình duyệt xem được ảnh đã upload
app.use('/uploads', express.static('uploads'));

// Gắn router admin vào tiền tố /api/admin
app.use('/api/admin', adminRoutes);

// --- ROUTES CLIENT (GIỮ NGUYÊN) ---
app.get('/api/laptops', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM SanPham WHERE TrangThai = 1");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi kết nối", details: err.message });
    }
});
app.post('/api/chat', async (req, res) => {  }); //code ne

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
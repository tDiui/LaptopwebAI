require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const laptopRoutes = require('./routes/laptopRoutes');
const adminRoutes = require('./routes/admin'); // Nạp router admin
const chatRoutes = require('./routes/chatRoutes'); // Nạp router chat

const app = express();
app.use(cors());
app.use(express.json());

// Quan trọng: Phải có dòng này để trình duyệt xem được ảnh đã upload
app.use('/uploads', express.static('uploads'));
// Gắn router admin vào tiền tố /api/admin
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // Gắn router chat vào tiền tố /api/chat
app.use('/api/auth', authRoutes);
app.use('/api/laptops', laptopRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
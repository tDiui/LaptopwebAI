const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const Groq = require('groq-sdk');

// Khởi tạo Groq với API Key của bro
const groq = new Groq({ apiKey: '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' });

router.post('/ask', async (req, res) => {
    const { message, maTK } = req.body;

    try {
        const pool = await poolPromise;

        // 1. "Truy xuất" (Retrieval): Lấy dữ liệu máy tính thực tế từ DB
        const productsResult = await pool.request().query(`
            SELECT TenSP, GiaBan, CPU, RAM, VGA, MoTa 
            FROM SanPham WHERE TrangThai = 1
        `);

        const context = productsResult.recordset.map(p =>
            `- ${p.TenSP}: ${new Intl.NumberFormat('vi-VN').format(p.GiaBan)}đ. Cấu hình: ${p.CPU}, ${p.RAM}, ${p.VGA}.`
        ).join('\n');

        // 2. "Tạo câu trả lời" (Generation): Gửi cho Gemma 4 qua Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Bạn là trợ lý tư vấn Laptop chuyên nghiệp. 
                    DANH SÁCH SẢN PHẨM: ${context}

                    YÊU CẦU TRÌNH BÀY (BẮT BUỘC):
                    1. Phải sử dụng Xuống dòng (\n) sau mỗi ý chính.
                    2. Sử dụng dấu gạch đầu dòng (-) để liệt kê các máy.
                    3. IN ĐẬM tên máy bằng cú pháp: **Tên Máy**.
                    4. Phân chia rõ ràng: 
                       - Lời chào.
                       - Danh sách gợi ý (Mỗi máy 1 dòng, có cấu hình tóm tắt).
                       - Lời khuyên cuối cùng.
                    5. Không viết một khối văn bản liên tục.`
                },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile", // Thay bằng model Gemma 4 nếu Groq đã cập nhật tên model mới nhất
            temperature: 0.6,
            max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "AI đang bận, bro đợi tí nhé!";

        // 3. Lưu vào nhật ký chat (Database bro đã có bảng này)
        await pool.request()
            .input('maTK', sql.Int, maTK || null)
            .input('cauHoi', sql.NVarChar, message)
            .input('traLoi', sql.NVarChar, reply)
            .query(`INSERT INTO NhatKyChat (MaTK, CauHoi, AI_TraLoi) VALUES (@maTK, @cauHoi, @traLoi)`);

        res.json({ reply });

    } catch (err) {
        console.error("Groq Error:", err);
        res.status(500).json({ error: "Lỗi kết nối bộ não AI rồi bro!" });
    }
});

module.exports = router;
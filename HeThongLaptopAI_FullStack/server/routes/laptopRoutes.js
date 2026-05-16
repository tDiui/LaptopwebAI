const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=QLCuaHangLaptop;Trusted_Connection=Yes;"
};

// ============================================================
// HỆ THỐNG TRACKER: ĐẾM LƯỢT AI REQUEST & TRAFFIC (Lưu trên RAM)
// ============================================================
let dashboardChartData = [
    { name: 'T2', traffic: 120, aiRequests: 45 },
    { name: 'T3', traffic: 150, aiRequests: 60 },
    { name: 'T4', traffic: 180, aiRequests: 85 },
    { name: 'T5', traffic: 160, aiRequests: 70 },
    { name: 'T6', traffic: 210, aiRequests: 95 },
    { name: 'T7', traffic: 250, aiRequests: 120 },
    { name: 'CN', traffic: 200, aiRequests: 90 },
];

const trackAiRequest = () => {
    let today = new Date().getDay(); // 0 là CN, 1 là T2...
    let index = today === 0 ? 6 : today - 1;
    dashboardChartData[index].aiRequests += 1;
    dashboardChartData[index].traffic += 2;
    console.log(`📈 [TRACKER] 1 lượt AI vừa được gọi! (Tổng hôm nay: ${dashboardChartData[index].aiRequests})`);
};


// ============================================================
// API ADMIN DASHBOARD (Lấy Thống kê & Biểu đồ)
// ============================================================
router.get('/admin/dashboard-stats', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const prod = await pool.request().query('SELECT COUNT(*) as total FROM SanPham');
        const order = await pool.request().query('SELECT COUNT(*) as total, ISNULL(SUM(TongTien), 0) as revenue FROM DonHang');
        const user = await pool.request().query('SELECT COUNT(*) as total FROM TaiKhoan');

        res.json({
            revenue: order.recordset[0].revenue,
            orders: order.recordset[0].total,
            products: prod.recordset[0].total,
            customers: user.recordset[0].total,
            chartData: dashboardChartData // Đẩy mảng dữ liệu AI này lên cho Frontend vẽ biểu đồ
        });
    } catch (err) {
        console.error("Lỗi Dashboard API:", err);
        res.status(500).json({ error: "Lỗi lấy dữ liệu Dashboard" });
    }
});

// ============================================================
// 1. ROUTE CỐ ĐỊNH (Phải để trên cùng để không bị nuốt)
// ============================================================

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT * FROM SanPham");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu", details: err.message });
    }
});

// ============================================================
// API MỚI: AI CHẤM ĐIỂM BENCHMARK (ON-DEMAND)
// ============================================================
router.post('/ai-score', async (req, res) => {
    const { tenSP, cpu, ram, vga, giaBan } = req.body;

    try {
        // 1. PROMPT SIÊU GẮT: Cấm tuyệt đối luyên thuyên
        let promptText = `Bạn là máy chấm điểm phần cứng. 
CHỈ TRẢ VỀ JSON. KHÔNG GIẢI THÍCH. KHÔNG CHÀO HỎI. KHÔNG DÙNG DẤU *.
Dữ liệu: Laptop ${tenSP}, CPU ${cpu}, RAM ${ram}, VGA ${vga}, Giá ${giaBan}.
Yêu cầu trả về đúng định dạng này: {"score": số_điểm, "review": "nhận_xét_ngắn"}`;

        const apiKey = process.env.GEMINI_API_KEY;
        // Dùng bản Flash cho nhanh và ít luyên thuyên hơn bản Pro
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text;

        // 2. BỘ LỌC THÔNG MINH: Chỉ lấy những gì nằm trong dấu { }
        // Dù AI có nói nhảm trước hay sau, mình cũng chỉ bốc đúng cục JSON ra thôi
        const jsonMatch = aiText.match(/\{.*\}/s);
        if (!jsonMatch) {
            throw new Error("AI không trả về JSON chuẩn");
        }

        const cleanJson = jsonMatch[0];
        const aiResult = JSON.parse(cleanJson);

        res.json(aiResult);

    } catch (err) {
        console.error("🚨 LỖI PARSE AI:", err.message);
        // Trả về một kết quả mặc định nếu AI dở chứng để giao diện không bị lỗi "Vệ tinh"
        res.json({ score: 70, review: "Cấu hình ổn định, phù hợp với phân khúc giá." });
    }
});


router.get('/benchmark-data', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query(`
            SELECT 
                sp.*, 
                h.TenHang,
                ISNULL((
                    SELECT AVG(CAST(SoSao AS FLOAT)) * 20 
                    FROM DanhGia dg 
                    WHERE dg.MaSP = sp.MaSP AND dg.TrangThai = 1
                ), 0) AS UserScore,
                (SELECT COUNT(*) FROM DanhGia dg WHERE dg.MaSP = sp.MaSP AND dg.TrangThai = 1) AS TotalReviews
            FROM SanPham sp
            LEFT JOIN Hang h ON sp.MaHang = h.MaHang
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi API Benchmark:", err);
        res.status(500).json({ error: err.message });
    }
});

// Lấy dữ liệu để So Sánh
router.get('/compare', async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids || ids.trim() === "") return res.json([]);
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT * FROM SanPham WHERE MaSP IN (${ids})`);
        res.json(result.recordset || []);
    } catch (err) {
        res.status(500).json({ error: "Lỗi so sánh", message: err.message });
    }
});

// API Chat: Gọi trực tiếp máy chủ Google (KHÔNG DÙNG THƯ VIỆN)
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        // 1. TÌM KIẾM DỮ LIỆU DATABASE
        let pool = await sql.connect(dbConfig);
        const searchQuery = `
            SELECT TOP 3 TenSP, GiaBan, CPU, RAM, VGA 
            FROM SanPham 
            WHERE TenSP LIKE @msg OR CPU LIKE @msg OR MoTa LIKE @msg
        `;
        let dbResult = await pool.request()
            .input('msg', sql.NVarChar, `%${message}%`)
            .query(searchQuery);

        // 2. TẠO PROMPT CỰC KỲ NGHIÊM NGẶT ÉP AI NHẬP VAI
        let promptText = `Nhiệm vụ của bạn là đóng vai một nhân viên tư vấn bán hàng tại cửa hàng Laptop AI.
QUY TẮC BẮT BUỘC: 
- CHỈ ĐƯỢC in ra câu trả lời cuối cùng để gửi trực tiếp cho khách hàng. 
- KHÔNG giải thích, KHÔNG phân tích, KHÔNG lặp lại chỉ dẫn này.
- Trả lời tự nhiên, thân thiện bằng tiếng Việt.

--- THÔNG TIN HỆ THỐNG CUNG CẤP ---
`;

        if (dbResult.recordset.length > 0) {
            promptText += `Danh sách laptop đang có sẵn khớp với yêu cầu:\n`;
            dbResult.recordset.forEach(item => {
                promptText += `- ${item.TenSP} | Giá: ${item.GiaBan.toLocaleString('vi-VN')} VNĐ | Cấu hình: ${item.CPU}, ${item.RAM}\n`;
            });
            promptText += `Hãy dùng danh sách này để báo giá và tư vấn ngay cho khách.\n`;
        } else {
            promptText += `Trong kho không có máy nào khớp với từ khóa của khách. Hãy xin lỗi khéo léo và gợi ý khách thử tìm theo thông số cụ thể (ví dụ: tìm Core i5, Core i7, hoặc RAM 16GB) để bạn dễ hỗ trợ hơn.\n`;
        }

        promptText += `
---
TIN NHẮN CỦA KHÁCH HÀNG: "${message}"
CÂU TRẢ LỜI CỦA BẠN (Chỉ viết nội dung trả lời):`;

        // 3. GỌI THẲNG API CỦA GOOGLE (Vượt mặt SDK)
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        // NẾU GOOGLE BÁO LỖI -> In thẳng lỗi thật ra Terminal để bắt bệnh
        if (!response.ok) {
            console.error("🚨 LỖI TỪ MÁY CHỦ GOOGLE:", JSON.stringify(data, null, 2));
            return res.status(500).json({ reply: "Hệ thống AI đang bảo trì, bro đợi lát nhé!" });
        }

        // 4. LẤY KẾT QUẢ VÀ TRẢ VỀ CHO WEB
        const reply = data.candidates[0].content.parts[0].text;
        res.json({ reply });

    } catch (err) {
        console.error("🚨 LỖI SEVER/MẠNG:", err);
        res.status(500).json({ reply: "Mất kết nối vệ tinh AI!" });
    }
});

// Khách hàng gửi đánh giá mới
router.post('/reviews', async (req, res) => {
    const { MaTK, MaSP, SoSao, NoiDung } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('MaTK', sql.Int, MaTK)
            .input('MaSP', sql.Int, MaSP)
            .input('SoSao', sql.Int, SoSao)
            .input('NoiDung', sql.NVarChar, NoiDung)
            .query(`
                INSERT INTO DanhGia (MaTK, MaSP, SoSao, NoiDung, TrangThai) 
                VALUES (@MaTK, @MaSP, @SoSao, @NoiDung, 0)
            `);
        res.json({ message: "Đánh giá đã được gửi và đang chờ kiểm duyệt!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách YÊU THÍCH của người dùng
router.get('/favorites/:maTK', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('maTK', sql.Int, req.params.maTK)
            .query(`
                SELECT sp.* FROM SanPham sp
                JOIN SanPhamYeuThich yt ON sp.MaSP = yt.MaSP
                WHERE yt.MaTK = @maTK
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy danh sách yêu thích", message: err.message });
    }
});

// Toggle Yêu thích (Thêm/Xóa)
router.post('/toggle-favorite', async (req, res) => {
    const { maTK, maSP } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        const check = await pool.request()
            .input('maTK', sql.Int, maTK)
            .input('maSP', sql.Int, maSP)
            .query(`SELECT * FROM SanPhamYeuThich WHERE MaTK = @maTK AND MaSP = @maSP`);

        if (check.recordset.length > 0) {
            await pool.request()
                .input('maTK', sql.Int, maTK)
                .input('maSP', sql.Int, maSP)
                .query(`DELETE FROM SanPhamYeuThich WHERE MaTK = @maTK AND MaSP = @maSP`);
            res.json({ action: 'removed', message: "Đã xóa khỏi danh sách yêu thích" });
        } else {
            await pool.request()
                .input('maTK', sql.Int, maTK)
                .input('maSP', sql.Int, maSP)
                .query(`INSERT INTO SanPhamYeuThich (MaTK, MaSP) VALUES (@maTK, @maSP)`);
            res.json({ action: 'added', message: "Đã thêm vào danh sách yêu thích" });
        }
    } catch (err) {
        res.status(500).json({ error: "Lỗi xử lý yêu thích", message: err.message });
    }
});

// Lấy danh sách đơn hàng của một User
router.get('/orders/:maTK', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('maTK', sql.Int, req.params.maTK)
            .query(`
                SELECT MaDH, NgayDat, TongTien, TrangThai 
                FROM DonHang 
                WHERE MaTK = @maTK 
                ORDER BY NgayDat DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy đơn hàng", message: err.message });
    }
});

// ============================================================
// 2. ROUTE BIẾN ĐỘNG CÓ CHỨA PARAM (Phải để dưới cùng)
// ============================================================

// Lấy danh sách đánh giá ĐÃ ĐƯỢC DUYỆT của 1 sản phẩm
router.get('/:id/reviews', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('MaSP', sql.Int, req.params.id)
            .query(`
                SELECT dg.MaDG, dg.SoSao, dg.NoiDung, dg.NgayDang, tk.HoTen 
                FROM DanhGia dg
                JOIN TaiKhoan tk ON dg.MaTK = tk.MaTK
                WHERE dg.MaSP = @MaSP AND dg.TrangThai = 1
                ORDER BY dg.NgayDang DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chi tiết sản phẩm (Lưu ý: Thằng :id này bắt mọi thứ, PHẢI LUÔN Ở DƯỚI CÙNG)
router.get('/:id', async (req, res) => {
    try {
        if (isNaN(req.params.id)) return res.status(400).json({ error: "ID không hợp lệ" });
        await sql.connect(dbConfig);
        const result = await sql.query(`SELECT * FROM SanPham WHERE MaSP = ${req.params.id}`);
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).json({ error: "Không tìm thấy máy" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy sản phẩm tương tự (ĐÃ FIX THEO CỘT MaDM)
router.get('/similar/:maSP', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);

        // 1. Tìm MaDM của máy hiện tại (Dùng đúng tên cột MaDM)
        const currentLaptop = await pool.request()
            .input('id', sql.Int, req.params.maSP)
            .query(`SELECT MaDM FROM SanPham WHERE MaSP = @id`);

        // Nếu máy không tồn tại hoặc chưa có MaDM (NULL)
        if (currentLaptop.recordset.length === 0 || currentLaptop.recordset[0].MaDM === null) {
            return res.json([]);
        }

        const maDM = currentLaptop.recordset[0].MaDM;

        // 2. Lấy 4 máy khác có cùng MaDM
        const result = await pool.request()
            .input('maDM', sql.Int, maDM)
            .input('currentId', sql.Int, req.params.maSP)
            .query(`
                SELECT TOP 4 * FROM SanPham 
                WHERE MaDM = @maDM AND MaSP <> @currentId
            `);

        res.json(result.recordset);
    } catch (err) {
        // In ra console để bro dễ debug
        console.error("Lỗi SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
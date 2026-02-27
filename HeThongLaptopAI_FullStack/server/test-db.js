require('dotenv').config();
const sql = require('mssql/msnodesqlv8'); // Dùng driver msnodesqlv8

const dbConfig = {
    // localhost\SQLEXPRESS lấy từ .env
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'QLCuaHangLaptop',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true, // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT để dùng Windows Auth
        trustServerCertificate: true,
    }
};

async function testConnection() {
    try {
        console.log("🔍 Đang thử kết nối bằng quyền Windows...");
        await sql.connect(dbConfig);
        console.log("✅ KẾT NỐI THÀNH CÔNG RỰC RỠ!");

        const result = await sql.query("SELECT TOP 1 TenSP FROM SanPham");
        console.log("💻 Dữ liệu mẫu từ DB: " + result.recordset[0].TenSP);

        await sql.close();
    } catch (err) {
        console.error("❌ Lỗi kết nối: " + err.message);
    }
}

testConnection();
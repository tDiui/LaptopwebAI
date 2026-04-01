const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    server: 'localhost\\SQLEXPRESS', // Hoặc tên server của bro
    database: 'QLCuaHangLaptop',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        enableArithAbort: true // Thêm cái này cho ổn định
    }
};

// Khởi tạo kết nối ngay lập tức
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ AI Database Connected!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Connection Failed: ', err.message);
        process.exit(1);
    });

module.exports = { sql, poolPromise };
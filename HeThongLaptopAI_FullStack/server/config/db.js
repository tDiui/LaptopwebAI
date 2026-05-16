const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=QLCuaHangLaptop;Trusted_Connection=Yes;"
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
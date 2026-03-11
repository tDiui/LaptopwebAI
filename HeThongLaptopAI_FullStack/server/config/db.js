const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'QLCuaHangLaptop',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

module.exports = { sql, dbConfig };
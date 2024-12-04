const mysql = require('mysql2');

// Tạo kết nối đến MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Trantuandoan123@',
    database: 'hotel_management_system',
    connectionLimit: 10,
});

// Xuất kết nối để tái sử dụng
module.exports = pool.promise();

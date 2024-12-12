const mysql = require('mysql2/promise');

// Tạo kết nối đến MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USER_ADMIN,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    connectionLimit: 10,
});

let currentConnection = null;

// Create connection
const getConnection = async () => {
    try {
        if (currentConnection) {
            return currentConnection;
        }
    
        const connection = await pool.getConnection();
        currentConnection = connection;
        return currentConnection;
    } catch (err) {
        console.log('Error on connection')
        throw err
    }
};

const beginTransaction = async () => {
    const connection = await getConnection();
    await connection.beginTransaction();
    currentConnection = connection;
    return connection;
};

const commitTransaction = async () => {
    if (currentConnection) {
        await currentConnection.commit();
        currentConnection.release();
        currentConnection = null;
    }
};

const rollbackTransaction = async () => {
    if (currentConnection) {
        await currentConnection.rollback();
        currentConnection.release();
        currentConnection = null;
    }
};

// Xuất kết nối để tái sử dụng
module.exports = {
    getConnection,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
};
const db = require('../../config/db');

// Tìm người dùng bằng email
const findByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Tạo người dùng mới
const createUser = async (email, password) => {
    const [result] = await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
    return result.insertId;
};

module.exports = {
    findByEmail,
    createUser,
};

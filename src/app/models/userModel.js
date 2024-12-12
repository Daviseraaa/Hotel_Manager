const db = require('../../config/db');

// Tìm người dùng bằng email
const findByUsername = async (username) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }
    catch (err) {
        console.error('Error finding user!', err);
        throw err;
    }
};

// Tìm bằng ID
const findByUserID = async (user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [user_id]);
        return rows[0];
    }
    catch (err) {
        console.error('Error finding user!', err);
        throw err;
    }
};

// Tạo người dùng mới
const createUser = async (username, password) => {
    const connection = await db.getConnection()
    try {
        const [result] = await connection.execute('INSERT INTO users (username, hash) VALUES (?, ?)', [username, password]);
        return result.insertId;
    }
    catch (err) {
        console.error('Error creating user!', err);
        throw err;
    }

};

// Thêm thông tin cho người dùng
const addUserinfor = async (user_id ,first_name, last_name, email, phone, address) => {
    const connection = await db.getConnection()
    try {
        const [row] = await connection.execute('INSERT INTO users_infor (user_id, first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [user_id, first_name, last_name, email, phone, address]);
        return row.user_id;
    }
    catch (err) {
        console.error('Error adding user infor!', err);
        throw err;
    }
}

module.exports = {
    findByUsername,
    findByUserID,
    createUser,
    addUserinfor
};
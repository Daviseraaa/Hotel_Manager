const db = require('../../config/db');


// Tạo credit cho một userid
const createCreditUser = async (name, number, user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('INSERT INTO credit_infor (name, number, user_id) VALUES (?, ?, ?)', [name, number, user_id]);
        return rows[0];
    } catch (err) {
        console.log('Error on creating credit');
        throw err;
    }
};

const getCreditsByUserId = async (user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT number, name FROM credit_infor WHERE user_id = ?', [user_id]);
        return rows
    } catch {
        console.log('Error on creating credit');
        throw err;
    }
}

module.exports = {
    createCreditUser,
    getCreditsByUserId
};
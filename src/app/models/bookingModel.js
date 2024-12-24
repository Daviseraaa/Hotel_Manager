const db = require('../../config/db')

const addBooking = async (booking_infor) => {
    const { user_id, room_number, from_time, to_time } = booking_infor;
    const connection  = await db.getConnection()
    try {
        // Thêm dữ liệu vào bảng booking
        const [result] = await connection.execute(
            `INSERT INTO booking (user_id, room_number, from_time, to_time) VALUES (?, ?, ?, ?)`,
            [user_id, room_number, from_time, to_time]
        );
        return result.insertId
    } catch (err) {
        console.log("Error in adding booking");
        throw err
    }
}

const findById = async (booking_id) => {
    const connection  = await db.getConnection()
    try {
        const [booking_infor] = await connection.execute(`SELECT * FROM booking WHERE id = ?`, [booking_id])
        return booking_infor[0]
    } catch (err) {
        console.log("ERROR in get booking infor!")
        throw err
    }
}

const findByUserId = async (userId) => {
    const connection  = await db.getConnection()
    try {
        const [booking_infor] = await connection.execute(`SELECT * FROM booking WHERE user_id = ?`, [userId])
        return booking_infor
    } catch (err) {
        console.log("ERROR in get booking infor!")
        throw err
    }
}

module.exports = {
    addBooking,
    findById,
    findByUserId
}
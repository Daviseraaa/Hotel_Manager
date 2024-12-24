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

const getBooking = async (userId) => {
    const connection  = await db.getConnection()
    try {
        const [bookings] = await connection.execute(`SELECT * FROM booking`)
        return bookings
    } catch (err) {
        console.log("ERROR in get booking infor!")
        throw err
    }
}

const confirmPayment = async (bookingId, amount) => {
    try {
        const connection = await db.beginTransaction();

        const [result] = await connection.execute(
            `UPDATE booking
                SET payment_status = 'paid'
                WHERE id = ? AND payment_status = 'pending'`,
            [bookingId]
        );

        if (result.affectedRows === 0) {
            await db.rollbackTransaction();
            throw err = new Error({ message: 'Đặt phòng không tìm thấy hoặc đã thanh toán.' });
        }

        const [incomeLogResult] = await connection.query(
            `INSERT INTO income_log (income_type, amount, description)
                VALUES (?, ?, ?)`,
            ['room_income', amount, 'Tien thue khach san']
        );

        if (incomeLogResult.affectedRows === 0) {
            await db.rollbackTransaction();
            throw err = new Error({ message: 'Không thể ghi nhận thu nhập.' });
        }

        await db.commitTransaction();
    } catch (err) {
        console.log("ERROR in confirm payment!", err);
        await db.rollbackTransaction();
        throw err;
    }
};

const checkout = async (bookingId) => {
        const connection = await db.beginTransaction();

        const [booking] = await connection.execute(
            `SELECT b.id, b.user_id, b.room_number, b.from_time, b.to_time, ri.type AS room_type
            FROM booking b
            JOIN room r ON b.room_number = r.number
            JOIN room_infor ri ON r.number = ri.room_number
            WHERE b.id = ?`,
            [bookingId]
        );

        if (booking.length === 0) {
            await db.rollbackTransaction();
            return res.status(404).json({ message: 'Đặt phòng không tồn tại.' });
        }

        const bookingInfo = booking[0];
        const income = await calculateTotalAmount(bookingId)

        const [historyResult] = await connection.execute(
            `INSERT INTO history (user_id, user_name, room_number, room_type, from_time, to_time, income)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bookingInfo.user_id, '', bookingInfo.room_number, bookingInfo.room_type, bookingInfo.from_time, bookingInfo.to_time, income]
        );

        const historyId = historyResult.insertId;

        await connection.execute(
            `INSERT INTO history_serve (history_id, service_name, number, income)
             SELECT ?, s.name, sv.number, sv.number * s.price
             FROM serving sv
             JOIN service s ON sv.service_id = s.id
             WHERE sv.booking_id = ?`,
            [historyId, bookingId]
        );

        await connection.execute(
            `DELETE FROM booking WHERE id = ?`,
            [bookingId]
        );

        await db.commitTransaction();
}

const calculateTotalAmount = async (bookingId) => {
    const connection = await db.getConnection()
    try {
        const [booking] = await connection.execute(
            `SELECT b.from_time, b.to_time, ri.hour_price, ri.daily_price
             FROM booking b
             JOIN room r ON b.room_number = r.number
             JOIN room_infor ri ON r.number = ri.room_number
             WHERE b.id = ?`, 
            [bookingId]
        );

        if (booking.length === 0) {
            throw new Error("Booking không tồn tại");
        }

        const { from_time, to_time, hour_price, daily_price } = booking[0];

        const from = new Date(from_time);
        const to = new Date(to_time);

        const diffTime = to.getTime() - from.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        const diffHours = (diffTime % (1000 * 3600 * 24)) / (1000 * 3600);

        let roomCost = 0;
        if (diffDays > 0) {
            roomCost += diffDays * daily_price;
        }
        if (diffHours > 0) {
            roomCost += Math.ceil(diffHours) * hour_price;
        }

        const [services] = await connection.execute(
            `SELECT s.income, sv.number 
             FROM serving sv
             JOIN service s ON sv.service_id = s.id
             WHERE sv.booking_id = ?`,
            [bookingId]
        );

        let serviceCost = 0;
        services.forEach(service => {
            serviceCost += service.income * service.number;
        });

        const totalAmount = roomCost + serviceCost;

        return totalAmount;

    } catch (err) {
        console.error("ERROR calculating total amount", err);
        throw err;
    }
};

const getIncome = async () => {
    const connection = await db.getConnection();
    try {
        const [row] = await connection.execute('SELECT sum(amount) as income FROM income_log')
        return row[0].income
    } catch (err) {
        throw err
    }
}

module.exports = {
    addBooking,
    findById,
    findByUserId,
    getBooking,
    confirmPayment,
    checkout,
    calculateTotalAmount,
    getIncome
}
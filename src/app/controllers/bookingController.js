const bookingModel = require('../models/bookingModel')
const userModel = require('../models/userModel')
const roomModel = require('../models/roomModel')
const creditModel = require('../models/creditModel')
const serviceModel = require('../models/serviceModel')
const paymentModel = require('../models/paymentModel')

const db = require('../../config/db')
const bcrypt = require('bcrypt');

const renderBooking = async (req, res) => {
    const { number } = req.params

    try{
        const room = await roomModel.getRoomDetail(number)
         if (req.session.user) {
            const user_id = req.session.user.id
            
            const user = await userModel.getUserInfor(user_id)
            const credits = await creditModel.getCreditsByUserId(user_id)

            res.render('booking/index', {
                session: req.session,
                user: user,
                room: room,
                credits: credits
            })
        }
        else {
            res.render('booking/index', {
                session: req.session,
                room: room
            });
        }
    } catch (err) {
        console.log("Lỗi khi tải thông tin phòng")
        res.status(500).send(`Lỗi khi tải thông tin phòng ${err.message}`)
    }
}

const handleBooking = async (req, res) => {
    const { number } = req.params // Lấy room_number từ params
    let user_id, password, user_name;

    try {
        await db.beginTransaction(); // Bắt đầu transaction

        // Kiểm tra người dùng đã đăng nhập hay chưa
        if (req.session.user) {
            user_id = req.session.user.id;
        } else {
            // Tạo tài khoản mới nếu người dùng chưa đăng nhập
            do {
                user_name = `user_${Math.random().toString(36).substring(2, 8)}`;
            } while (await userModel.findByUsername(user_name) !== null);

            password = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedPassword = await bcrypt.hash(password, 10);

            const role = 'guest';
            try {
                user_id = await userModel.createUser(user_name, hashedPassword, role);
            } catch (err) {
                console.error("Error creating user:", err.message);
                res.status(500).send(`Lỗi trong quá trình tạo tài khoản! ${err.message}`);
                return;
            }

            // Tạo thông tin thẻ tín dụng, và userinfor
            const { card_number, card_name, expiry_date } = req.body;
            const { first_name, last_name, email, phone, address } = req.body
            try {
                await creditModel.createCreditUser(card_name, card_number, user_id);

                await userModel.addUserinfor(user_id ,{ first_name, last_name, email, phone, address })
            } catch (err) {
                await userModel.deleteByID(user_id); // Xóa người dùng nếu tạo thẻ thất bại
                console.error("Error creating credit:", err.message);
                res.status(500).send(`Lỗi trong quá trình tạo thẻ! ${err.message}`);
                return;
            }
        }

        // Xử lý thông tin đặt phòng
        const { from_time, to_time } = req.body;
        const room_number = number

        if (!from_time || !to_time) {
            res.status(400).send("Missing 'from_time' or 'to_time' in request body.");
            await db.rollbackTransaction();
            return;
        }

        const room = await roomModel.findByNumber(room_number)
        if (room.status === 'busy') {
            await db.rollbackTransaction();
            res.status(500).send(`Lỗi trong quá trình đặt phòng! Phòng đang được thuê!`);
        }
        const result = await bookingModel.addBooking({ user_id, room_number, from_time, to_time });
        await roomModel.editSatus(room_number, 'busy')
        
        await db.commitTransaction(); // Commit nếu mọi thứ thành công

        res.redirect(`/booking/details/${result}?username=${user_name}&password=${password}`)
    } catch (err) {
        console.error("Lỗi trong quá trình đặt phòng:", err.message);
        await db.rollbackTransaction(); // Rollback nếu có lỗi xảy ra
        res.status(500).send(`Lỗi trong quá trình đặt phòng! ${err.message}`);
    }
};

const calculateRoomPrice = (fromTime, toTime, dailyPrice, hourlyPrice) => {
    const fromDate = new Date(fromTime);
    const toDate = new Date(toTime);

    const totalHours = Math.ceil((toDate - fromDate) / (1000 * 60 * 60)); // 1 giờ = 60 phút * 60 giây * 1000ms

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    const total_price = (days * dailyPrice) + (hours * hourlyPrice);

    return {
        days,
        hours,
        total_price,
    };
};


const renderBookingDetails = async (req, res) => {
    const guess = req.query
    const bookingId = req.params.id;
    try {
        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).send("Booking not found");
        }
        const services = await serviceModel.getServicesByBookingId(bookingId);
        console.log(services)
        const user = await userModel.getUserInfor(booking.user_id);
        const credits = await creditModel.getCreditsByUserId(user.id);
        const room = await roomModel.getRoomDetail(booking.room_number);

        const service_total = services.reduce((sum, service) => sum + service.income * service.number, 0);
        const priceDetails = calculateRoomPrice( booking.from_time, booking.to_time, room.daily_price, room.hour_price);
        const total_price = service_total + priceDetails.total_price

        const role = req.session.user ? req.session.user.role : 'guess'
        res.render('booking/details', {
            guess: guess,
            session: req.session,
            role: role,
            user: user,
            credits: credits,
            room: room,
            booking: {
                ...booking,
                total_price: total_price,
            },
            services: services,
            priceDetails
        });
    } catch (err) {
        console.error("Error fetching booking details:", err);
        res.status(500).send("Server Error");
    }
}
const renderManager = async (req, res) => {
    try{
        const bookings = await bookingModel.getBooking()
        console.log(bookings)
        
        res.render('booking/manager', {
            session: req.session,
            bookings: bookings
        });
    } catch (err) {
        console.log("Lỗi khi tải thông tin đặt phòng")
        res.status(500).send(`Lỗi khi tải thông tin đặt phòng ${err.message}`)
    }

}

module.exports = {
    renderBooking,
    handleBooking,
    renderBookingDetails,
    renderManager
}
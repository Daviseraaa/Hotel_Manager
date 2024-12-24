const db = require('../../config/db');
const { banks } = require('../../config/payment');
const helper = require('../../config/helper')
const paymentModel = require('../models/paymentModel')

const renderPayment = async (req, res) => {
    try {
        let { amount ,bankCode, description } = req.query;

        if (!amount) amount = '500000'
        if (!bankCode) bankCode = 'MB'
        if (!description) description = 'Chuyen tien khach san'

        const qr = await paymentModel.generateQRCode(bankCode, amount, description)
        const banks = paymentModel.getBank()
        const bank = paymentModel.getBankInfor(bankCode)
        console.log(bank)
        res.render("payment/index", {
            session: req.session,
            banks: banks,
            qr: qr,
            amount: amount,
            description: description,
            bank: bank,
        });
    } catch (error) {
        console.error("Error rendering payment page:", error.message);
        res.status(500).send("Lỗi trong quá trình tải trang");
    }
}

module.exports = {
    renderPayment
}
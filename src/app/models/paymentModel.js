const paymentConfig = require('../../config/payment');

const generateQRCode = async (bankCode, amount, description) => {
    try {
        const bank = paymentConfig.banks[bankCode];


        const isMask = 0, logo = 0, style = 2, bg = 61;


        const qrUrl = `https://vietqr.co/api/generate/${bankCode}/${bank.accountNumber}/${encodeURIComponent(
            bank.accountHolder
        )}/${amount}/${encodeURIComponent(description)}?isMask=${isMask}&logo=${logo}&style=${style}&bg=${bg}`;

        return qrUrl;
    } catch (error) {
        console.error("Error generating QR URL:", error.message);
        throw new Error("Failed to generate QR URL.");
    }
}

const getBank = () => {
    return paymentConfig.banks
}

const getBankInfor = (bankCode) => {
    try {
        const bank = paymentConfig.banks[bankCode];
        return {
            name: bank.name,
            bankCode: bank.bankCode,
            account_number: bank.accountNumber,
            account_holder: bank.accountHolder,
        };
    } catch (err) {
        console.error("Error in getBankInfo:", err.message);
        throw new Error("Failed to get bank information.");
    }

}

module.exports = {
    generateQRCode,
    getBank,
    getBankInfor,
}
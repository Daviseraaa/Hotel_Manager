const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

module.exports = {
    formatMoney
}
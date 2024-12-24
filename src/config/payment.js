const paymentConfig = {
  banks: {
      MB: {
          name: "MB Bank",
          bankCode: "MB", // Mã ngân hàng
          accountNumber: process.env.MB_ACCOUNT_NUMBER, // Số tài khoản từ biến môi trường
          accountHolder: process.env.MB_ACCOUNT_HOLDER, // Chủ tài khoản từ biến môi trường
      },
      VCB: {
          name: "Vietcombank",
          bankCode: "VCB",
          accountNumber: process.env.VCB_ACCOUNT_NUMBER,
          accountHolder: process.env.VCB_ACCOUNT_HOLDER,
      },
      TCB: {
          name: "Techcombank",
          bankCode: "TCB",
          accountNumber: process.env.TCB_ACCOUNT_NUMBER,
          accountHolder: process.env.TCB_ACCOUNT_HOLDER,
      },
      BIDV: {
          name: "BIDV",
          bankCode: "BIDV",
          accountNumber: process.env.BIDV_ACCOUNT_NUMBER,
          accountHolder: process.env.BIDV_ACCOUNT_HOLDER,
      },
      ACB: {
          name: "ACB",
          bankCode: "ACB",
          accountNumber: process.env.ACB_ACCOUNT_NUMBER,
          accountHolder: process.env.ACB_ACCOUNT_HOLDER,
      },
  },
};

module.exports = paymentConfig;

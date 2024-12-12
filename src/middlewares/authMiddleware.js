const router = require("../routes/authRoutes")

const admin = (req, res, next) => {
    console.log('admin process')
    if (req.session.user.role != process.env.ADMIN) return next('router')
    else next()
}

const user = (req, res, next) => {
    console.log('user process')
    if (!req.session.user) return next('route')
    else next()
}

module.exports = {
    admin,
    user
}
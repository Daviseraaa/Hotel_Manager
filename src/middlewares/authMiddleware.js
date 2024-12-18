const router = require("../routes/authRoutes")

const admin = (req, res, next) => {
    console.log('admin process')
    //loginRequired(req, res, next)
    if (req.session.user.role != process.env.ADMIN) return next('router')
    else next()
}

const user = (req, res, next) => {
    console.log('user process')
    //loginRequired(req, res, next)
    if (!req.session.user) return next('router')
    else next()
}

const loginRequired = (req, res, next) => {
    if (!req.session.user) {
        res.redirect(`/login`)
    } else next()
}

module.exports = {
    admin,
    user,
    loginRequired
}
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/admin/adminRoutes')
const errorHandler = require('./middlewares/errorHandler')

const app = express();

// Session config
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

// Middleware config
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

// Error Handler
app.use(errorHandler);

// Pug config
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'app/views'))

// Router
app.use(authRoutes)
app.use('/user',userRoutes)
app.use('/admin', adminRoutes, (req, res) => {
    res.sendStatus(401)
})

// Server config
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
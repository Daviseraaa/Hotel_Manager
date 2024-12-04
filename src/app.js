const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const authRoutes = require('./routes/authRoutes')

const app = express();

// Session config
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
}))

// Middleware config
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

// Pug config
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'app/views'))

// Router
app.use(authRoutes)

// Server config
const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
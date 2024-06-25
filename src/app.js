import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Order } from './models/Order.js'
import { User } from './models/User.js' // Adjust the path as needed
import { DeletedOrder } from './models/DeletedOrder.js'
import { calculate } from './calculate.js'
import { calculateScore } from './order.js'
import { ensureAuthenticated, ensureNotAuthenticated, ensureOrderOwnership } from './middleware.js'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import session from 'cookie-session'

dotenv.config({
    path: '.env',
})

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username })
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' })
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' })
            }
            return done(null, user)
        } catch (err) {
            return done(err)
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err)
    }
})

const app = express()
app.set('view engine', 'pug')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
    })
)
app.use(passport.initialize())
app.use(passport.session())

await mongoose.connect(process.env.MONGODB).then(() => {
    console.log('--- Connected to MongoDB')
})

app.post('/register', async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username })
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' })
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 8)
        const user = await User.create({
            username: req.body.username,
            password: hashedPassword,
        })

        req.login(user, (err) => {
            if (err) {
                return next(err)
            }
            return res.redirect('/')
        })
    } catch (err) {
        res.status(500).send('Problema nella registrazione')
    }
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.status(401).json({ message: 'Credenziali invalide' })
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            return res.redirect('/')
        })
    })(req, res, next)
})

app.get('/login', ensureNotAuthenticated, (req, res) => {
    const user = req.user
    if (user) {
        res.redirect('/')
    }
    res.render('login')
})

app.get('/register', ensureNotAuthenticated, (req, res) => {
    const user = req.user
    if (user) {
        res.redirect('/')
    }
    res.render('register')
})

const foodNames = {
    roundPizza: 'Pizze tonde',
    salad: 'Insalate',
    kebab: 'Kebab',
    drink: 'Bevande',
    slicedPizza: 'Pizze bianche',
    hotFood: 'Cibo riscaldato',
    other: 'Altri cibi',
}

app.get('/', async (req, res) => {
    const message = req.query.message || ''
    const user = req.user
    let pendingOrders
    user ? (pendingOrders = await Order.countDocuments({ status: 'pending', user_id: user._id })) : (pendingOrders = 0)
    res.render('index', { message, pendingOrders, user })
})

app.post('/calculate', async (req, res) => {
    const user = req.user
    const {
        timeSent,
        peopleCount: peopleCountStr,
        kebabCount: kebabCountStr,
        roundPizzaCount: roundPizzaCountStr,
        saladCount: saladCountStr,
        slicedPizzaCount: slicedPizzaCountStr,
        hotFoodCount: hotFoodCountStr,
    } = req.body

    const peopleCount = parseInt(peopleCountStr)
    const kebabCount = parseInt(kebabCountStr)
    const roundPizzaCount = parseInt(roundPizzaCountStr)
    const saladCount = parseInt(saladCountStr)
    const slicedPizzaCount = parseInt(slicedPizzaCountStr)
    const hotFoodCount = parseInt(hotFoodCountStr)

    const resultValue = await calculate(
        {
            timeSent,
            peopleCount,
            preparation: { weight: 1, variance: 5 },
            orderData: {
                kebab: { count: kebabCount, weight: 5, variance: 2 },
                roundPizza: { count: roundPizzaCount, weight: 6, variance: 3 },
                salad: { count: saladCount, weight: 2, variance: 3 },
                slicedPizza: { count: slicedPizzaCount, weight: 1, variance: 2 },
                hotFood: { count: hotFoodCount, weight: 5, variance: 2 },
                other: {
                    count: peopleCount - (kebabCount + roundPizzaCount + saladCount + hotFoodCount),
                    weight: 3,
                    variance: 1,
                },
                drink: { count: peopleCount, weight: 0, variance: 1 },
            },
            travelTime: { weight: 12, variance: 4 },
            walkTime: { weight: 2, variance: 2 },
            multipliers: { fast: 0.85, slow: 1.1 },
        },
        user
    )
    res.redirect(`/?message=${resultValue}`)
})

app.get('/orders', ensureAuthenticated, async (req, res) => {
    const user = req.user
    try {
        const orders = await Order.find({ user_id: user._id, status: 'pending' })
        res.render('orders', { orders, foodNames, user })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/history', ensureAuthenticated, async (req, res) => {
    const user = req.user
    try {
        const orders = await Order.find({ user_id: user._id, status: 'confirmed' }).sort({ sent_at: -1 }).exec()
        const totalPoints = orders.reduce((sum, order) => sum + (order.points_scored || 0), 0)
        res.render('history', { orders, foodNames, totalPoints, user })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post('/orders/:id/', ensureAuthenticated, ensureOrderOwnership, async (req, res) => {
    try {
        const { id } = req.params
        const { arrived_at, good, status, predicted_time } = req.body
        const [arriveHours, arriveMinutes] = arrived_at.split(':').map(Number)
        const arriveTimestamp = new Date().setHours(arriveHours, arriveMinutes, 0, 0)
        const points_scored = calculateScore({ predicted_time: new Date(predicted_time), arrived_at: new Date(arriveTimestamp) })
        console.log(points_scored)
        await Order.findByIdAndUpdate(id, {
            arrived_at: new Date(arriveTimestamp),
            good,
            correct_prediction: points_scored === 0 ? false : true,
            status,
            points_scored,
        })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

app.delete('/orders/:id/', ensureAuthenticated, ensureOrderOwnership, async (req, res) => {
    try {
        const { id } = req.params
        await Order.findByIdAndDelete(id)
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

app.delete('/softdelete/:id', ensureAuthenticated, ensureOrderOwnership, async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        const deletedOrder = new DeletedOrder(order.toObject())
        await deletedOrder.save()
        await Order.findByIdAndDelete(orderId)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() })
    }
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('--- App is running at http://localhost:%d', port)
    console.log('  Press CTRL-C to stop\n')
})

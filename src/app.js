import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { calculate } from './calculate.js'
import { Order, DeletedOrder, calculateScore } from './order.js'
dotenv.config({
    path: '.env',
})

await mongoose.connect(process.env.MONGODB).then(() => {
    console.log('--- Connected to MongoDB')
})

const app = express()
app.set('view engine', 'pug')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
    const message = req.query.message || ''
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    res.render('index', { message, pendingOrders })
})

app.post('/calculate', async (req, res) => {
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

    const resultValue = await calculate({
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
                count: peopleCount - (kebabCount + roundPizzaCount + saladCount + slicedPizzaCount + hotFoodCount),
                weight: 3,
                variance: 1,
            },
            drink: { count: peopleCount, weight: 0, variance: 1 },
        },
        travelTime: { weight: 12, variance: 4 },
        walkTime: { weight: 3, variance: 2 },
        multipliers: { fast: 0.85, slow: 1.1 },
    })
    res.redirect(`/?message=${resultValue}`)
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

app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().where('status').equals('pending').exec()
        res.render('orders', { orders, foodNames })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/history', async (req, res) => {
    try {
        const orders = await Order.find().where('status').equals('confirmed').sort({ sent_at: -1 }).exec()
        const totalPoints = orders.reduce((sum, order) => sum + (order.points_scored || 0), 0)
        res.render('history', { orders, foodNames, totalPoints })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post('/orders/:id/', async (req, res) => {
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

app.delete('/orders/:id/', async (req, res) => {
    try {
        const { id } = req.params
        await Order.findByIdAndDelete(id)
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

app.delete('/softdelete/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      const deletedOrder = new DeletedOrder(order.toObject());
      await deletedOrder.save();
      await Order.findByIdAndDelete(orderId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.toString() });
    }
  });

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('--- App is running at http://localhost:%d', port)
    console.log('  Press CTRL-C to stop\n')
})

import express from 'express'
import { calculate } from './calculate.js'

const app = express()
app.set('view engine', 'pug')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    const results = req.query.results || ''
    res.render('index', { results })
})

app.post('/calculate', (req, res) => {
    const {
        timeSent,
        peopleCount: peopleCountStr,
        kebabCount: kebabCountStr,
        roundPizzaCount: roundPizzaCountStr,
        saladCount: saladCountStr,
        slicedPizzaCount: slicedPizzaCountStr,
    } = req.body

    const peopleCount = parseInt(peopleCountStr)
    const kebabCount = parseInt(kebabCountStr)
    const roundPizzaCount = parseInt(roundPizzaCountStr)
    const saladCount = parseInt(saladCountStr)
    const slicedPizzaCount = parseInt(slicedPizzaCountStr)

    const params = {
        timeSent,
        peopleCount,
        preparation: { weight: 1, variance: 5 },
        orderData: {
            kebab: { count: kebabCount, weight: 5, variance: 2 },
            roundPizza: { count: roundPizzaCount, weight: 6, variance: 3 },
            salad: { count: saladCount, weight: 2, variance: 3 },
            slicedPizza: { count: slicedPizzaCount, weight: 1, variance: 2 },
            other: {
                count: peopleCount - (kebabCount + roundPizzaCount + saladCount + slicedPizzaCount),
                weight: 3,
                variance: 5,
            },
            drink: { count: peopleCount, weight: 0, variance: 1 },
        },
        travelTime: { weight: 15, variance: 10 },
        walkTime: { weight: 4, variance: 2 },
        multipliers: { fast: 0.85, slow: 1.2 },
    }

    const resultValue = calculate(params)
    res.redirect(`/?results=${resultValue}`)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('--- App is running at http://localhost:%d', port)
    console.log('  Press CTRL-C to stop\n')
})

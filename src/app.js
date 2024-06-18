import express from 'express'
import { calculate } from './calculate.js'

const app = express()
app.set('view engine', 'pug')
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.get('/', function (req, res) {
    let results = req.query.results

    res.render('index', {
        results: results || '',
    })
})

app.post('/calculate', function (req, res) {
    let resultValue

    let params = {
        timeSent: req.body.timeSent,
        peopleCount: parseInt(req.body.peopleCount),
        preparation: {weight: 1, variance: 5},
        orderData: {
            kebab: { count: parseInt(req.body.kebabCount), weight: 5, variance: 2 },
            roundPizza: { count: parseInt(req.body.roundPizzaCount), weight: 6, variance: 3 },
            salad: { count: parseInt(req.body.saladCount), weight: 2, variance: 3 },
            slicedPizza: { count: parseInt(req.body.slicedPizzaCount), weight: 1, variance: 2 },
            other: {
                count: 0,
                weight: 3,
                variance: 5,
                },
            drink: { count: parseInt(req.body.peopleCount), weight: 0, variance: 1 },
        },
        travelTime: { weight: 15, variance: 10},
        walkTime: {weight: 4, variance: 2},
        multipliers: {fast: 0.85, slow: 1.2}
    }

    params.orderData.other.count = params.peopleCount - (params.orderData.kebab.count + params.orderData.roundPizza.count + params.orderData.salad.count)

    resultValue = calculate(params)

    res.redirect('/?results=' + resultValue)
})

const port = process.env.PORT || 3001
app.listen(port)

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

    const params = {
        timeSent: req.body.timeSent,
        peopleCount: parseInt(req.body.peopleCount),
        kebabCount: parseInt(req.body.kebabCount),
        roundPizzaCount: parseInt(req.body.roundPizzaCount),
        saladCount: parseInt(req.body.saladCount),
        slicedPizzaCount: parseInt(req.body.slicedPizzaCount),
    }

    resultValue = calculate(params)

    res.redirect('/?results=' + resultValue)
})

const port = process.env.PORT || 3001
app.listen(port)

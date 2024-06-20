import { insertOrder } from './order.js'

export async function calculate({ timeSent, peopleCount, preparation, orderData, travelTime, walkTime, multipliers }) {
    console.log({ timeSent, peopleCount, preparation, orderData, travelTime, walkTime, multipliers })
    const [hours, minutes] = timeSent.split(':').map(Number)
    console.log('Time the order was sent (h, m) =', hours, minutes)
    if (minutes < 0 || minutes > 59 || hours < 0 || hours > 23 || minutes == undefined || hours == undefined || minutes == NaN || hours == NaN) {
        return 'Orario fatto male uddio'
    }
    if (orderData.other.count < 0) {
        console.error('Wrong order count')
        return 'Numero di cibo superiore al numero di persone, stai a trollà'
    }
    if (peopleCount <= 0) {
        console.error('No people are ordering')
        return 'Oggi non si mangia'
    }

    //insert order in database
    await insertOrder({
        food: orderData,
        sent_at: timeSent,
        status: 'pending',
        good: false,
        predicted: false
    })

    //half round pizza count to account for oven size
    orderData.roundPizza.count = Math.ceil(orderData.roundPizza.count / 2);

    let minutesToAdd = 0
    const calculateAdditionalMinutes = (weight, variance) => {
        const random = getRandomInt(0, variance)
        return { value: weight + random, random: random }
    }
    const logAndAddMinutes = (context, weight, variance) => {
        const minutesCalculation = calculateAdditionalMinutes(weight, variance)
        minutesToAdd += minutesCalculation.value
        console.log(`${context}: adding ${minutesCalculation.value} (${weight} + ${minutesCalculation.random}) minutes\nTotal minutes: ${minutesToAdd}`)
    }

    // Start preparing order
    logAndAddMinutes('Order received! Sending it to the kitchen', preparation.weight, preparation.variance)
    // Prepare food and drinks
    for (let foodName in orderData) {
        let food = orderData[foodName]
        for (let i = 0; i < food.count; i++) {
            logAndAddMinutes(`Preparing one ${foodName}`, food.weight, food.variance)
        }
    }
    // Get order ready
    logAndAddMinutes('Order done! Packing your food up', preparation.weight, preparation.variance)
    // Car time
    logAndAddMinutes('Moving from Casal Bertone to WiNK office by scooter', travelTime.weight, travelTime.variance)
    // Walking to office
    logAndAddMinutes('Almost here! Walking to your office', walkTime.weight, walkTime.variance)
    // Speed multiplier
    const speed = getRandomInt(0, 2)
    console.log('Speed multiplier: ' + (speed === 0 ? 'none' : speed === 1 ? 'faster' : 'slower') + ' (' + speed + ')')
    if (speed !== 0) {
        const multiplier = speed === 1 ? multipliers.fast : multipliers.slow
        const newTime = Math.floor(minutesToAdd * multiplier)
        console.log(`${speed === 1 ? 'Fast' : 'Slow'} = ${minutesToAdd} * ${multiplier} = ${newTime}`)
        minutesToAdd = newTime
    }

    console.log(`Order simulation complete! Final minutes calculated = ${minutesToAdd}`)
    const finalTime = calculateTime(hours, minutes, minutesToAdd)

    return finalTime
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function calculateTime(hours, minutes, minutesToAdd) {
    const currentDate = new Date()
    currentDate.setHours(hours, minutes, 0, 0)
    let timestamp = Math.floor(currentDate.getTime() / 1000)

    console.log(`Adding ${minutesToAdd} minutes to when the order was sent...`)
    timestamp += minutesToAdd * 60

    const date = new Date(timestamp * 1000)
    const formattedDate = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
    const formattedTime = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

    console.log(`... your food will arrive at ${formattedDate}, ${formattedTime}`)
    return `Il tuo cibo arriverà a questo orario: ${formattedDate}, ${formattedTime}`
}

export function calculate(params) {
    let minutesToAdd = 0
    let finalTime
    let random = 0
    let additionalMinutes = 0
    console.log(params)

    if (params.orderData.other.count < 0) {
        console.log('Wrong order count')
        return 'Numero di cibo superiore al numero di persone, stai a trollà'
    }

    //Start preparing order
    random = getRandomInt(0, params.preparation.variance)
    additionalMinutes = params.preparation.weight + random
    minutesToAdd += additionalMinutes
    console.log(
        `Order received! Sending it to the kitchen: adding ${additionalMinutes} (${params.preparation.weight} + ${random}) minutes\nTotal minutes: ${minutesToAdd}`
    )

    //Prepare food and drinks
    for (var foodName in params.orderData) {
        var food = params.orderData[foodName]
        for (let i = 0; i < food.count; i++) {
            random = getRandomInt(0, food.variance)
            additionalMinutes = food.weight + random
            minutesToAdd += additionalMinutes
            console.log(`Preparing one ${foodName}, adding ${additionalMinutes} (${food.weight} + ${random}) minutes\nTotal minutes: ${minutesToAdd}`)
        }
    }

    //Get order ready
    random = getRandomInt(0, params.preparation.variance)
    additionalMinutes = params.preparation.weight + random
    minutesToAdd += additionalMinutes
    console.log(
        `Order done! Packing your food up: adding ${additionalMinutes} (${params.preparation.weight} + ${random}) minutes\nTotal minutes: ${minutesToAdd}`
    )

    //Car time
    random = getRandomInt(0, params.travelTime.variance)
    additionalMinutes = params.travelTime.weight + random
    minutesToAdd += additionalMinutes
    console.log(
        `Moving from Casal Bertone to WiNK office by car: adding ${additionalMinutes} (${params.travelTime.weight} + ${random}) minutes\nTotal minutes: ${minutesToAdd}`
    )

    //Walking to office
    random = getRandomInt(0, params.walkTime.variance)
    additionalMinutes = params.walkTime.weight + random
    minutesToAdd += additionalMinutes
    console.log(
        `Almost here! Walking to your office: adding ${additionalMinutes} (${params.walkTime.weight} + ${random}) minutes\nTotal minutes: ${minutesToAdd}`
    )

    let speed = getRandomInt(0, 2)
    console.log('Speed multiplier: ' + (speed === 0 ? 'none' : speed === 1 ? 'faster' : 'slower') + ' (' + speed + ')')

    if (speed === 1) {
        let newTime = Math.floor(minutesToAdd * params.multipliers.fast)
        console.log(`Fast = ${minutesToAdd}` + ' * ' + `${params.multipliers.fast} =`, newTime)
        minutesToAdd = newTime
    } else if (speed === 2) {
        let newTime = Math.floor(minutesToAdd * params.multipliers.slow)
        console.log(`Slow = ${minutesToAdd}` + ' * ' + `${params.multipliers.slow} =`, newTime)
        minutesToAdd = newTime
    }

    console.log(`Order simulation complete! Final minutes calculated = ${minutesToAdd}`)
    finalTime = calculateTime(params.timeSent, minutesToAdd)
    return finalTime
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function calculateTime(timeSent, minutesToAdd) {
    const [hours, minutes] = timeSent.split(':').map(Number)
    console.log('Time the order was sent (h, m) =', hours, minutes)
    if (minutes < 0 || minutes > 59 || hours < 0 || hours > 23 || minutes == undefined || hours == undefined) {
        return 'Orario fatto male uddio'
    }
    const currentDate = new Date()
    currentDate.setHours(hours, minutes, 0, 0)
    let timestamp = Math.floor(currentDate.getTime() / 1000)

    console.log(`Adding ${minutesToAdd} minutes to when the order was sent...`)
    timestamp += minutesToAdd * 60

    const date = new Date(timestamp * 1000)
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
    }
    const formattedDate = date.toLocaleDateString('it-IT', dateOptions)
    const formattedTime = date.toLocaleTimeString('it-it', timeOptions)

    console.log(`... your food will arrive at ${formattedDate}, ${formattedTime}`)
    return `${formattedDate}, ${formattedTime}`
}

export function calculate(params) {
    let minutesToAdd = 0
    let finalTime
    let otherOrders = params.peopleCount - (params.kebabCount + params.roundPizzaCount + params.saladCount)
    console.log(params)
    console.log(params.kebabCount + params.roundPizzaCount + params.saladCount)

    if (!params.timeSent) {
        finalTime = "Non hai inserito l'orario d'invio"
    } else if (params.kebabCount + params.roundPizzaCount + params.saladCount > params.peopleCount) {
        finalTime = 'Numero di cibo superiore al numero di persone, stai a trollà'
    } else {
        minutesToAdd += (7 + getRandomInt(2)) * params.kebabCount
        minutesToAdd += (9 + getRandomInt(5)) * params.roundPizzaCount
        minutesToAdd += (3 + getRandomInt(3)) * params.saladCount
        minutesToAdd += (1 + getRandomInt(3)) * params.slicedPizzaCount
        minutesToAdd += 15 + getRandomInt(4) //car time
        minutesToAdd += (3 + getRandomInt(6)) * otherOrders

        let isFast = getRandomInt(1)
        console.log("isFast", isFast)
        if (!!isFast) {
            minutesToAdd = Math.floor(minutesToAdd * 0.9)
            console.log('fast triggered', minutesToAdd)
        }

        finalTime = calculateTime(params.timeSent, minutesToAdd)
    }

    return finalTime
}

function getRandomInt(max) {
    let random = Math.floor(Math.random() * max)
    console.log(random)
    return random
}

function calculateTime(timeSent, minutesToAdd) {
    const [hours, minutes] = timeSent.split(':').map(Number)
    console.log("time", hours, minutes)
    if (minutes < 0 || minutes > 59 || hours < 0 || hours > 23 || minutes == undefined || hours == undefined) {
        return 'Orario fatto male uddio'
    }
    const currentDate = new Date()
    currentDate.setHours(hours, minutes, 0, 0)
    let timestamp = Math.floor(currentDate.getTime() / 1000)

    timestamp += minutesToAdd * 60

    const date = new Date(timestamp * 1000)
    console.log("date", date)
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

    return `${formattedDate}, ${formattedTime}`
}

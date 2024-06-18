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
        minutesToAdd += (1 + getRandomInt(0, 1)) //start preparing order
        console.log(minutesToAdd)
        minutesToAdd += (7 + getRandomInt(0, 1)) * params.kebabCount
        console.log(minutesToAdd)
        minutesToAdd += (9 + getRandomInt(0, 4)) * params.roundPizzaCount
        console.log(minutesToAdd)
        minutesToAdd += (3 + getRandomInt(0, 2)) * params.saladCount
        console.log(minutesToAdd)
        minutesToAdd += (1 + getRandomInt(0, 2)) * params.slicedPizzaCount
        console.log(minutesToAdd)
        minutesToAdd += (3 + getRandomInt(0, 5)) * otherOrders
        console.log(minutesToAdd)
        minutesToAdd += (1 + getRandomInt(0, 1)) * params.peopleCount //get the drinks
        console.log(minutesToAdd)
        minutesToAdd += (1 + getRandomInt(0, 1)) //get order ready to go
        console.log(minutesToAdd)
        minutesToAdd += (15 + getRandomInt(0, 10)) //car time
        console.log(minutesToAdd)
        minutesToAdd += (4 + getRandomInt(0, 2)) //walk to the office
        console.log(minutesToAdd)

        let speed = getRandomInt(0, 2)
        console.log("speed", speed)

        if (speed === 1) {
            minutesToAdd = Math.floor(minutesToAdd * 0.9)
            console.log('fast triggered', minutesToAdd)
        } else if (speed === 2) {
            minutesToAdd = Math.floor(minutesToAdd * 1.2)
            console.log('slow triggered', minutesToAdd)
        } else if (speed === 0) {
            console.log("no speed change")
        }

        console.log("final minutes count", minutesToAdd)

        finalTime = calculateTime(params.timeSent, minutesToAdd)
    }

    return finalTime
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
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

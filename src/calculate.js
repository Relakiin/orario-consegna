export function calculate(params) {
    console.log(params);
    if (params.orderData.other.count < 0) {
        console.log('Wrong order count');
        return 'Numero di cibo superiore al numero di persone, stai a trollà';
    }

    let minutesToAdd = 0;

    const calculateAdditionalMinutes = (weight, variance) => {
        const random = getRandomInt(0, variance);
        return {value: weight + random, random: random};
    };

    const logAndAddMinutes = (context, weight, variance) => {
        const minutesCalculation = calculateAdditionalMinutes(weight, variance);
        minutesToAdd += minutesCalculation.value;
        console.log(`${context}: adding ${minutesCalculation.value} (${weight} + ${minutesCalculation.random}) minutes\nTotal minutes: ${minutesToAdd}`);
    };

    // Start preparing order
    logAndAddMinutes('Order received! Sending it to the kitchen', params.preparation.weight, params.preparation.variance);

    // Prepare food and drinks
    for (let foodName in params.orderData) {
        let food = params.orderData[foodName];
        for (let i = 0; i < food.count; i++) {
            logAndAddMinutes(`Preparing one ${foodName}`, food.weight, food.variance);
        }
    }

    // Get order ready
    logAndAddMinutes('Order done! Packing your food up', params.preparation.weight, params.preparation.variance);

    // Car time
    logAndAddMinutes('Moving from Casal Bertone to WiNK office by car', params.travelTime.weight, params.travelTime.variance);

    // Walking to office
    logAndAddMinutes('Almost here! Walking to your office', params.walkTime.weight, params.walkTime.variance);

    // Speed multiplier
    const speed = getRandomInt(0, 2);
    console.log('Speed multiplier: ' + (speed === 0 ? 'none' : speed === 1 ? 'faster' : 'slower') + ' (' + speed + ')');
    if (speed !== 0) {
        const multiplier = speed === 1 ? params.multipliers.fast : params.multipliers.slow;
        const newTime = Math.floor(minutesToAdd * multiplier);
        console.log(`${speed === 1 ? 'Fast' : 'Slow'} = ${minutesToAdd} * ${multiplier} = ${newTime}`);
        minutesToAdd = newTime;
    }

    console.log(`Order simulation complete! Final minutes calculated = ${minutesToAdd}`);
    const finalTime = calculateTime(params.timeSent, minutesToAdd);
    return finalTime;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateTime(timeSent, minutesToAdd) {
    const [hours, minutes] = timeSent.split(':').map(Number);
    console.log('Time the order was sent (h, m) =', hours, minutes);
    if (minutes < 0 || minutes > 59 || hours < 0 || hours > 23 || minutes == undefined || hours == undefined) {
        return 'Orario fatto male uddio';
    }

    const currentDate = new Date();
    currentDate.setHours(hours, minutes, 0, 0);
    let timestamp = Math.floor(currentDate.getTime() / 1000);

    console.log(`Adding ${minutesToAdd} minutes to when the order was sent...`);
    timestamp += minutesToAdd * 60;

    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    console.log(`... your food will arrive at ${formattedDate}, ${formattedTime}`);
    return `${formattedDate}, ${formattedTime}`;
}

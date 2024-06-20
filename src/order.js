import mongoose from 'mongoose'
const orderSchema = new mongoose.Schema({
    food: {
        type: Object,
        required: true
    },
    sent_at: {
        type: Date,
        required: true
    },
    arrived_at: {
        type: Date,
    },
    good: {
        type: Boolean,
    },
    predicted: {
        type: Boolean,
    },
    status: {
        type: String
    }
})
export const Order = mongoose.model('Order', orderSchema)

export async function insertOrder({food, sent_at, arrived_at, good, predicted, status}) {
    let sentTimestamp;
    let arriveTimestamp;
    if (arrived_at) {
        const [arriveHours, arriveMinutes] = arrived_at.split(':').map(Number)
        arriveTimestamp = new Date().setUTCHours(arriveHours, arriveMinutes, 0, 0)
        arrived_at = new Date(arriveTimestamp)
    }
    const [sentHours, sentMinutes] = sent_at.split(':').map(Number)
    sentTimestamp = new Date().setUTCHours(sentHours, sentMinutes, 0, 0)

    sent_at = new Date(sentTimestamp)

    const order = new Order({ food, sent_at, good, predicted, status })

    try {
        await order.save()
    } catch (error) {
        console.error(error)
        return "Errore nell'inserimento nel db, contatta il demone"
    }
}
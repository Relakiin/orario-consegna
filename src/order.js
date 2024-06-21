import mongoose from 'mongoose'
const orderSchema = new mongoose.Schema({
    food: {
        type: Object,
        required: true,
    },
    sent_at: {
        type: Date,
        required: true,
    },
    arrived_at: {
        type: Date,
    },
    predicted_time: {
        type: Date,
    },
    good: {
        type: Boolean,
    },
    correct_prediction: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    points_scored: {
        type: Number
    }
})
export const Order = mongoose.model('Order', orderSchema)

const deletedOrderSchema = new mongoose.Schema({
    food: {
        type: Object,
        required: true,
    },
    sent_at: {
        type: Date,
        required: true,
    },
    arrived_at: {
        type: Date,
    },
    predicted_time: {
        type: Date,
    },
    good: {
        type: Boolean,
    },
    correct_prediction: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    points_scored: {
        type: Number
    }
})
export const DeletedOrder = mongoose.model('DeletedOrder', deletedOrderSchema)

export async function insertOrder({ food, sent_at, predicted_time, good, correct_prediction, status }) {
    sent_at = new Date(sent_at * 1000)
    predicted_time = new Date(predicted_time * 1000)

    const order = new Order({ food, sent_at, good, correct_prediction, status, predicted_time })

    try {
        await order.save()
    } catch (error) {
        console.error(error)
        return "Errore nell'inserimento nel db, contatta il demone"
    }
}

export function calculateScore({predicted_time, arrived_at}) {

    let differenceInMillis = Math.abs(predicted_time - arrived_at);
    let differenceInMinutes = Math.floor(differenceInMillis / 60000);

    if (differenceInMinutes === 0) {
        return 3;
    } else if (differenceInMinutes <= 1) {
        return 2;
    } else if (differenceInMinutes <= 2) {
        return 1;
    } else {
        return 0;
    }
}


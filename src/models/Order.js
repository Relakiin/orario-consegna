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
        type: Number,
    },
    user_id: {
        type: mongoose.Schema.ObjectId
    }
})
export const Order = mongoose.model('Order', orderSchema)

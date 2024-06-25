import { Order } from "./models/Order.js"

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

export function ensureNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/') // Redirect to home if already logged in
    }
    next()
}

export async function ensureOrderOwnership(req, res, next) {
    try {
        const orderId = req.params.id // Assuming the order ID is passed as a URL parameter
        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).send('Order not found.')
        }

        // Check if the current logged-in user owns the order
        if (order.user_id.toString() === req.user._id.toString()) {
            next()
        } else {
            res.status(403).send('You do not have permission to access this order.')
        }
    } catch (err) {
        res.status(500).send('Server error while validating order ownership.')
    }
}
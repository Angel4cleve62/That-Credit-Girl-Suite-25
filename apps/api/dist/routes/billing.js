import { Router } from 'express';
import Stripe from 'stripe';
import { usersById } from '../middleware/auth.js';
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
export const billingRouter = Router();
billingRouter.post('/create-checkout', async (req, res) => {
    if (!stripe)
        return res.status(500).json({ error: 'Stripe not configured' });
    const { userId, priceId } = req.body;
    const user = usersById[userId];
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        customer_email: user.email,
    });
    res.json({ url: session.url });
});
billingRouter.post('/webhook', async (req, res) => {
    res.json({ received: true });
});

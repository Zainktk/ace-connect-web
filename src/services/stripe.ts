import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key or use env var
const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY || 'pk_test_51O...'; // Placeholder

export const stripePromise = loadStripe(STRIPE_KEY);

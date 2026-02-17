import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../services/stripe';
import { Button } from './Button';
import api from '../services/api';

const CheckoutForm = ({ clientSecret, onSuccess, onCancel }: { clientSecret: string, onSuccess: () => void, onCancel: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/dashboard', // Redirect after payment
            },
            redirect: "if_required" // Handle redirect manually if needed, or stick to this
        });

        if (submitError) {
            setError(submitError.message || 'Payment failed');
            setProcessing(false);
        } else {
            // Payment succeeded
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={processing} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={!stripe || processing} isLoading={processing} className="flex-1">
                    Pay & Join
                </Button>
            </div>
        </form>
    );
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: number;
    amount: number;
    eventTitle: string;
}

export const PaymentModal = ({ isOpen, onClose, eventId, amount, eventTitle }: PaymentModalProps) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Initialize payment intent when modal opens
    React.useEffect(() => {
        if (isOpen && !clientSecret) {
            initializePayment();
        }
    }, [isOpen]);

    const initializePayment = async () => {
        setLoading(true);
        try {
            const response = await api.post('/payments/pay-event', {
                eventId,
                amount
            });
            setClientSecret(response.data.clientSecret);
        } catch (error) {
            console.error('Failed to init payment:', error);
            alert('Failed to start payment session');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Join Event: {eventTitle}</h2>
                <p className="text-gray-600 mb-6">Total: <span className="font-bold text-green-700">${amount}</span></p>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            onSuccess={() => {
                                alert('Payment Successful! You have joined the event.');
                                onClose();
                                window.location.reload(); // Refresh to show updated status
                            }}
                            onCancel={onClose}
                        />
                    </Elements>
                ) : (
                    <div className="text-red-500">Failed to load payment form.</div>
                )}
            </div>
        </div>
    );
};

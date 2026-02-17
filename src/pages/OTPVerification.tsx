import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const OTPVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth(); // We might use this after verification if we auto-login, but typically we just redirect to login

    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/verify-otp', { email, otp });
            // Success!
            setMessage('Account verified successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/resend-otp', { email });
            setMessage('A new code has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Error</h2>
                    <p className="text-gray-600 mb-4">No email provided for verification.</p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
                    <p className="text-gray-600 mt-2">
                        We sent a 6-digit code to <span className="font-semibold">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleVerify}>
                    <Input
                        label="Enter 6-digit Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="text-center text-2xl tracking-widest"
                    />

                    <Button type="submit" className="w-full mt-4" isLoading={loading}>
                        Verify Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResend}
                        className="text-green-600 font-semibold hover:text-green-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        Resend Code
                    </button>
                </div>

                <div className="mt-4 text-center text-sm">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

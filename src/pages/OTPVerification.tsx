import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const OTPVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { } = useAuth(); // We might use this after verification if we auto-login, but typically we just redirect to login

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
            <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
                <div className="text-center glass p-10 rounded-[2.5rem] border border-zinc-800/50">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">System Error</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-4">No mission parameters found.</p>
                    <Button onClick={() => navigate('/login')} variant="neon" className="mt-8 px-10 py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px]">
                        RETURN TO BASE
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ccff00]/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full glass rounded-[2.5rem] p-10 border border-zinc-800/50 shadow-2xl relative">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Initialize</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">
                        COMMS SENT TO <span className="text-white">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] p-4 rounded-2xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <Input
                        label="6-DIGIT ENCRYPTION CODE"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        required
                        className="text-center text-3xl font-black italic tracking-[0.5em] h-20 bg-zinc-950/50"
                    />

                    <Button type="submit" variant="neon" className="w-full h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs" isLoading={loading}>
                        VERIFY & AUTHENTICATE
                    </Button>
                </form>

                <div className="mt-10 text-center flex flex-col gap-4">
                    <button
                        onClick={handleResend}
                        className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-[#ccff00] transition-colors disabled:opacity-30"
                        disabled={loading}
                    >
                        RESEND COMMS CODE
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-[10px] text-zinc-700 font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        ABORT & LOGIN
                    </button>
                </div>
            </div>
        </div>
    );
};

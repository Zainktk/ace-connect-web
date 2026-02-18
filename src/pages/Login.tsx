import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            login(token, user);

            // Redirect based on role or profile completeness
            navigate('/dashboard');
        } catch (err: any) {
            if (err.response?.data?.requiresVerification) {
                // Redirect to OTP page
                navigate('/verify-otp', { state: { email } });
            }
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-zinc-950">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ccff00]/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full glass rounded-[2.5rem] p-10 border border-zinc-800/50 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black tracking-[0.2em] text-[#ccff00] mb-4 uppercase">
                        Welcome Back
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">ACE CONNECT</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-3">Elite Matchmaking Hub</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Identity (Email)"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="athlete@aceconnect.me"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Access Key"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" variant="neon" className="w-full py-4 rounded-2xl font-black italic uppercase tracking-widest mt-4" isLoading={loading}>
                        LOG IN NOW
                    </Button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        New to the circuit?{' '}
                        <Link to="/register" className="text-[#ccff00] hover:text-[#a3e635] transition-colors ml-1 underline decoration-2 underline-offset-4">
                            CREATE PRO ACCOUNT
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

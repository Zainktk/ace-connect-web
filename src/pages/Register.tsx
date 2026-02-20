import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { MapPicker } from '../components/MapPicker';

export const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'player' as 'player' | 'organizer',
        gender: 'male',
        skillLevel: '3.5', // Default intermediate
        yearsExperience: '1',
        bio: '',
        location: '',
        latitude: 0,
        longitude: 0,
        termsAccepted: false
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Register User (Send name and ntrpRating here as backend expects)
            const registerRes = await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                name: formData.name,
                ntrpRating: parseFloat(formData.skillLevel),
                location: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude
            });

            const { user, token } = registerRes.data;

            // 2. Update Profile (for Bio and other fields)
            if (formData.bio) {
                try {
                    // Let's login immediately so the API interceptor has the token
                    login(token, user);

                    // Now update profile
                    await api.put('/profile', {
                        bio: formData.bio,
                        // Gender and YearsExperience are not currently supported by backend, skipping
                    });

                    navigate('/dashboard');
                    return; // Exit here as we navigated

                } catch (profileError: any) {
                    console.error('Profile update failed:', profileError);
                    // Continue to dashboard anyway
                }
            }

            // 3. Redirect to Verification instead of Login
            // login(token, user); // Only login after verification
            navigate('/verify-otp', { state: { email: formData.email } });

        } catch (err: any) {
            console.error('Registration error:', err);
            // Construct a more detailed error message
            let errorMessage = 'Registration failed';
            if (err.response) {
                // Server responded with an error
                errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request made but no response received
                errorMessage = 'Network Error: Cannot connect to server. Please check your internet or try again later.';
            } else {
                // Something happened in setting up the request
                errorMessage = err.message || 'Unknown error occurred';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-zinc-950">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ccff00]/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ccff00]/5 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-xl w-full glass rounded-[3rem] p-10 border border-zinc-800/50 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black tracking-[0.2em] text-[#ccff00] mb-4 uppercase">
                        Drafting Now
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">JOIN THE ELITE</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-3">Start your journey with ACE CONNECT</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Toggle */}
                    <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 mb-8">
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'player' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setFormData({ ...formData, role: 'player' })}
                        >
                            ATHLETE
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'organizer' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setFormData({ ...formData, role: 'organizer' })}
                        >
                            PROMOTER
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Input
                            label="Athlete Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <Input
                        label="Security Key"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                    />

                    {formData.role === 'player' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Select
                                    label="Gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    options={[
                                        { label: 'Male', value: 'male' },
                                        { label: 'Female', value: 'female' },
                                        { label: 'Other', value: 'other' }
                                    ]}
                                />
                                <Select
                                    label="NTRP Skill Pool"
                                    name="skillLevel"
                                    value={formData.skillLevel}
                                    onChange={handleChange}
                                    options={[
                                        { label: '1.5 (Beginner)', value: '1.5' },
                                        { label: '2.0', value: '2.0' },
                                        { label: '2.5', value: '2.5' },
                                        { label: '3.0', value: '3.0' },
                                        { label: '3.5 (Intermediate)', value: '3.5' },
                                        { label: '4.0', value: '4.0' },
                                        { label: '4.5 (Advanced)', value: '4.5' },
                                        { label: '5.0+', value: '5.0' }
                                    ]}
                                />
                            </div>

                            <Input
                                label="Tour Experience (Years)"
                                type="number"
                                name="yearsExperience"
                                value={formData.yearsExperience}
                                onChange={handleChange}
                                min="0"
                                required
                            />

                            <div className="pt-4 border-t border-zinc-900">
                                <MapPicker
                                    onLocationSelect={(lat, lng, addr) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            latitude: lat,
                                            longitude: lng,
                                            location: addr
                                        }));
                                    }}
                                />
                                {!formData.latitude && (
                                    <p className="text-[10px] text-red-500 font-bold mt-2 uppercase text-center">
                                        Please set your "Home Base" on the map to continue
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {formData.role === 'organizer' && (
                        <div className="bg-[#ccff00]/5 p-5 rounded-2xl mb-4 border border-[#ccff00]/20">
                            <p className="text-[#ccff00] text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                <span className="mr-2">⚡</span> Promoter Status Detected: You will have access to event creation, entry management, and automated payout systems.
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="neon"
                        className="w-full py-4 rounded-2xl font-black italic uppercase tracking-widest"
                        isLoading={loading}
                        disabled={formData.role === 'player' && (!formData.latitude || !formData.longitude)}
                    >
                        FINALIZE DRAFT
                    </Button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        Already in the system?{' '}
                        <Link to="/login" className="text-[#ccff00] hover:text-[#a3e635] transition-colors ml-1 underline decoration-2 underline-offset-4">
                            AUTH NOW
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

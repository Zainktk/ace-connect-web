import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

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
                name: formData.name, // Required by backend
                ntrpRating: parseFloat(formData.skillLevel) // Backend expects float
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
                errorMessage = 'Network Error: Only ensure backend is running at http://localhost:3000';
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Join AceConnect</h1>
                    <p className="text-gray-600 mt-2">Create your free account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Role Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.role === 'player' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
                            onClick={() => setFormData({ ...formData, role: 'player' })}
                        >
                            Player
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.role === 'organizer' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
                            onClick={() => setFormData({ ...formData, role: 'organizer' })}
                        >
                            Organizer
                        </button>
                    </div>

                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                    />

                    {formData.role === 'player' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
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
                                    label="Skill Level (NTRP)"
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
                                label="Years of Experience"
                                type="number"
                                name="yearsExperience"
                                value={formData.yearsExperience}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </>
                    )}

                    {formData.role === 'organizer' && (
                        <div className="bg-green-50 p-4 rounded-lg mb-4 text-sm text-green-800 border border-green-200">
                            <span className="font-bold">Organizer Account:</span> You will be able to create tournaments, manage entries, and collect payments.
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-4" isLoading={loading}>
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

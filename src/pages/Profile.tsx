import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { XPProgress } from '../components/XPProgress';
import { LevelBadge } from '../components/LevelBadge';
import { MapPicker } from '../components/MapPicker';

export const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
        ntrpRating: '',
        photoUrl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                latitude: user.latitude || null,
                longitude: user.longitude || null,
                ntrpRating: user.ntrpRating?.toString() || '',
                photoUrl: user.photoUrl || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const payload: any = {
            name: formData.name,
            bio: formData.bio,
            location: formData.location,
            latitude: formData.latitude,
            longitude: formData.longitude,
        };

        const rating = parseFloat(formData.ntrpRating);
        if (!isNaN(rating)) {
            payload.ntrpRating = rating;
        }

        if (formData.photoUrl) {
            payload.photoUrl = formData.photoUrl;
        }

        try {
            const response = await api.put('/profile', payload);

            updateUser({
                ...user!,
                ...response.data
            });

            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            console.error('Update Profile Error:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header & Bio Section */}
            <div className="glass rounded-[2.5rem] p-8 border border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-[#ccff00]/5 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-3xl overflow-hidden border-2 border-zinc-800 bg-zinc-900 shadow-2xl">
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-5xl bg-zinc-900">👤</div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <LevelBadge level={user.level || 1} className="scale-125 origin-bottom-right" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{user.name || 'ACE PLAYER'}</h1>
                            <div className="mx-auto md:mx-0 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                                PRO ACCOUNT
                            </div>
                        </div>

                        <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                            {user.bio || "No bio yet. Tell the community about your tennis journey and style of play!"}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">NTRP</p>
                                <p className="text-white font-black text-lg">{user.ntrpRating || '0.0'}</p>
                            </div>
                            <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Karma</p>
                                <p className="text-[#ccff00] font-black text-lg italic">5.0 ★</p>
                            </div>
                            <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Location</p>
                                <p className="text-white font-black text-lg">{user.location || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-10 border-t border-zinc-800/50">
                    <XPProgress xp={user.xp || 0} level={user.level || 1} />
                </div>
            </div>

            {/* Achievement / Stats Grid (Placeholder for now) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass border border-zinc-800 p-6 rounded-[2rem] text-center">
                    <div className="text-3xl mb-2 grayscale opacity-30">🏆</div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Tournaments Won</p>
                    <p className="text-white font-black text-2xl">0</p>
                </div>
                <div className="glass border border-zinc-800 p-6 rounded-[2rem] text-center">
                    <div className="text-3xl mb-2 grayscale opacity-30">🔥</div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Win Streak</p>
                    <p className="text-white font-black text-2xl">0</p>
                </div>
                <div className="glass border border-zinc-800 p-6 rounded-[2rem] text-center">
                    <div className="text-3xl mb-2 grayscale opacity-30">🎾</div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Matches Played</p>
                    <p className="text-white font-black text-2xl">0</p>
                </div>
            </div>

            {/* Actions / Edit Form */}
            <div className="glass border border-zinc-800 p-8 rounded-[2rem]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Player Settings</h2>
                    {!isEditing && (
                        <Button variant="neon" size="sm" onClick={() => setIsEditing(true)}>
                            Edit Identity
                        </Button>
                    )}
                </div>

                {message && <div className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-sm font-bold p-4 rounded-2xl mb-6">{message}</div>}
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold p-4 rounded-2xl mb-6">{error}</div>}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            <Input label="NTRP Rating" type="number" step="0.5" name="ntrpRating" value={formData.ntrpRating} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    label="Location Name"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, State"
                                    required
                                />
                                <div className="h-64 rounded-2xl overflow-hidden border border-zinc-800">
                                    <MapPicker
                                        onLocationSelect={(lat, lng, addr) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng,
                                                location: addr
                                            }));
                                        }}
                                        initialLocation={formData.latitude && formData.longitude ? {
                                            lat: formData.latitude,
                                            lng: formData.longitude
                                        } : undefined}
                                        address={formData.location}
                                    />
                                </div>
                            </div>
                            <Input label="Photo URL" name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="https://..." />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 placeholder:text-zinc-600 sm:text-sm"
                                placeholder="Describe your game style..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" variant="neon" isLoading={loading} className="flex-1">Save Profile</Button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-zinc-600 text-sm italic font-medium">Player settings are locked. Use "Edit Identity" to modify your profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

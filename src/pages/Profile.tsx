import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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
        ntrpRating: '',
        photoUrl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
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

        try {
            const response = await api.put('/profile', {
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                ntrpRating: parseFloat(formData.ntrpRating),
                photoUrl: formData.photoUrl
            });

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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Profile 👤</h1>
                {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </div>

            {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">{message}</div>}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6 mb-6">
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-green-500">
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-3xl text-gray-400">📷</span>
                        )}
                    </div>
                    {isEditing && (
                        <div className="flex-1">
                            <Input
                                label="Photo URL"
                                name="photoUrl"
                                value={formData.photoUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    )}
                </div>

                <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                />

                <Input
                    label="NTRP Rating"
                    type="number"
                    step="0.5"
                    name="ntrpRating"
                    value={formData.ntrpRating}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                />

                <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, State"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Tell us about your tennis experience..."
                    />
                </div>

                {isEditing && (
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading} className="flex-1">
                            Save Changes
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
};

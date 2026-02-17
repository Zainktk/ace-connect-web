import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        maxParticipants: '8',
        skillMin: '3.0',
        skillMax: '5.0'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const datetime = new Date(`${formData.date}T${formData.time}`).toISOString();

            await api.post('/events', {
                title: formData.title,
                description: formData.description,
                eventDate: datetime,
                location: formData.location,
                price: parseFloat(formData.price),
                maxParticipants: parseInt(formData.maxParticipants),
                skillLevelMin: parseFloat(formData.skillMin),
                skillLevelMax: parseFloat(formData.skillMax),
                latitude: 0,
                longitude: 0
            });

            navigate('/events');
        } catch (err: any) {
            console.error('Create Event Error:', err);
            setError(err.response?.data?.error || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event 🏆</h1>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Event Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                    <Input
                        label="Time"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Price ($)"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Max Players"
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Min Skill (NTRP)"
                        type="number"
                        step="0.5"
                        name="skillMin"
                        value={formData.skillMin}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Max Skill (NTRP)"
                        type="number"
                        step="0.5"
                        name="skillMax"
                        value={formData.skillMax}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/events')} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} className="flex-1">
                        Publish Event
                    </Button>
                </div>
            </form>
        </div>
    );
};

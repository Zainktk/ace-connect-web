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
        <div className="max-w-3xl mx-auto px-4 pb-20">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Create Tournament</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 px-1">Establish the new arena</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass rounded-[2.5rem] p-8 border border-zinc-800/50 shadow-2xl space-y-8">
                    <Input
                        label="Tournament Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Summer Smash Open"
                        required
                    />

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Event Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 focus:border-[#ccff00]/50 transition-all placeholder:text-zinc-600 text-sm"
                            placeholder="Detail the event rules, prizes, and schedule..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Event Date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <Input
                            label="Start Time"
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Input
                        label="Tournament Venue"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Grand Tennis Center"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Entry Fee ($)"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                        />
                        <Input
                            label="Max Grid Size"
                            type="number"
                            name="maxParticipants"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Target NTRP Min"
                            type="number"
                            step="0.5"
                            name="skillMin"
                            value={formData.skillMin}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Target NTRP Max"
                            type="number"
                            step="0.5"
                            name="skillMax"
                            value={formData.skillMax}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/events')} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] order-2 md:order-1">
                        CLOSE ARENA
                    </Button>
                    <Button type="submit" variant="neon" isLoading={loading} className="flex-[2] py-4 rounded-2xl font-black italic uppercase tracking-widest order-1 md:order-2">
                        LAUNCH TOURNAMENT
                    </Button>
                </div>
            </form>
        </div>
    );
};

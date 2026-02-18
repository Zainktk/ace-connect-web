import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

export const CreateRequest = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        matchType: 'singles',
        date: '',
        time: '',
        duration: '60',
        location: '',
        ntrpMin: '3.0',
        ntrpMax: '4.5',
        notes: ''
    });

    useEffect(() => {
        if (editId) {
            fetchRequestDetails(editId);
        }
    }, [editId]);

    const fetchRequestDetails = async (id: string) => {
        setFetching(true);
        try {
            const res = await api.get(`/matchmaking/requests/${id}`);
            const data = res.data;

            // Parse date and time from response
            const dateObj = new Date(data.preferred_date);
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = data.preferred_time ? data.preferred_time.substring(0, 5) : '';

            setFormData({
                matchType: data.match_type,
                date: dateStr,
                time: timeStr,
                duration: data.duration?.toString() || '60',
                location: data.location,
                ntrpMin: data.skill_level_min?.toString() || '3.0',
                ntrpMax: data.skill_level_max?.toString() || '4.5',
                notes: data.notes || ''
            });
        } catch (err) {
            console.error('Failed to fetch request:', err);
            setError('Failed to load request details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const datetime = new Date(`${formData.date}T${formData.time}`).toISOString();

            const payload = {
                matchType: formData.matchType,
                preferredDate: datetime, // Backend expects preferredDate
                preferredTime: formData.time,
                duration: parseInt(formData.duration),
                location: formData.location || 'Anywhere',
                skillLevelMin: parseFloat(formData.ntrpMin), // Backend expects skillLevelMin
                skillLevelMax: parseFloat(formData.ntrpMax), // Backend expects skillLevelMax
                notes: formData.notes,
                latitude: 0,
                longitude: 0
            };

            if (editId) {
                await api.put(`/matchmaking/requests/${editId}`, payload);
            } else {
                await api.post('/matchmaking/requests', payload);
            }

            // Go to My Requests tab if editing, otherwise go to list view
            navigate(editId ? '/find-match?tab=my_requests' : '/find-match');
        } catch (err: any) {
            console.error('Save Request Error:', err);
            setError(err.response?.data?.error || 'Failed to save request');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading request...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 pb-20">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {editId ? 'Reschedule Match' : 'New Match Request'}
                </h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 px-1">Configure your performance specs</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass rounded-[2.5rem] p-8 border border-zinc-800/50 shadow-2xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Select
                            label="Match Format"
                            name="matchType"
                            value={formData.matchType}
                            onChange={handleChange}
                            options={[
                                { value: 'singles', label: 'SINGLES CIRCUIT' },
                                { value: 'doubles', label: 'DOUBLES CIRCUIT' }
                            ]}
                        />

                        <Select
                            label="Session Duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            options={[
                                { value: '60', label: '1 HOUR SESSION' },
                                { value: '90', label: '1.5 HOURS INTENSIVE' },
                                { value: '120', label: '2 HOURS FULL MATCH' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Mission Date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <Input
                            label="Time (GMT)"
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Input
                        label="Venue / Court Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Central Park Courts"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Min Player NTRP"
                            type="number"
                            step="0.5"
                            name="ntrpMin"
                            value={formData.ntrpMin}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Max Player NTRP"
                            type="number"
                            step="0.5"
                            name="ntrpMax"
                            value={formData.ntrpMax}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Strategy / Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 focus:border-[#ccff00]/50 transition-all placeholder:text-zinc-600 text-sm"
                            placeholder="Looking for a high-intensity hitting partner..."
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/find-match')} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] order-2 md:order-1">
                        ABORT MISSION
                    </Button>
                    <Button type="submit" variant="neon" isLoading={loading} className="flex-[2] py-4 rounded-2xl font-black italic uppercase tracking-widest order-1 md:order-2">
                        {editId ? 'UPDATE SPECS' : 'POST CIRCUIT REQUEST'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

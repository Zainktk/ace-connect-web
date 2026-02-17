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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{editId ? 'Edit Match Request ✏️' : 'Create Match Request 🎾'}</h1>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Match Type"
                        name="matchType"
                        value={formData.matchType}
                        onChange={handleChange}
                        options={[
                            { value: 'singles', label: 'Singles' },
                            { value: 'doubles', label: 'Doubles' }
                        ]}
                    />

                    <Select
                        label="Duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        options={[
                            { value: '60', label: '1 Hour' },
                            { value: '90', label: '1.5 Hours' },
                            { value: '120', label: '2 Hours' }
                        ]}
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

                <div>
                    <Input
                        label="Location (City/Court Name)"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Central Park Courts"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Min NTRP"
                        type="number"
                        step="0.5"
                        name="ntrpMin"
                        value={formData.ntrpMin}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Max NTRP"
                        type="number"
                        step="0.5"
                        name="ntrpMax"
                        value={formData.ntrpMax}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
                        placeholder="Looking for a hitting partner..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/find-match')} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading} className="flex-1">
                        {editId ? 'Save Changes' : 'Post Request'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

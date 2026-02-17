import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { User } from '../types';

export const Players = () => {
    const [players, setPlayers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            // Assuming we have an endpoint to list users or search them
            // If not, we might need to create one or use a different endpoint
            // For now, let's try a hypothetical search endpoint or just list match requests as proxy?
            // Wait, we can use /api/matchmaking/requests to find people looking for matches.
            // Or if there is a /api/users endpoint. Let's check server routes.
            // Based on server.js: app.use('/api/users', userRoutes);

            const response = await api.get('/users');
            setPlayers(response.data);
        } catch (error) {
            console.error('Failed to fetch players:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(player =>
        player.name?.toLowerCase().includes(search.toLowerCase()) ||
        player.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Find Players 🎾</h1>
                <div className="w-64">
                    <Input
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or location..."
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No players found.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlayers.map(player => (
                        <div key={player.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 flex-shrink-0">
                                {player.photoUrl ? (
                                    <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xl">👤</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{player.name || 'Unknown Player'}</h3>
                                <p className="text-sm text-gray-500 truncate">{player.location || 'No location'}</p>
                                <div className="flex items-center mt-1">
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                        NTRP {player.ntrpRating || '?'}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" className="text-sm px-3" onClick={() => window.alert('Chat/Connect coming soon!')}>
                                Message
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

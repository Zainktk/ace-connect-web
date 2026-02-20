import { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LevelBadge } from '../components/LevelBadge';
import type { User } from '../types';

import { useConfig } from '../context/ConfigContext';

export const Players = () => {
    const { config } = useConfig();
    const [players, setPlayers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
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
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{config.pro_list_title}</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Connect with the elite community</p>
                </div>
                <div className="w-full md:w-80">
                    <Input
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search athletes or venues..."
                        className="rounded-2xl"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-28 bg-zinc-900/50 rounded-[2rem] animate-pulse border border-zinc-800" />
                    ))}
                </div>
            ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-20 glass rounded-[3rem] border border-zinc-800/50">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No athletes found on current form.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlayers.map(player => (
                        <div key={player.id} className="glass p-5 rounded-[2.5rem] border border-zinc-800/50 hover:border-[#ccff00]/30 transition-all flex items-center space-x-5 group">
                            <div className="relative flex-shrink-0">
                                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl group-hover:border-[#ccff00]/30 transition-colors">
                                    {player.photoUrl ? (
                                        <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="flex items-center justify-center h-full w-full text-2xl grayscale opacity-30">👤</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1">
                                    <LevelBadge level={player.level || 1} className="scale-75" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-black text-lg tracking-tight truncate leading-none mb-1 group-hover:text-[#ccff00] transition-colors uppercase italic">{player.name || 'ACE PLAYER'}</h3>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest truncate">{player.location || 'Unknown Venue'}</p>
                                <div className="flex items-center mt-2">
                                    <span className="bg-zinc-950 text-[#ccff00] text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border border-zinc-800">
                                        NTRP {player.ntrpRating || '0.0'}
                                    </span>
                                </div>
                            </div>

                            <Button variant="secondary" className="rounded-xl px-3 h-10 font-black text-[10px]" onClick={() => window.alert('DM functionality coming soon!')}>
                                MSG
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

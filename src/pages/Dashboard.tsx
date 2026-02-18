import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { XPProgress } from '../components/XPProgress';
import { LevelBadge } from '../components/LevelBadge';
import { AnnouncementBanner } from '../components/AnnouncementBanner';

interface Match {
    id: number;
    opponent_name: string;
    match_type: string;
    scheduled_time?: string;
    location?: string;
    status: string;
}

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const matchRes = await api.get('/matchmaking/matches/my');
            setUpcomingMatches(matchRes.data.filter((m: any) => m.status === 'accepted' || m.status === 'pending'));
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Player Profile Header */}
            <div className="relative p-6 rounded-[2rem] bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-[#ccff00]/5 blur-3xl" />

                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                    <div className="relative group">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-zinc-800 group-hover:border-[#ccff00]/50 transition-all duration-300">
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-zinc-800 flex items-center justify-center text-3xl">👤</div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 transform translate-x-1 translate-y-1">
                            <LevelBadge level={user?.level || 1} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-white tracking-tight">{user?.name || 'ACE PLAYER'}</h1>
                            <span className="text-[#ccff00] text-xs">●</span>
                        </div>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{user?.location || 'San Francisco, CA'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center min-w-[80px]">
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Streak</p>
                            <p className="text-white font-black text-lg italic">{user?.streak || 0} 🔥</p>
                        </div>
                        <Button variant="neon" size="sm" onClick={() => navigate('/profile')} className="rounded-xl">Edit</Button>
                    </div>
                </div>

                <div className="mt-8">
                    <XPProgress xp={user?.xp || 0} level={user?.level || 1} />
                </div>
            </div>

            {/* Announcement Banner */}
            <AnnouncementBanner
                title="RAMADAN BLESSED MONTH"
                message="Wishing you peace and joy this holy month. Check out local evening matches!"
                icon="🌙"
            />

            {/* Upcoming Matches Section */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">COURT COMMAND</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="h-32 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800" />
                ) : upcomingMatches.length === 0 ? (
                    <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800/50 p-10 text-center glass">
                        <p className="text-zinc-500 text-sm mb-4">No active sessions matching your form.</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/find-match')}>Find Session</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingMatches.map(match => (
                            <div key={match.id} className="p-5 flex items-center justify-between glass rounded-3xl border border-zinc-800/50 hover:bg-zinc-800/20 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:border-[#ccff00]/30 transition-colors">
                                        🎾
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-md">vs {match.opponent_name}</h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                                            {match.scheduled_time ? new Date(match.scheduled_time).toDateString() : 'Scheduling...'}
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => navigate('/chat')} className="rounded-xl">Chat</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    onClick={() => navigate('/find-match')}
                    className="group relative h-28 glass border border-zinc-800 rounded-3xl p-5 cursor-pointer hover:border-[#ccff00]/50 transition-all overflow-hidden"
                >
                    <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">🎾</div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Live Action</p>
                    <h4 className="text-zinc-50 font-black text-lg tracking-tight">FIND MATCH</h4>
                </div>

                <div
                    onClick={() => navigate('/events')}
                    className="group relative h-28 glass border border-zinc-800 rounded-3xl p-5 cursor-pointer hover:border-[#ccff00]/50 transition-all overflow-hidden"
                >
                    <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">🏆</div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Local Tournaments</p>
                    <h4 className="text-zinc-50 font-black text-lg tracking-tight">BROWSE EVENTS</h4>
                </div>
            </div>
        </div>
    );
};

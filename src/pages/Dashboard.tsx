import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

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
            // Fetch Upcoming Matches
            const matchRes = await api.get('/matchmaking/matches/my');
            setUpcomingMatches(matchRes.data.filter((m: any) => m.status === 'accepted' || m.status === 'pending'));
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto md:max-w-4xl">
            {/* Header / Welcome */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Player'}!</h1>
                </div>
            </div>

            {/* Upcoming Matches Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📅</span>
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Matches</h2>
                </div>

                {loading ? (
                    <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ) : upcomingMatches.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                        <p className="text-gray-500 mb-2">No matches scheduled yet.</p>
                        <button onClick={() => navigate('/find-match')} className="text-green-600 font-semibold hover:underline">
                            Find a partner 🎾
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {upcomingMatches.map(match => (
                            <div key={match.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-sm uppercase">
                                        {match.match_type}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">vs {match.opponent_name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {match.scheduled_time ? new Date(match.scheduled_time).toLocaleString() : 'Time TBD'}
                                        </p>
                                    </div>
                                </div>
                                {match.status === 'accepted' && (
                                    <Button size="sm" variant="outline" onClick={() => navigate('/chat')}>Chat</Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Safety Center Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center text-xl">
                        🛡️
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Safety Center</h3>
                        <p className="text-xs text-blue-700">Learn how to stay safe while playing matches.</p>
                    </div>
                </div>
                <div className="text-blue-500 font-bold text-xl">&gt;</div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
                <div className="space-y-3">
                    {/* Find a Match */}
                    <div
                        onClick={() => navigate('/find-match')}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="text-2xl">🎾</div>
                        <span className="font-semibold text-gray-900">Find a Match</span>
                    </div>

                    {/* Browse Events */}
                    <div
                        onClick={() => navigate('/events')}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="text-2xl">📅</div>
                        <span className="font-semibold text-gray-900">Browse Events</span>
                    </div>

                    {/* Shop Gear */}
                    <div
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="text-2xl">🛒</div>
                        <span className="font-semibold text-gray-900">Shop Gear</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

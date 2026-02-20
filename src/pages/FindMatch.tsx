import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/Button';
import { MapView } from '../components/MapView';
import type { MatchRequest } from '../types';
import { useAuth } from '../context/AuthContext';

type Tab = 'list' | 'map' | 'my_requests' | 'invitations';

interface Invitation {
    id: number;
    sender_name: string;
    sender_photo?: string;
    match_type: string;
    location: string;
    message?: string;
}

export const FindMatch = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab | null;
    const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'list');

    // Data states
    const [requests, setRequests] = useState<MatchRequest[]>([]);
    const [myRequests, setMyRequests] = useState<MatchRequest[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingInvite, setSendingInvite] = useState<number | null>(null);
    const [sentInvitations, setSentInvitations] = useState<number[]>([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'list' || activeTab === 'map') {
                const response = await api.get('/matchmaking/requests');
                setRequests(response.data);
                // Pre-populate sent invitations if already in DB
                const sentIds = response.data
                    .filter((r: any) => r.invitation_sent)
                    .map((r: any) => r.id);
                setSentInvitations(sentIds);
            } else if (activeTab === 'my_requests') {
                const response = await api.get('/matchmaking/requests/my');
                setMyRequests(response.data);
            } else if (activeTab === 'invitations') {
                const response = await api.get('/matchmaking/invitations');
                setInvitations(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async (requestId: number) => {
        setSendingInvite(requestId);
        try {
            await api.post('/matchmaking/invitations', {
                matchRequestId: requestId,
                message: "Hey! I'd like to play."
            });
            setSentInvitations(prev => [...prev, requestId]);
            // alert('Invitation sent!'); // User says this disappears too fast, maybe they'd prefer a persistent state change
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to send invitation';
            if (errorMsg === 'Invitation already sent') {
                setSentInvitations(prev => [...prev, requestId]);
            }
            alert(errorMsg);
        } finally {
            setSendingInvite(null);
        }
    };

    const handleAcceptInvite = async (id: number) => {
        try {
            await api.put(`/matchmaking/invitations/${id}/accept`);
            fetchData(); // Refresh list
            alert('Match accepted!');
        } catch (err) {
            console.error('Accept error', err);
        }
    };

    const handleDeclineInvite = async (id: number) => {
        try {
            await api.put(`/matchmaking/invitations/${id}/decline`);
            setInvitations(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('Decline error', err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Matchmaking</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Find your next opponent</p>
                </div>
                {(activeTab === 'list' || activeTab === 'map' || activeTab === 'my_requests') && (
                    <Button onClick={() => navigate('/create-request')} variant="neon" size="sm" className="rounded-xl px-6 font-black italic">+ NEW REQUEST</Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto no-scrollbar">
                {[
                    { id: 'list', label: 'LIST VIEW', icon: '📝' },
                    { id: 'map', label: 'MAP VIEW', icon: '📍' },
                    { id: 'my_requests', label: 'MY REQUESTS', icon: '👤' },
                    { id: 'invitations', label: 'INVITES', icon: '🔔', count: invitations.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-zinc-800 text-[#ccff00] shadow-inner border border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {tab.count ? (
                            <span className="ml-1 bg-[#ccff00] text-black px-1.5 py-0.5 rounded text-[8px]">{tab.count}</span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-900/50 rounded-[2.5rem] animate-pulse border border-zinc-800" />)}
                </div>
            ) : (
                <div className="min-h-[400px]">
                    {/* List View */}
                    {activeTab === 'list' && (
                        requests.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[3rem] border border-zinc-800/50">
                                <div className="text-5xl mb-4 grayscale opacity-20">🎾</div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">No Active Sessions</h3>
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">Check back when the courts are busy</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {requests.map(req => (
                                    <div key={req.id} className="glass group p-6 rounded-[2.5rem] border border-zinc-800/50 hover:border-[#ccff00]/30 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-20 w-20 rounded-full bg-[#ccff00]/5 blur-2xl group-hover:bg-[#ccff00]/10 transition-colors" />

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                {req.match_type}
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-600 font-bold">
                                                {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'OPEN DATE'}
                                            </div>
                                        </div>

                                        <div className="mb-6 relative z-10">
                                            <h3 className="font-black text-white text-xl tracking-tight leading-none group-hover:text-[#ccff00] transition-colors">{req.name || 'ACE PLAYER'}</h3>
                                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">{req.location || 'Unknown Venue'}</p>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6 relative z-10">
                                            <div className="bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800">
                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none">Rating</p>
                                                <p className="text-[#ccff00] font-black text-md leading-tight mt-0.5">{req.ntrp_rating}</p>
                                            </div>
                                            {req.compatibility_score && (
                                                <div className="bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800">
                                                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none">Match</p>
                                                    <p className="text-white font-black text-md leading-tight mt-0.5">{req.compatibility_score}%</p>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant={sentInvitations.includes(req.id) ? "secondary" : "neon"}
                                            className="w-full text-[10px] font-black uppercase tracking-widest rounded-2xl py-3"
                                            onClick={() => handleSendInvite(req.id)}
                                            isLoading={sendingInvite === req.id}
                                            disabled={req.user_id === user?.id || sentInvitations.includes(req.id)}
                                        >
                                            {req.user_id === user?.id ? 'Your Request' : (sentInvitations.includes(req.id) ? 'INVITATION SENT' : 'SEND INVITE')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Map View */}
                    {activeTab === 'map' && (
                        <div className="rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
                            <MapView
                                requests={requests}
                                onRequestClick={(req) => handleSendInvite(req.id)}
                                sentInvitations={sentInvitations}
                            />
                        </div>
                    )}

                    {/* My Requests */}
                    {activeTab === 'my_requests' && (
                        myRequests.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[3rem] border border-zinc-800/50">
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No active requests found.</p>
                                <Button className="mt-6 rounded-2xl px-8" variant="neon" onClick={() => navigate('/create-request')}>CREATE NEW</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 max-w-2xl mx-auto">
                                {myRequests.map(req => (
                                    <div key={req.id} className="glass p-6 rounded-[2.5rem] border border-zinc-800/50 flex justify-between items-center group hover:border-zinc-600 transition-all">
                                        <div className="flex gap-4 items-center">
                                            <div className="h-12 w-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                {req.match_type === 'singles' ? '👤' : '👥'}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-lg tracking-tight italic uppercase">{req.match_type} Session</div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                                    {req.preferred_date ? new Date(req.preferred_date).toDateString() : 'Flexible'} ● <span className="text-[#ccff00] animate-pulse">{req.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="rounded-xl px-6 font-black text-[10px]" onClick={() => navigate(`/create-request?edit=${req.id}`)}>EDIT</Button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Invitations */}
                    {activeTab === 'invitations' && (
                        invitations.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[3rem] border border-zinc-800/50">
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Inboxes are clear.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="glass p-6 rounded-[2.5rem] border border-[#ccff00]/20 relative overflow-hidden shadow-[0_0_20px_rgba(204,255,0,0.05)]">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="h-2 w-2 rounded-full bg-[#ccff00] animate-ping" />
                                        </div>

                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
                                                {inv.sender_photo ? <img src={inv.sender_photo} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full w-full text-3xl">👤</span>}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#ccff00] font-black uppercase tracking-[0.2em] leading-none mb-1.5">New Invitation</p>
                                                <h3 className="font-black text-white text-xl tracking-tight leading-tight">{inv.sender_name}</h3>
                                                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-widest">{inv.match_type} ● {inv.location}</p>
                                            </div>
                                        </div>

                                        {inv.message && (
                                            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl mb-6">
                                                <p className="text-zinc-400 text-xs italic leading-relaxed">"{inv.message}"</p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <Button size="sm" variant="neon" className="flex-1 rounded-xl font-black text-[10px]" onClick={() => handleAcceptInvite(inv.id)}>ACCEPT</Button>
                                            <Button size="sm" variant="secondary" className="flex-1 rounded-xl font-black text-[10px]" onClick={() => handleDeclineInvite(inv.id)}>DECLINE</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

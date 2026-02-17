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

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'list' || activeTab === 'map') {
                const response = await api.get('/matchmaking/requests');
                setRequests(response.data);
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
            alert('Invitation sent!');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to send invitation');
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
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Matchmaking</h1>
                {(activeTab === 'list' || activeTab === 'map' || activeTab === 'my_requests') && (
                    <Button onClick={() => navigate('/create-request')} size="sm">+ New</Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'list' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    List View
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'map' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Map View
                </button>
                <button
                    onClick={() => setActiveTab('my_requests')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'my_requests' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Requests
                </button>
                <button
                    onClick={() => setActiveTab('invitations')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'invitations' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Invitations {invitations.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">{invitations.length}</span>}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : (
                <>
                    {/* List View */}
                    {activeTab === 'list' && (
                        requests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">🎾</div>
                                <h3 className="text-lg font-medium text-gray-900">No Match Requests</h3>
                                <p className="text-gray-500">Check back later for new match requests</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {requests.map(req => (
                                    <div key={req.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${req.match_type === 'singles' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {req.match_type.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'Flexible Date'}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{req.name || 'Unknown Player'}</h3>
                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">NTRP {req.ntrp_rating}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full text-sm"
                                            onClick={() => handleSendInvite(req.id)}
                                            isLoading={sendingInvite === req.id}
                                            disabled={req.user_id === user?.id}
                                        >
                                            {req.user_id === user?.id ? 'Your Request' : 'Send Invite'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Map View */}
                    {activeTab === 'map' && (
                        <MapView
                            requests={requests}
                            onRequestClick={(req) => handleSendInvite(req.id)}
                        />
                    )}

                    {/* My Requests */}
                    {activeTab === 'my_requests' && (
                        myRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">You haven't created any requests yet.</p>
                                <Button className="mt-4" onClick={() => navigate('/create-request')}>Create Request</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {myRequests.map(req => (
                                    <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-gray-900">{req.match_type.toUpperCase()} Match</div>
                                            <div className="text-sm text-gray-500">{req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : new Date(req.created_at).toLocaleDateString()} • {req.status}</div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/create-request?edit=${req.id}`)}>Edit</Button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Invitations */}
                    {activeTab === 'invitations' && (
                        invitations.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No pending invitations.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                                {inv.sender_photo ? <img src={inv.sender_photo} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full w-full text-lg">👤</span>}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{inv.sender_name} invited you!</p>
                                                <p className="text-xs text-gray-500">{inv.match_type} • {inv.location}</p>
                                            </div>
                                        </div>
                                        {inv.message && <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">"{inv.message}"</p>}
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={() => handleAcceptInvite(inv.id)}>Accept</Button>
                                            <Button size="sm" variant="outline" className="flex-1 border-gray-300 text-gray-600" onClick={() => handleDeclineInvite(inv.id)}>Decline</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};

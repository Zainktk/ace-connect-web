import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socketService } from '../services/socket';
import { Button } from '../components/Button';

interface Match {
    id: number;
    opponent_name: string;
    opponent_photo?: string;
    match_type: string;
    match_date?: string;
    scheduled_time?: string;
    created_at: string;
}

interface Message {
    id: number;
    sensor_id: number; // Typo in DB? usually sender_id. Checking server.js: sender_id.
    sender_id: number;
    content: string;
    created_at: string;
}

export const Chat = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMatches, setLoadingMatches] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Matches
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get('/matchmaking/matches/my');
                setMatches(res.data);
                // Auto-select first match if available? Or wait for user.
            } catch (err) {
                console.error('Failed to fetch matches', err);
            } finally {
                setLoadingMatches(false);
            }
        };

        fetchMatches();
        socketService.connect();

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Handle Match Selection
    useEffect(() => {
        if (!selectedMatch) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/matchmaking/matches/${selectedMatch.id}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };

        fetchMessages();
        socketService.joinMatch(selectedMatch.id);

        const handleNewMessage = (msg: Message) => {
            // Only add if it belongs to current match
            // The socket joins a room, so we should only receive messages for this match if we only join this match's room.
            // But if we switch matches, we might need to handle leaving rooms or checking matchId.
            // For now, assuming server broadcasts to room 'match_ID', and we joined it.
            // However, verify if 'msg' contains match_id to be safe.
            setMessages(prev => [...prev, msg]);
        };

        socketService.onNewMessage(handleNewMessage);

        return () => {
            socketService.offNewMessage();
        };
    }, [selectedMatch]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedMatch || !user) return;

        socketService.sendMessage(selectedMatch.id, user.id, newMessage);
        setNewMessage('');
        // Optimistic update? Or wait for socket (server.js emits back to room, including sender)
        // Server emits 'new_message' to room. So we will receive it via socket listener.
    };

    if (loadingMatches) {
        return <div className="p-8 text-center">Loading chats...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Sidebar: Match List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-lg text-gray-800">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {matches.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No matches yet. Join an event or create a request!</div>
                    ) : (
                        matches.map(match => (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors flex items-center gap-3 ${selectedMatch?.id === match.id ? 'bg-white border-l-4 border-l-green-500 shadow-sm' : ''}`}
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                    {match.opponent_photo ? (
                                        <img src={match.opponent_photo} alt={match.opponent_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-white font-bold bg-green-500">
                                            {match.opponent_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-semibold text-gray-900 truncate">{match.opponent_name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{match.match_type} • {new Date(match.scheduled_time || match.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedMatch ? 'hidden md:flex' : 'flex'}`}>
                {selectedMatch ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Button
                                    className="md:hidden px-2 py-1 text-xs"
                                    variant="outline"
                                    onClick={() => setSelectedMatch(null)}
                                >
                                    ← Back
                                </Button>
                                <h2 className="font-bold text-gray-800">{selectedMatch.opponent_name}</h2>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 uppercase">{selectedMatch.match_type}</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-green-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500 px-4 py-2 border shadow-sm"
                                />
                                <Button type="submit" className="rounded-full px-6">Send</Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

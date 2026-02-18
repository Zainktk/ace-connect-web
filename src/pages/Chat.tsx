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
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] glass rounded-[2.5rem] overflow-hidden border border-zinc-800/50 shadow-2xl">
            {/* Sidebar: Match List */}
            <div className={`w-full md:w-80 border-r border-zinc-800/50 bg-zinc-950/50 flex flex-col ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-zinc-800/50">
                    <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">Channels</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Live Match Comms</p>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {matches.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">No active circuits. Connect with athletes to start comms.</p>
                        </div>
                    ) : (
                        matches.map(match => (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className={`p-5 cursor-pointer transition-all border-b border-zinc-800/30 flex items-center gap-4 group ${selectedMatch?.id === match.id ? 'bg-[#ccff00]/5 border-r-4 border-r-[#ccff00]' : 'hover:bg-zinc-900/50'}`}
                            >
                                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 shadow-lg group-hover:border-[#ccff00]/30 transition-colors">
                                    {match.opponent_photo ? (
                                        <img src={match.opponent_photo} alt={match.opponent_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-600 font-black text-xl italic uppercase bg-zinc-950">
                                            {match.opponent_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className={`font-black tracking-tight text-sm truncate uppercase italic transition-colors ${selectedMatch?.id === match.id ? 'text-[#ccff00]' : 'text-zinc-300 group-hover:text-white'}`}>{match.opponent_name}</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{match.match_type} • {new Date(match.scheduled_time || match.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className={`flex-1 flex flex-col bg-zinc-900/20 ${!selectedMatch ? 'hidden md:flex' : 'flex'}`}>
                {selectedMatch ? (
                    <>
                        {/* Header */}
                        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/30">
                            <div className="flex items-center gap-4">
                                <Button
                                    className="md:hidden h-8 w-8 !p-0 rounded-lg"
                                    variant="secondary"
                                    onClick={() => setSelectedMatch(null)}
                                >
                                    ←
                                </Button>
                                <div className="flex flex-col">
                                    <h2 className="font-black text-white italic uppercase tracking-tight leading-none">{selectedMatch.opponent_name}</h2>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-[#ccff00] mt-1">ENCRYPTED PERFORMANCE CHANNEL</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                {selectedMatch.match_type}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-5 py-3 text-sm font-medium tracking-tight shadow-xl ${isMe
                                            ? 'bg-[#ccff00] text-black rounded-br-none italic font-bold'
                                            : 'glass text-zinc-100 border border-zinc-800/50 rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/30">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Execute comms message..."
                                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/30 transition-all placeholder:text-zinc-600 text-sm font-medium"
                                />
                                <Button type="submit" variant="neon" className="rounded-2xl px-8 h-14 font-black italic uppercase tracking-widest text-[10px]">
                                    SEND
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="h-20 w-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-3xl opacity-20 mb-6 grayscale border border-zinc-800">💬</div>
                        <h3 className="text-zinc-500 font-black italic uppercase tracking-widest text-sm">Select Archive</h3>
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Initialize match encrypted communications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

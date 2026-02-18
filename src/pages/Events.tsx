import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/Button';
import type { Event } from '../types';

import { PaymentModal } from '../components/PaymentModal';

interface EventWithOrganizer extends Event {
    organizer_name: string;
}

export const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventWithOrganizer[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment Modal State
    const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (event: EventWithOrganizer) => {
        setSelectedEvent(event);
        setIsPaymentOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Tournaments</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Join the competition</p>
                </div>
                {user?.role === 'organizer' && (
                    <Button onClick={() => window.location.href = '/create-event'} variant="neon" size="sm" className="rounded-xl px-6 font-black italic">+ CREATE EVENT</Button>
                )}
            </div>

            {/* Payment Modal */}
            {selectedEvent && (
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => {
                        setIsPaymentOpen(false);
                        setSelectedEvent(null);
                    }}
                    eventId={selectedEvent.id}
                    amount={selectedEvent.price}
                    eventTitle={selectedEvent.title}
                />
            )}

            {loading ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-[3rem] animate-pulse border border-zinc-800" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 glass rounded-[3rem] border border-zinc-800/50">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No major events scheduled.</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {events.map(event => (
                        <div key={event.id} className="glass rounded-[3rem] overflow-hidden border border-zinc-800/50 hover:border-[#ccff00]/30 transition-all group flex flex-col">
                            <div className="h-40 bg-zinc-900 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-80 z-10"></div>
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100" />
                                ) : (
                                    <div className="h-full w-full bg-[#ccff00]/5 flex items-center justify-center text-5xl grayscale opacity-20">🏆</div>
                                )}
                                <div className="absolute bottom-0 left-0 p-6 z-20">
                                    <div className="bg-[#ccff00] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-2 inline-block tracking-tighter shadow-lg shadow-[#ccff00]/20">
                                        COMING UP
                                    </div>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter leading-tight uppercase transform group-hover:translate-x-1 transition-transform">{event.title}</h3>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-zinc-500 text-xs font-bold leading-relaxed mb-6 line-clamp-2">
                                    {event.description}
                                </p>

                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                        <span className="mr-3 opacity-50">📍</span>
                                        {event.location}
                                    </div>

                                    <div className="flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                        <span className="mr-3 opacity-50">👤</span>
                                        BY {event.organizer_name || 'ELITE HOST'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 mb-6">
                                    <div className="text-white">
                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">Entry Fee</p>
                                        <p className="text-2xl font-black italic tracking-tighter">${event.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">Spots Left</p>
                                        <p className="text-white font-black text-xs tracking-tighter">{(event.max_participants || 0) - (event.participant_count || 0)} / {event.max_participants}</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-[10px]"
                                    variant="neon"
                                    onClick={() => handleJoin(event)}
                                >
                                    BOOK SESSION
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

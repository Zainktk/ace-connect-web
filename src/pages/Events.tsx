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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Upcoming Events 🏆</h1>
                {user?.role === 'organizer' && (
                    <Button onClick={() => window.location.href = '/create-event'}>+ Create Event</Button>
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
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-4">No upcoming events found.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="h-32 bg-green-600 relative">
                                {/* Placeholder for Event Image */}
                                <div className="absolute inset-0 bg-black opacity-20"></div>
                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                    <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
                                    <p className="text-green-100 text-sm">{new Date(event.event_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="p-5">
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {event.description}
                                </p>

                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <span className="w-5 text-center mr-2">📍</span>
                                    {event.location}
                                </div>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <span className="w-5 text-center mr-2">👤</span>
                                    Organized by {event.organizer_name || 'N/A'}
                                </div>

                                <div className="flex items-center justify-between mt-4 text-sm font-medium">
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                        ${event.price} / person
                                    </span>
                                    <span className="text-gray-500">
                                        {event.participant_count ?? 0} / {event.max_participants} joined
                                    </span>
                                </div>

                                <Button className="w-full mt-4" onClick={() => handleJoin(event)}>
                                    Join Now
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

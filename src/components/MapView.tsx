import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import type { MatchRequest } from '../types';

interface MapViewProps {
    requests: MatchRequest[];
    onRequestClick?: (request: MatchRequest) => void;
    sentInvitations?: number[];
}

const containerStyle = {
    width: '100%',
    height: '600px'
};

const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
};

export const MapView = ({ requests, onRequestClick, sentInvitations = [] }: MapViewProps) => {
    const [selectedRequest, setSelectedRequest] = useState<MatchRequest | null>(null);
    const [userLocation, setUserLocation] = useState(defaultCenter);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey || '',
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access denied:', error);
                }
            );
        }
    }, []);

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <p className="text-yellow-800 font-medium mb-2">⚠️ Google Maps API Key Required</p>
                <p className="text-yellow-700 text-sm">
                    Please add your Google Maps API key to the <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> file
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <h3 className="text-red-800 font-bold text-lg mb-3">🗺️ Map Loading Error</h3>
                <div className="text-red-700 text-sm space-y-3">
                    <p>There was an error loading Google Maps. This could be because:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>The Maps JavaScript API is not enabled</li>
                        <li>The API key restrictions are too strict</li>
                        <li>There's a billing issue with your Google Cloud account</li>
                    </ul>
                    <div className="bg-white rounded p-4 border border-red-200 mt-3">
                        <p className="font-semibold mb-2">Quick Fix:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Maps Platform</a></li>
                            <li>Enable "Maps JavaScript API"</li>
                            <li>Check that billing is enabled</li>
                            <li>Wait 1-2 minutes, then refresh this page</li>
                        </ol>
                    </div>
                    <p className="text-xs text-red-600 mt-3">Error: {loadError.message}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                <div className="animate-pulse">
                    <p className="text-blue-800 font-medium mb-2">🗺️ Loading Map...</p>
                    <p className="text-blue-600 text-sm">Please wait while Google Maps loads</p>
                </div>
            </div>
        );
    }

    const validRequests = requests.filter(req => req.latitude && req.longitude);

    return (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={12}
            >
                <Marker
                    position={userLocation}
                    icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                    title="Your Location"
                />

                {validRequests.map((request) => (
                    <Marker
                        key={request.id}
                        position={{
                            lat: request.latitude!,
                            lng: request.longitude!
                        }}
                        onClick={() => setSelectedRequest(request)}
                        icon={{
                            url: request.match_type === 'singles'
                                ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                : 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
                        }}
                    />
                ))}

                {selectedRequest && selectedRequest.latitude && selectedRequest.longitude && (
                    <InfoWindow
                        position={{
                            lat: selectedRequest.latitude,
                            lng: selectedRequest.longitude
                        }}
                        onCloseClick={() => setSelectedRequest(null)}
                    >
                        <div className="p-2 max-w-xs">
                            <h3 className="font-bold text-gray-900 mb-1">
                                {selectedRequest.name || 'Unknown Player'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${selectedRequest.match_type === 'singles' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {selectedRequest.match_type.toUpperCase()}
                                </span>
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                                NTRP: {selectedRequest.ntrp_rating}
                            </p>
                            {selectedRequest.location && (
                                <p className="text-xs text-gray-500 mb-2">
                                    📍 {selectedRequest.location}
                                </p>
                            )}
                            {selectedRequest.preferred_date && (
                                <p className="text-xs text-gray-500 mb-2">
                                    📅 {new Date(selectedRequest.preferred_date).toLocaleDateString()}
                                </p>
                            )}
                            {onRequestClick && (
                                <button
                                    onClick={() => onRequestClick(selectedRequest)}
                                    disabled={sentInvitations.includes(selectedRequest.id)}
                                    className={`text-xs px-3 py-1 rounded transition-colors ${sentInvitations.includes(selectedRequest.id) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                >
                                    {sentInvitations.includes(selectedRequest.id) ? 'Invitation Sent' : 'Send Invite'}
                                </button>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Singles</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Doubles</span>
                </div>
            </div>
        </div>
    );
};

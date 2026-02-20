import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    initialLocation?: { lat: number; lng: number };
    address?: string;
}

const containerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '1.5rem'
};

const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
};

export const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation, address: addressProp }) => {
    const [center, setCenter] = useState(initialLocation || defaultCenter);
    const [marker, setMarker] = useState(initialLocation || null);
    const [address, setAddress] = useState(addressProp || '');
    const [loading, setLoading] = useState(false);
    const [lastGeocodedAddress, setLastGeocodedAddress] = useState('');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: apiKey || '',
        libraries: ['places']
    });

    // Geocode address when it changes from parent (manual typing)
    React.useEffect(() => {
        if (!isLoaded || !addressProp || addressProp === lastGeocodedAddress) return;

        const timer = setTimeout(async () => {
            const geocoder = new google.maps.Geocoder();
            try {
                const response = await geocoder.geocode({ address: addressProp });
                if (response.results[0]) {
                    const { lat, lng } = response.results[0].geometry.location;
                    const newPos = { lat: lat(), lng: lng() };
                    setCenter(newPos);
                    setMarker(newPos);
                    setLastGeocodedAddress(addressProp);
                    setAddress(addressProp);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [addressProp, isLoaded, lastGeocodedAddress]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCenter(newPos);
                setMarker(newPos);
                reverseGeocode(newPos.lat, newPos.lng);
                setLoading(false);
            },
            (error) => {
                console.error('Error detecting location:', error);
                alert('Could not detect your location. Please select it on the map.');
                setLoading(false);
            }
        );
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        if (!window.google) return;

        const geocoder = new google.maps.Geocoder();
        try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            if (response.results[0]) {
                const addr = response.results[0].formatted_address;
                setAddress(addr);
                setLastGeocodedAddress(addr);
                onLocationSelect(lat, lng, addr);
            } else {
                const fallbackAddr = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                setAddress(fallbackAddr);
                onLocationSelect(lat, lng, fallbackAddr);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            const fallbackAddr = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setAddress(fallbackAddr);
            onLocationSelect(lat, lng, fallbackAddr);
        }
    };

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setMarker(newPos);
            reverseGeocode(newPos.lat, newPos.lng);
        }
    }, [onLocationSelect]);

    if (!isLoaded) return <div className="h-[300px] w-full bg-zinc-900 animate-pulse rounded-3xl" />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Match Location</span>
                <button
                    type="button"
                    onClick={detectLocation}
                    disabled={loading}
                    className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] hover:text-[#a3e635] transition-colors flex items-center gap-2"
                >
                    {loading ? (
                        <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                    ) : (
                        <span>⚡ Detect My Location</span>
                    )}
                </button>
            </div>

            <div className="relative group overflow-hidden rounded-3xl border border-zinc-800/50">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                    onClick={onMapClick}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                            // ... Dark mode styles can be expanded here
                        ]
                    }}
                >
                    {marker && <Marker position={marker} />}
                </GoogleMap>
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl pointer-events-none">
                    <p className="text-[10px] font-bold text-white truncate">
                        {address || 'Click map to set your "Home Base"'}
                    </p>
                </div>
            </div>

            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider text-center">
                We use your exact coordinates to find local players near you.
            </p>
        </div>
    );
};

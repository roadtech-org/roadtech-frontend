import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '../common/Button';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({
  position,
  onPositionChange
}: {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

function SetViewOnPosition({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // Default to New Delhi

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
    setError(null);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handlePositionChange(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        setError(err.message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    // Only run once on mount, not during renders
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Defer geolocation to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      getCurrentLocation();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Select Location
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          isLoading={isLocating}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Use Current Location
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
          {position && <SetViewOnPosition position={position} />}
        </MapContainer>
      </div>

      {position ? (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1 text-blue-600" />
          <span>
            Location: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Click on the map or use the button above to set your location
        </p>
      )}
    </div>
  );
}

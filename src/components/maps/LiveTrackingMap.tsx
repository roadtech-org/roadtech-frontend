import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const mechanicIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface LiveTrackingMapProps {
  userLocation: { lat: number; lng: number };
  mechanicLocation?: { lat: number; lng: number };
}

function FitBounds({ userLocation, mechanicLocation }: LiveTrackingMapProps) {
  const map = useMap();

  useEffect(() => {
    if (mechanicLocation) {
      const bounds: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        [mechanicLocation.lat, mechanicLocation.lng],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [map, userLocation, mechanicLocation]);

  return null;
}

export function LiveTrackingMap({ userLocation, mechanicLocation }: LiveTrackingMapProps) {
  const routePositions: [number, number][] = mechanicLocation
    ? [
        [userLocation.lat, userLocation.lng],
        [mechanicLocation.lat, mechanicLocation.lng],
      ]
    : [];

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <div className="text-center">
            <strong>Your Location</strong>
          </div>
        </Popup>
      </Marker>

      {/* Mechanic Location */}
      {mechanicLocation && (
        <>
          <Marker position={[mechanicLocation.lat, mechanicLocation.lng]} icon={mechanicIcon}>
            <Popup>
              <div className="text-center">
                <strong>Mechanic Location</strong>
              </div>
            </Popup>
          </Marker>

          {/* Route Line */}
          <Polyline
            positions={routePositions}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        </>
      )}

      <FitBounds userLocation={userLocation} mechanicLocation={mechanicLocation} />
    </MapContainer>
  );
}

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Truck, Clock, Package, AlertCircle } from 'lucide-react';

// We dynamically import Leaflet so it doesn't break SSR / Vite
let L;

// Indian city coordinate database for geocoding
const CITY_COORDS = {
    'mumbai': [19.0760, 72.8777], 'delhi': [28.6139, 77.2090], 'bangalore': [12.9716, 77.5946],
    'bengaluru': [12.9716, 77.5946], 'chennai': [13.0827, 80.2707], 'hyderabad': [17.3850, 78.4867],
    'pune': [18.5204, 73.8567], 'kolkata': [22.5726, 88.3639], 'ahmedabad': [23.0225, 72.5714],
    'jaipur': [26.9124, 75.7873], 'surat': [21.1702, 72.8311], 'nagpur': [21.1458, 79.0882],
    'lucknow': [26.8467, 80.9462], 'kanpur': [26.4499, 80.3319], 'indore': [22.7196, 75.8577],
    'bhopal': [23.2599, 77.4126], 'patna': [25.5941, 85.1376], 'vadodara': [22.3072, 73.1812],
    'aurangabad': [19.8762, 75.3433], 'amritsar': [31.6340, 74.8723],
    'faridabad': [28.4089, 77.3178], 'meerut': [28.9845, 77.7064],
    'visakhapatnam': [17.6868, 83.2185], 'vizag': [17.6868, 83.2185],
    'coimbatore': [11.0168, 76.9558], 'kochi': [9.9312, 76.2673],
    'noida': [28.5355, 77.3910], 'gurgaon': [28.4595, 77.0266], 'gurugram': [28.4595, 77.0266],
    'chandigarh': [30.7333, 76.7794], 'bhubaneswar': [20.2961, 85.8245],
    'ranchi': [23.3441, 85.3096], 'guwahati': [26.1445, 91.7362],
    'jnpt': [18.9490, 72.9378], 'nhava sheva': [18.9490, 72.9378],
    'bhiwandi': [19.2967, 73.0579], 'talawade': [18.6255, 73.8220],
    'katedan': [17.3190, 78.4490], 'okhla': [28.5355, 77.2910],
    'narela': [28.8576, 77.0960], 'patparganj': [28.6258, 77.2965],
    'icd': [28.6258, 77.2965], 'solapur': [17.6868, 75.9064], 'khopoli': [18.7869, 73.3422],
};

function geocodeCity(str) {
    const lower = str.toLowerCase();
    // Try direct match
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
        if (lower.includes(key)) return coords;
    }
    // Default to center of India
    return [20.5937, 78.9629];
}

function interpolate(start, end, fraction) {
    return [
        start[0] + (end[0] - start[0]) * fraction,
        start[1] + (end[1] - start[1]) * fraction,
    ];
}

export default function TripMapModal({ trip, onClose }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const [progress, setProgress] = useState(30); // simulate 30% of route covered
    const [status, setStatus] = useState('en_route');
    const [eta, setEta] = useState('2h 45min');

    const originCoords = geocodeCity(trip.origin);
    const destCoords = geocodeCity(trip.destination);
    const currentCoords = interpolate(originCoords, destCoords, progress / 100);

    useEffect(() => {
        // Dynamically load Leaflet to avoid SSR issues
        import('leaflet').then((leaflet) => {
            L = leaflet.default;

            // Fix default icon paths for Vite
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            if (mapRef.current && !mapInstance.current) {
                // Init map
                const map = L.map(mapRef.current, {
                    zoomControl: true,
                    attributionControl: true,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18,
                }).addTo(map);

                // Draw route line
                const routeLine = L.polyline([originCoords, destCoords], {
                    color: '#4f8ef7',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '8 6',
                }).addTo(map);

                // Traveled portion (solid blue)
                L.polyline([originCoords, currentCoords], {
                    color: '#60a0ff',
                    weight: 5,
                    opacity: 1,
                }).addTo(map);

                // Origin marker
                const originIcon = L.divIcon({
                    html: `<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(16,185,129,0.7)"></div>`,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });
                L.marker(originCoords, { icon: originIcon })
                    .addTo(map)
                    .bindPopup(`<b>📦 Origin</b><br/>${trip.origin}`);

                // Destination marker
                const destIcon = L.divIcon({
                    html: `<div style="background:#f87171;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(248,113,113,0.7)"></div>`,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });
                L.marker(destCoords, { icon: destIcon })
                    .addTo(map)
                    .bindPopup(`<b>🏁 Destination</b><br/>${trip.destination}`);

                // Truck marker (animated pulsing)
                const truckIcon = L.divIcon({
                    html: `
            <div style="position:relative;width:32px;height:32px;">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(79,142,247,0.25);animation:pulse-ring 1.5s ease-out infinite;"></div>
              <div style="position:absolute;inset:4px;border-radius:50%;background:#4f8ef7;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 12px rgba(79,142,247,0.8);">🚛</div>
            </div>
          `,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                const truckMarker = L.marker(currentCoords, { icon: truckIcon })
                    .addTo(map)
                    .bindPopup(`<b>🚛 ${trip.vehicleId?.name}</b><br/>Driver: ${trip.driverId?.name}<br/>Cargo: ${trip.cargoWeight?.toLocaleString()} kg`);

                markerRef.current = truckMarker;
                mapInstance.current = map;

                // Fit bounds
                const bounds = L.latLngBounds([originCoords, destCoords]).pad(0.18);
                map.fitBounds(bounds);

                truckMarker.openPopup();
            }
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Simulate truck moving
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) {
                    setStatus('arriving');
                    setEta('Arriving soon');
                    return 98;
                }
                const next = prev + 0.5;
                // Update marker position
                if (markerRef.current && L) {
                    const newCoords = interpolate(originCoords, destCoords, next / 100);
                    markerRef.current.setLatLng(newCoords);
                }
                // Update ETA
                const remaining = Math.round((100 - next) / 100 * 195);
                const hrs = Math.floor(remaining / 60);
                const mins = remaining % 60;
                setEta(hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`);
                return next;
            });
        }, 800);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.2s ease',
        }}>
            <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

            <div style={{
                width: '100%', maxWidth: '900px',
                background: 'linear-gradient(160deg, #111830, #0a0e1f)',
                border: '1px solid #1c2b4a',
                borderRadius: '20px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(79,142,247,0.1)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px',
                    background: 'linear-gradient(90deg, rgba(79,142,247,0.12), rgba(139,92,246,0.06))',
                    borderBottom: '1px solid #1c2b4a',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(79,142,247,0.4)',
                        }}>
                            <Navigation size={20} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eef2ff' }}>
                                Live Trip Tracker
                            </h3>
                            <p style={{ fontSize: '0.72rem', color: '#3e5278', marginTop: 1 }}>
                                Real-time fleet monitoring · {trip.vehicleId?.plateNumber}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
                            background: status === 'arriving' ? 'rgba(52,211,153,0.15)' : 'rgba(79,142,247,0.15)',
                            color: status === 'arriving' ? '#34d399' : '#60a0ff',
                            border: `1px solid ${status === 'arriving' ? 'rgba(52,211,153,0.3)' : 'rgba(79,142,247,0.3)'}`,
                            display: 'flex', alignItems: 'center', gap: '5px',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: status === 'arriving' ? '#34d399' : '#60a0ff',
                                animation: 'pulse-ring 1.5s ease-out infinite', display: 'inline-block'
                            }} />
                            {status === 'arriving' ? 'ARRIVING' : 'EN ROUTE'}
                        </span>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2b4a',
                            borderRadius: '8px', padding: '7px 16px', color: '#7d9bc6',
                            cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
                            transition: 'all 0.15s',
                        }}>✕ Close</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 480 }}>
                    {/* Map */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 480 }} />
                    </div>

                    {/* Info panel */}
                    <div style={{
                        width: 260, background: '#0d1127',
                        borderLeft: '1px solid #1c2b4a',
                        padding: '20px 16px',
                        display: 'flex', flexDirection: 'column', gap: '16px',
                        overflowY: 'auto',
                    }}>
                        {/* Progress section */}
                        <div>
                            <p style={{
                                fontSize: '0.67rem', color: '#3e5278', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px'
                            }}>
                                Route Progress
                            </p>
                            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{ color: '#7d9bc6' }}>Covered</span>
                                <span style={{ color: '#60a0ff', fontWeight: 700 }}>{Math.round(progress)}%</span>
                            </div>
                            <div style={{ height: 6, background: '#1c2b4a', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '99px',
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #4f8ef7, #8b5cf6)',
                                    transition: 'width 0.8s ease',
                                }} />
                            </div>
                        </div>

                        {/* ETA */}
                        <div style={{
                            padding: '12px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(139,92,246,0.08))',
                            border: '1px solid rgba(79,142,247,0.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                                <Clock size={14} color="#60a0ff" />
                                <span style={{
                                    fontSize: '0.68rem', color: '#3e5278', fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em'
                                }}>ETA</span>
                            </div>
                            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a0ff', lineHeight: 1 }}>{eta}</p>
                            <p style={{ fontSize: '0.7rem', color: '#3e5278', marginTop: '3px' }}>Estimated time remaining</p>
                        </div>

                        {/* Trip details */}
                        {[
                            { icon: MapPin, label: 'Origin', value: trip.origin, color: '#34d399' },
                            { icon: MapPin, label: 'Destination', value: trip.destination, color: '#f87171' },
                            { icon: Truck, label: 'Vehicle', value: trip.vehicleId?.name, color: '#60a0ff' },
                            { icon: Package, label: 'Cargo', value: `${trip.cargoWeight?.toLocaleString()} kg`, color: '#fbbf24' },
                        ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={13} color={color} />
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '0.65rem', color: '#3e5278', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em'
                                    }}>{label}</p>
                                    <p style={{ fontSize: '0.82rem', color: '#eef2ff', fontWeight: 600, marginTop: '1px' }}>{value || '—'}</p>
                                </div>
                            </div>
                        ))}

                        {/* Driver info */}
                        <div style={{
                            marginTop: 'auto', padding: '12px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid #1c2b4a'
                        }}>
                            <p style={{
                                fontSize: '0.65rem', color: '#3e5278', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px'
                            }}>Driver</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.78rem'
                                }}>
                                    {trip.driverId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR'}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.84rem', color: '#eef2ff', fontWeight: 700 }}>{trip.driverId?.name || '—'}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#3e5278' }}>{trip.driverId?.licenseNumber || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

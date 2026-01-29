import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Droplets, Wrench } from 'lucide-react';
import type { RiskZone, Borehole, Route, Season } from '@/types/hydrosentry';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          width: ${size * 2}px;
          height: ${size * 2}px;
          background-color: ${color};
          opacity: 0.3;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const floodIcon = createCustomIcon('#ef4444', 28);
const boreholeIcon = createCustomIcon('#f59e0b', 24);

// Borno State center coordinates (Maiduguri)
const BORNO_CENTER: [number, number] = [11.8333, 13.1500];
const DEFAULT_ZOOM = 9;

interface CrisisMapProps {
  season: Season;
  riskZones: RiskZone[];
  boreholes: Borehole[];
  routes: Route[];
  onDispatch?: (type: string, id: string) => void;
}

// Component to handle map updates when season changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Ngadda River path (simplified for visualization)
const ngaddaRiverPath: [number, number][] = [
  [11.8200, 13.0800],
  [11.8350, 13.1200],
  [11.8456, 13.1523],
  [11.8520, 13.1700],
  [11.8600, 13.2000]
];

// Separate component for wet season layers
function WetSeasonLayers({ 
  riskZones, 
  onDispatch 
}: { 
  riskZones: RiskZone[]; 
  onDispatch?: (type: string, id: string) => void;
}) {
  return (
    <>
      <Polyline
        positions={ngaddaRiverPath}
        pathOptions={{
          color: '#ef4444',
          weight: 8,
          opacity: 0.6,
          dashArray: '10, 10'
        }}
      />
      
      {riskZones.map((zone) => (
        <Circle
          key={`circle-${zone.id}`}
          center={zone.coordinates}
          radius={500}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
      ))}

      {riskZones.map((zone) => (
        <Marker
          key={`marker-${zone.id}`}
          position={zone.coordinates}
          icon={floodIcon}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-sm">{zone.name}</span>
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="text-muted-foreground">Blockage Type:</span> {zone.blockageType}</p>
                <p><span className="text-muted-foreground">Flood Risk:</span> <span className="text-destructive font-medium capitalize">{zone.severity}</span></p>
                <p className="text-muted-foreground">{zone.description}</p>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3 bg-primary hover:bg-primary/90"
                onClick={() => onDispatch?.('clearance', zone.id)}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Dispatch Clearance Crew
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Separate component for dry season layers
function DrySeasonLayers({ 
  boreholes, 
  routes,
  onDispatch 
}: { 
  boreholes: Borehole[];
  routes: Route[];
  onDispatch?: (type: string, id: string) => void;
}) {
  return (
    <>
      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{
            color: '#f59e0b',
            weight: 4,
            opacity: 0.7,
            dashArray: route.status === 'unverified' ? '5, 10' : undefined
          }}
        />
      ))}

      {boreholes.map((borehole) => (
        <Marker
          key={borehole.id}
          position={borehole.coordinates}
          icon={boreholeIcon}
        >
          <Popup>
            <div className="min-w-[220px] p-1">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-warning" />
                <span className="font-semibold text-sm">{borehole.name}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <span className="text-destructive font-medium capitalize">{borehole.status.replace('_', ' ')}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">'Atmospheric Thirst' Index:</span>{' '}
                  <span className="text-destructive font-semibold">{borehole.thirstIndex.toFixed(1)}/10</span>
                </p>
                <p>
                  <span className="text-muted-foreground">CRPD Score:</span>{' '}
                  <span className="text-destructive font-semibold">{borehole.crpdScore.toFixed(1)}/10</span>
                </p>
                <div className="px-2 py-1.5 bg-destructive/10 rounded text-destructive font-medium">
                  ⚠️ Prediction: High Conflict Risk
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full mt-3 border-warning text-warning hover:bg-warning/10"
                onClick={() => onDispatch?.('repair', borehole.id)}
              >
                Alert Repair Technician
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Map content component that uses the Leaflet context
function MapContent({ 
  season, 
  riskZones, 
  boreholes, 
  routes, 
  onDispatch 
}: CrisisMapProps) {
  return (
    <>
      <MapController center={BORNO_CENTER} zoom={DEFAULT_ZOOM} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {season === 'wet' && (
        <WetSeasonLayers riskZones={riskZones} onDispatch={onDispatch} />
      )}

      {season === 'dry' && (
        <DrySeasonLayers boreholes={boreholes} routes={routes} onDispatch={onDispatch} />
      )}
    </>
  );
}

export function CrisisMap({ season, riskZones, boreholes, routes, onDispatch }: CrisisMapProps) {
  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={BORNO_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapContent 
          season={season} 
          riskZones={riskZones} 
          boreholes={boreholes} 
          routes={routes} 
          onDispatch={onDispatch} 
        />
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-3 z-[1000]">
        <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
        {season === 'wet' ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Flood Risk Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-destructive opacity-60" style={{ borderStyle: 'dashed' }} />
              <span className="text-xs text-muted-foreground">Ngadda River Path</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Failed Borehole</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-warning" />
              <span className="text-xs text-muted-foreground">Herder Route</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

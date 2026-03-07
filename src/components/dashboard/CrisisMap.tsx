import { useEffect, useRef, useCallback } from 'react';
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
const BORNO_CENTER: L.LatLngExpression = [11.8333, 13.1500];
const DEFAULT_ZOOM = 9;

// Ngadda River path
const ngaddaRiverPath: L.LatLngExpression[] = [
  [11.8200, 13.0800],
  [11.8350, 13.1200],
  [11.8456, 13.1523],
  [11.8520, 13.1700],
  [11.8600, 13.2000]
];

interface CrisisMapProps {
  season: Season;
  riskZones: RiskZone[];
  boreholes: Borehole[];
  routes: Route[];
  onDispatch?: (type: string, id: string) => void;
}

export function CrisisMap({ season, riskZones, boreholes, routes, onDispatch }: CrisisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: BORNO_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // Create layer group for seasonal content
    layersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  // Update layers when season or data changes
  useEffect(() => {
    if (!mapRef.current || !layersRef.current) return;

    // Clear existing layers
    layersRef.current.clearLayers();

    if (season === 'wet') {
      // Add river danger zone polyline - thicker for video
      const riverLine = L.polyline(ngaddaRiverPath, {
        color: '#ef4444',
        weight: 10,
        opacity: 0.7,
        dashArray: '12, 12'
      });
      layersRef.current.addLayer(riverLine);

      // Add flood zone circles and markers
      riskZones.forEach((zone) => {
        // Circle - more opaque for video visibility
        const circle = L.circle(zone.coordinates, {
          radius: 500,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.45,
          weight: 3
        });
        layersRef.current?.addLayer(circle);

        // Marker with popup
        const marker = L.marker(zone.coordinates, { icon: floodIcon });
        marker.bindPopup(`
          <div style="min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span style="font-weight: 600; font-size: 14px;">${zone.name}</span>
            </div>
            <div style="font-size: 12px; line-height: 1.5;">
              <p><span style="color: #64748b;">Blockage Type:</span> ${zone.blockageType}</p>
              <p><span style="color: #64748b;">Flood Risk:</span> <span style="color: #ef4444; font-weight: 500; text-transform: capitalize;">${zone.severity}</span></p>
              <p style="color: #64748b; margin-top: 4px;">${zone.description}</p>
            </div>
            <button 
              onclick="window.dispatchCrisisAction('clearance', '${zone.id}')"
              style="width: 100%; margin-top: 12px; padding: 8px 16px; background: #009EDB; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;"
            >
              🔧 Dispatch Clearance Crew
            </button>
          </div>
        `);
        layersRef.current?.addLayer(marker);
      });
    } else {
      // Dry season - herder routes
      routes.forEach((route) => {
        const line = L.polyline(route.coordinates, {
          color: '#f59e0b',
          weight: 6,
          opacity: 0.9,
          dashArray: route.status === 'unverified' ? '8, 12' : undefined
        });
        layersRef.current?.addLayer(line);
      });

      // Borehole markers
      boreholes.forEach((borehole) => {
        const marker = L.marker(borehole.coordinates, { icon: boreholeIcon });
        marker.bindPopup(`
          <div style="min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              <span style="font-weight: 600; font-size: 14px;">${borehole.name}</span>
            </div>
            <div style="font-size: 12px; line-height: 1.8;">
              <p>
                <span style="color: #64748b;">Status:</span> 
                <span style="color: #ef4444; font-weight: 500; text-transform: capitalize;">${borehole.status.replace('_', ' ')}</span>
              </p>
              <p>
                <span style="color: #64748b;">'Atmospheric Thirst' Index:</span> 
                <span style="color: #ef4444; font-weight: 600;">${borehole.thirstIndex.toFixed(1)}/10</span>
              </p>
              <p>
                <span style="color: #64748b;">CRPD Score:</span> 
                <span style="color: #ef4444; font-weight: 600;">${borehole.crpdScore.toFixed(1)}/10</span>
              </p>
              <div style="padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border-radius: 4px; color: #ef4444; font-weight: 500; margin-top: 8px;">
                ⚠️ Prediction: High Conflict Risk
              </div>
            </div>
            <button 
              onclick="window.dispatchCrisisAction('repair', '${borehole.id}')"
              style="width: 100%; margin-top: 12px; padding: 8px 16px; background: transparent; color: #f59e0b; border: 2px solid #f59e0b; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;"
            >
              Alert Repair Technician
            </button>
          </div>
        `);
        layersRef.current?.addLayer(marker);
      });
    }
  }, [season, riskZones, boreholes, routes]);

  // Set up dispatch handler on window
  useEffect(() => {
    (window as any).dispatchCrisisAction = (type: string, id: string) => {
      onDispatch?.(type, id);
    };
    return () => {
      delete (window as any).dispatchCrisisAction;
    };
  }, [onDispatch]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      <div ref={mapContainerRef} className="h-full w-full opacity-95" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-slate-200 p-4 z-[1000] min-w-[180px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Map Legend</p>
        {season === 'wet' ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-xs font-bold text-slate-700">Flood Risk Zone</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-rose-500 opacity-60" style={{ borderStyle: 'dashed' }} />
              <span className="text-xs font-bold text-slate-700">Ngadda River Path</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-xs font-bold text-slate-700">Failed Borehole</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-amber-500 rounded-full" />
              <span className="text-xs font-bold text-slate-700">Herder Route</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

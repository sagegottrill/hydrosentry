import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DemoCommandNode, DemoNodeUiStatus } from '@/data/demoCommandNodes';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LAKE_CHAD_CENTER: L.LatLngExpression = [13.0, 14.0];
const DEFAULT_ZOOM = 6.5;

const DARK_TILE =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function markerColor(status: DemoNodeUiStatus, selected: boolean, spike: boolean): string {
  if (spike) return '#f97316';
  if (status === 'warning') return '#fbbf24';
  return selected ? '#22d3ee' : '#34d399';
}

function nodeIcon(
  node: DemoCommandNode,
  selectedId: string | null,
  spikeNodeId: string | null,
  spikeFlash: boolean,
): L.DivIcon {
  const selected = node.nodeId === selectedId;
  const spike = spikeFlash && node.nodeId === spikeNodeId;
  const color = markerColor(node.status, selected, spike);
  const ring = spike ? '0 0 0 3px rgba(249,115,22,0.9), 0 0 24px rgba(249,115,22,0.55)' : '0 2px 12px rgba(0,0,0,0.45)';

  return L.divIcon({
    className: 'demo-command-marker',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border: 2px solid rgba(15,23,42,0.95);
        border-radius: 50%;
        box-shadow: ${ring};
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export type DemoCommandMapProps = {
  nodes: DemoCommandNode[];
  selectedId: string | null;
  spikeNodeId: string | null;
  spikeFlash: boolean;
  onSelectNode: (nodeId: string) => void;
};

export function DemoCommandMap({
  nodes,
  selectedId,
  spikeNodeId,
  spikeFlash,
  onSelectNode,
}: DemoCommandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: LAKE_CHAD_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(DARK_TILE, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = group;

    const onResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      window.removeEventListener('resize', onResize);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    for (const node of nodes) {
      const marker = L.marker([node.lat, node.lng], {
        icon: nodeIcon(node, selectedId, spikeNodeId, spikeFlash),
      });
      marker.on('click', () => onSelectNode(node.nodeId));
      marker.bindTooltip(`${node.nodeId} · ${node.locationLabel}`, {
        direction: 'top',
        offset: [0, -8],
        className: 'demo-map-tooltip',
      });
      marker.addTo(group);
    }
  }, [nodes, selectedId, spikeNodeId, spikeFlash, onSelectNode]);

  return (
    <div
      ref={containerRef}
      className="relative z-0 h-full min-h-[220px] w-full overflow-hidden rounded-lg border border-cyan-500/20 bg-[#050810] shadow-[inset_0_0_60px_rgba(6,182,212,0.06)] md:min-h-[320px]"
      role="application"
      aria-label="Lake Chad basin tactical map"
    />
  );
}

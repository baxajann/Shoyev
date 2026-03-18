'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, address: string) => void;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        center: [lat || 41.311158, lng || 69.240562],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const pinHtml = `<div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: linear-gradient(135deg, #2563eb, #0ea5e9);
        border: 3px solid white; box-shadow: 0 2px 10px rgba(37,99,235,0.4);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;">📍</div>`;

      const icon = L.divIcon({ html: pinHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

      if (lat && lng) {
        const m = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current = m;
        m.on('dragend', () => {
          const pos = m.getLatLng();
          const addr = `Локация: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
          onChange(pos.lat, pos.lng, addr);
        });
      }

      map.on('click', (e) => {
        const { lat: la, lng: ln } = e.latlng;
        if (markerRef.current) {
          (markerRef.current as { setLatLng: (pos: [number, number]) => void }).setLatLng([la, ln]);
        } else {
          const m = L.marker([la, ln], { icon, draggable: true }).addTo(map);
          markerRef.current = m;
          m.on('dragend', () => {
            const pos = m.getLatLng();
            onChange(pos.lat, pos.lng, `Локация: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
          });
        }
        onChange(la, ln, `Локация: ${la.toFixed(5)}, ${ln.toFixed(5)}`);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div style={{
        height: '300px', background: '#e0e7ff', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1',
      }}>
        Загрузка карты...
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div style={{ position: 'relative' }}>
        <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '12px' }} />
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#475569',
          fontWeight: 500, zIndex: 1000, border: '1px solid #e2e8f0',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          👆 Нажмите на карту для выбора места
        </div>
      </div>
    </>
  );
}

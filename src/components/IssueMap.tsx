'use client';

import { useEffect, useRef, useState } from 'react';
import { Issue, Category } from '@/lib/types';

interface IssueMapProps {
  issues: Issue[];
  categories: Category[];
  onIssueClick?: (issue: Issue) => void;
  height?: string;
}

export default function IssueMap({
  issues,
  categories,
  onIssueClick,
  height = '500px',
}: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        center: [41.311158, 69.240562],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      issues.forEach((issue) => {
        const cat = categories.find((c) => c.id === issue.categoryId);
        const color = cat?.color || '#2563eb';
        const icon = cat?.icon || '📍';

        const markerHtml = `
          <div style="
            width: 36px; height: 36px; border-radius: 50%;
            background: ${color}; border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; cursor: pointer;
          ">${icon}</div>`;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const statusMap: Record<string, string> = {
          new: '🆕 Новая',
          moderation: '⏳ На модерации',
          in_progress: '🔧 В работе',
          resolved: '✅ Решено',
          closed: '🔒 Закрыто',
        };

        const marker = L.marker([issue.latitude, issue.longitude], {
          icon: customIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 4px 0;">
            <div style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px;">
              ${issue.title}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              📍 ${issue.address}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
              ${statusMap[issue.status] || issue.status}
            </div>
            ${issue.photoBefore ? `<img src="${issue.photoBefore}" style="width: 100%; border-radius: 8px; object-fit: cover; max-height: 120px;" />` : ''}
          </div>
        `);

        if (onIssueClick) {
          marker.on('click', () => onIssueClick(issue));
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div style={{
        height, background: '#e0e7ff', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6366f1', fontWeight: 600,
      }}>
        Загрузка карты...
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: '16px' }} />
    </>
  );
}

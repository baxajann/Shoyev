'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getIssues } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Issue } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, MapPin, Calendar, User, Clock } from 'lucide-react';

const STATUS_TIMELINE = [
  { key: 'new', label: 'Новая' },
  { key: 'moderation', label: 'Модерация' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'resolved', label: 'Решено' },
  { key: 'closed', label: 'Закрыто' },
];

export default function IssuePage() {
  const params = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (id) {
      const all = getIssues();
      const found = all.find((i) => i.id === id);
      if (found) {
        setIssue(found);
      } else {
        router.push('/dashboard');
      }
    }
  }, [params, router]);

  if (!issue) return null;

  const cat = MOCK_CATEGORIES.find((c) => c.id === issue.categoryId);
  const currentStep = STATUS_TIMELINE.findIndex((s) => s.key === issue.status);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px 72px' }}>
      <button 
        onClick={() => router.back()} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', color: '#64748b', 
          cursor: 'pointer', fontSize: '15px', fontWeight: 600,
          marginBottom: '24px', padding: 0
        }}
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{cat?.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: cat?.color || '#3b82f6', background: `${cat?.color}15` || '#eff6ff', padding: '4px 10px', borderRadius: '100px' }}>
                {cat?.title}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {issue.title}
            </h1>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '32px' }}>
          {issue.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <MapPin size={20} color="#64748b" />
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Адрес</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{issue.address || 'Не указан'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Calendar size={20} color="#64748b" />
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Дата создания</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{new Date(issue.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <User size={20} color="#64748b" />
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Заявитель</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{issue.userName}</div>
            </div>
          </div>
          {issue.assignedWorkerName && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <Clock size={20} color="#64748b" />
               <div>
                 <div style={{ fontSize: '12px', color: '#94a3b8' }}>Исполнитель</div>
                 <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{issue.assignedWorkerName}</div>
               </div>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Фотографии</h3>
        {issue.photoBefore || issue.photoAfter ? (
          <div style={{ display: 'grid', gridTemplateColumns: issue.photoAfter ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '40px' }}>
            {issue.photoBefore && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Фото "До"</div>
                <img src={issue.photoBefore} alt="До" style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover' }} />
              </div>
            )}
            {issue.photoAfter && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Фото "После"</div>
                <img src={issue.photoAfter} alt="После" style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>Нет фотографий</div>
        )}

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Статус заявки</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', padding: '0 10px', marginBottom: '16px' }}>
          {STATUS_TIMELINE.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_TIMELINE.length - 1 ? 1 : 0 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: i <= currentStep ? '#2563eb' : '#f1f5f9',
                  border: '3px solid white',
                  boxShadow: '0 0 0 1.5px ' + (i <= currentStep ? '#2563eb' : '#cbd5e1'),
                  zIndex: 2, position: 'relative'
                }} />
                <div style={{ 
                  position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)', 
                  fontSize: '11px', fontWeight: i <= currentStep ? 600 : 400,
                  color: i <= currentStep ? '#1e293b' : '#94a3b8',
                  whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </div>
              </div>
              {i < STATUS_TIMELINE.length - 1 && (
                <div style={{ flex: 1, height: 3, background: i < currentStep ? '#2563eb' : '#f1f5f9', zIndex: 1, margin: '0 -4px' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

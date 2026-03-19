'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { getIssues } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Issue } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Plus, MapPin, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const IssueMap = dynamic(() => import('@/components/IssueMap'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tab, setTab] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    const all = getIssues();
    setIssues(all.filter(i => i.userId === user.id));
  }, [user, router]);

  if (!user) return null;

  const myIssues = tab === 'all' ? issues
    : tab === 'active' ? issues.filter(i => ['new', 'moderation', 'in_progress'].includes(i.status))
    : issues.filter(i => ['resolved', 'closed'].includes(i.status));

  const stats = {
    total: issues.length,
    active: issues.filter(i => ['new', 'moderation', 'in_progress'].includes(i.status)).length,
    resolved: issues.filter(i => ['resolved', 'closed'].includes(i.status)).length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
  };

  const STATUS_TIMELINE = [
    { key: 'new', label: 'Новая' },
    { key: 'moderation', label: 'Модерация' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'resolved', label: 'Решено' },
    { key: 'closed', label: 'Закрыто' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
            Добро пожаловать, {user.name.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Ваш личный кабинет — отслеживайте статус поданных заявок
          </p>
        </div>
        <Link href="/issues/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} /> Новая заявка
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Всего заявок', value: stats.total, icon: <AlertCircle size={20} />, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Активных', value: stats.active, icon: <Clock size={20} />, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'В работе', value: stats.inProgress, icon: <TrendingUp size={20} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Решено', value: stats.resolved, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My issues map */}
      {issues.length > 0 && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            🗺️ Мои заявки на карте
          </h2>
          <IssueMap issues={issues} categories={MOCK_CATEGORIES} height="300px" />
        </div>
      )}

      {/* Issue list */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Мои заявки
          </h2>
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            {(['all', 'active', 'resolved'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#2563eb' : '#64748b',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {t === 'all' ? 'Все' : t === 'active' ? 'Активные' : 'Решённые'}
              </button>
            ))}
          </div>
        </div>

        {myIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
            <MapPin size={40} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 8px', color: '#64748b' }}>
              Нет заявок
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 20px' }}>
              Вы ещё не подавали заявок в этой категории.
            </p>
            <Link href="/issues/new" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={15} /> Подать первую заявку
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myIssues.map((issue, idx) => {
              const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
              const statusOrder = ['new', 'moderation', 'in_progress', 'resolved', 'closed'];
              const currentStep = statusOrder.indexOf(issue.status);
              return (
                <Link href={`/issues/${issue.id}`} key={issue.id} className="animate-fadeInUp" style={{
                  border: '1.5px solid #f1f5f9', borderRadius: '14px', overflow: 'hidden',
                  animationDelay: `${idx * 50}ms`, display: 'block', textDecoration: 'none', color: 'inherit',
                  transition: 'box-shadow 0.2s', cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', gap: '0' }}>
                    {issue.photoBefore && (
                      <img src={issue.photoBefore} alt="Фото" style={{
                        width: '100px', objectFit: 'cover', flexShrink: 0,
                      }} />
                    )}
                    <div style={{ padding: '16px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '20px', marginRight: '8px' }}>{cat?.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{issue.title}</span>
                        </div>
                        <StatusBadge status={issue.status} />
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>
                        {issue.description.slice(0, 100)}{issue.description.length > 100 && '...'}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8' }}>
                        <span>📍 {issue.address || 'Адрес не указан'}</span>
                        <span>📅 {new Date(issue.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      {/* Timeline */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '12px' }}>
                        {STATUS_TIMELINE.map((s, i) => (
                          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_TIMELINE.length - 1 ? 1 : 0 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                              background: i <= currentStep ? '#2563eb' : '#e2e8f0',
                              border: '2px solid white',
                              boxShadow: '0 0 0 1px ' + (i <= currentStep ? '#2563eb' : '#d1d5db'),
                            }} title={s.label} />
                            {i < STATUS_TIMELINE.length - 1 && (
                              <div style={{ flex: 1, height: 2, background: i < currentStep ? '#2563eb' : '#e2e8f0' }} />
                            )}
                          </div>
                        ))}
                      </div>
                      {issue.assignedWorkerName && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#0369a1', fontWeight: 500 }}>
                          🔧 Исполнитель: {issue.assignedWorkerName}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

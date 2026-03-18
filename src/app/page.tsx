'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { getIssues } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Issue, STATUS_LABELS } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { MapPin, Plus, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

const IssueMap = dynamic(() => import('@/components/IssueMap'), { ssr: false });

export default function HomePage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIssues(getIssues());
  }, []);

  const filteredIssues = filterCat === 'all'
    ? issues
    : issues.filter(i => i.categoryId === filterCat);

  const stats = {
    total: issues.length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    new: issues.filter(i => i.status === 'new').length,
  };

  const recentResolved = issues
    .filter(i => i.status === 'resolved' || i.status === 'closed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <div className="gradient-hero" style={{ padding: '48px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 80% 50%, rgba(99,179,237,0.2) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(147,197,253,0.15) 0%, transparent 50%)`,
        }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
              padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              🌆 Умный город
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white',
            margin: '0 0 16px', lineHeight: 1.1,
          }}>
            Сообщайте о проблемах.<br />
            <span style={{ color: '#93c5fd' }}>Следите за решением.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', margin: '0 0 32px', maxWidth: '520px' }}>
            Фиксируйте городские проблемы прямо со смартфона. Наши службы берутся за работу, вы получаете уведомления.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/issues/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', color: '#1d4ed8', padding: '14px 24px',
                borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
              }}>
                <Plus size={18} /> Подать заявку
              </Link>
            ) : (
              <Link href="/auth" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', color: '#1d4ed8', padding: '14px 24px',
                borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>
                <MapPin size={18} /> Начать
              </Link>
            )}
            <a href="#map" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.12)', color: 'white', padding: '14px 24px',
              borderRadius: '12px', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.25)',
            }}>
              Смотреть карту <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px', marginTop: '40px',
          }}>
            {[
              { label: 'Всего заявок', value: stats.total, icon: <AlertCircle size={18} />, color: '#93c5fd' },
              { label: 'Новых', value: stats.new, icon: <Clock size={18} />, color: '#fcd34d' },
              { label: 'В работе', value: stats.inProgress, icon: <TrendingUp size={18} />, color: '#86efac' },
              { label: 'Решено', value: stats.resolved, icon: <CheckCircle size={18} />, color: '#6ee7b7' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', padding: '16px',
              }}>
                <div style={{ color: stat.color, marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Map section */}
        <section id="map" style={{ marginTop: '-32px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                  🗺️ Интерактивная карта проблем
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  Кликните на маркер для подробностей
                </p>
              </div>
              {/* Category filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterCat('all')}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    border: '1.5px solid ' + (filterCat === 'all' ? '#2563eb' : '#e2e8f0'),
                    background: filterCat === 'all' ? '#eff6ff' : 'white',
                    color: filterCat === 'all' ? '#2563eb' : '#64748b', cursor: 'pointer',
                  }}>
                  Все
                </button>
                {MOCK_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCat(cat.id === filterCat ? 'all' : cat.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      border: '1.5px solid ' + (filterCat === cat.id ? cat.color : '#e2e8f0'),
                      background: filterCat === cat.id ? cat.color + '15' : 'white',
                      color: filterCat === cat.id ? cat.color : '#64748b', cursor: 'pointer',
                    }}>
                    {cat.icon} {cat.title}
                  </button>
                ))}
              </div>
            </div>
            {mounted && (
              <IssueMap issues={filteredIssues} categories={MOCK_CATEGORIES} height="450px" />
            )}
          </div>
        </section>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', margin: '24px 0 48px' }}>
          {/* Recent Issues feed */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              📋 Последние заявки
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {issues.slice(0, 6).map((issue, idx) => {
                const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
                return (
                  <div key={issue.id} className="animate-fadeInUp" style={{
                    display: 'flex', gap: '12px', padding: '12px',
                    border: '1.5px solid #f1f5f9', borderRadius: '12px',
                    transition: 'border-color 0.2s, background 0.2s', cursor: 'default',
                    animationDelay: `${idx * 60}ms`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px',
                      background: (cat?.color || '#3b82f6') + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0,
                    }}>
                      {cat?.icon || '📍'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {issue.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                        {new Date(issue.createdAt).toLocaleDateString('ru-RU')} · {cat?.title}
                      </div>
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolved feed */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              ✅ Решённые проблемы
            </h2>
            {recentResolved.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <p>Пока нет решённых проблем</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentResolved.map((issue, idx) => {
                  const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
                  return (
                    <div key={issue.id} className="animate-fadeInUp" style={{
                      borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #d1fae5',
                      animationDelay: `${idx * 80}ms`,
                    }}>
                      {issue.photoAfter && (
                        <img src={issue.photoAfter} alt="После" style={{
                          width: '100%', height: '120px', objectFit: 'cover',
                        }} />
                      )}
                      <div style={{ padding: '12px', background: '#f0fdf4' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                          {cat?.icon} {issue.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          📍 {issue.address}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 500 }}>
                          ✅ Решено: {new Date(issue.updatedAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

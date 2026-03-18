'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getIssues } from '@/lib/store';
import { MOCK_CATEGORIES, MOCK_USERS } from '@/lib/mockData';
import { Issue, IssueStatus, STATUS_LABELS } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import {
  Users, BarChart3, MapPin, Settings, TrendingUp,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'issues' | 'users' | 'categories'>('analytics');

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/auth'); return; }
    setIssues(getIssues());
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  const byStatus = (status: IssueStatus) => issues.filter(i => i.status === status).length;
  const byCategory = MOCK_CATEGORIES.map(cat => ({
    ...cat, count: issues.filter(i => i.categoryId === cat.id).length,
  })).sort((a, b) => b.count - a.count);

  const totalResolved = byStatus('resolved') + byStatus('closed');
  const resolutionRate = issues.length > 0 ? Math.round((totalResolved / issues.length) * 100) : 0;

  const tabs = [
    { key: 'analytics', label: 'Аналитика', icon: <BarChart3 size={15} /> },
    { key: 'issues', label: 'Все заявки', icon: <MapPin size={15} /> },
    { key: 'users', label: 'Пользователи', icon: <Users size={15} /> },
    { key: 'categories', label: 'Категории', icon: <Settings size={15} /> },
  ] as const;

  const topStats = [
    { label: 'Всего заявок', value: issues.length, icon: <AlertCircle size={22} />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Решено', value: totalResolved, icon: <CheckCircle size={22} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'В работе', value: byStatus('in_progress'), icon: <TrendingUp size={22} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Ожидают', value: byStatus('new'), icon: <Clock size={22} />, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
          ⚙️ Панель администратора
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Аналитика, управление пользователями и системой
        </p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {topStats.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution rate */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '4px' }}>📊 Общий процент решения проблем</div>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1 }}>
              {resolutionRate}%
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ height: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${resolutionRate}%`,
                background: 'linear-gradient(90deg, #86efac, #10b981)',
                borderRadius: 6, transition: 'width 1s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            background: activeTab === t.key ? 'white' : 'transparent',
            color: activeTab === t.key ? '#2563eb' : '#64748b',
            boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* By status */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              📊 По статусам
            </h3>
            {(['new', 'moderation', 'in_progress', 'resolved', 'closed'] as IssueStatus[]).map(status => {
              const count = byStatus(status);
              const pct = issues.length > 0 ? (count / issues.length) * 100 : 0;
              const colors: Record<string, string> = {
                new: '#94a3b8', moderation: '#f59e0b', in_progress: '#3b82f6',
                resolved: '#10b981', closed: '#0d9488',
              };
              return (
                <div key={status} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{STATUS_LABELS[status]}</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 4,
                      background: colors[status], transition: 'width 0.8s ease',
                      minWidth: count > 0 ? '8px' : '0',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* By category */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              🏷️ По категориям
            </h3>
            {byCategory.map(cat => {
              const pct = issues.length > 0 ? (cat.count / issues.length) * 100 : 0;
              return (
                <div key={cat.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#475569' }}>
                      {cat.icon} {cat.title}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{cat.count}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 4,
                      background: cat.color, transition: 'width 0.8s ease',
                      minWidth: cat.count > 0 ? '8px' : '0',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                {['ID', 'Заявитель', 'Категория', 'Название', 'Статус', 'Дата'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, idx) => {
                const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
                return (
                  <tr key={issue.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      #{issue.id.slice(-6)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                      {issue.userName}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {cat?.icon} {cat?.title}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1e293b', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.title}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(issue.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                {['Пользователь', 'Email', 'Роль', 'Зарегистрирован', 'Заявок'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u, idx) => {
                const roleColors: Record<string, string> = {
                  user: '#6366f1', moderator: '#f59e0b', worker: '#3b82f6', admin: '#10b981',
                };
                const roleLabels: Record<string, string> = {
                  user: 'Житель', moderator: 'Диспетчер', worker: 'Исполнитель', admin: 'Администратор',
                };
                const userIssueCount = issues.filter(i => i.userId === u.id).length;
                return (
                  <tr key={u.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0,
                      }}>
                        {u.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{u.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: roleColors[u.role] + '15', color: roleColors[u.role],
                        border: '1px solid ' + roleColors[u.role] + '30',
                      }}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {userIssueCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {MOCK_CATEGORIES.map(cat => {
            const count = issues.filter(i => i.categoryId === cat.id).length;
            const resolved = issues.filter(i => i.categoryId === cat.id && ['resolved', 'closed'].includes(i.status)).length;
            const rate = count > 0 ? Math.round((resolved / count) * 100) : 0;
            return (
              <div key={cat.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: cat.color + '18', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '24px',
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{cat.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{count} заявок</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Решено</span>
                  <span style={{ fontWeight: 700, color: cat.color }}>{rate}%</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${rate}%`, background: cat.color,
                    borderRadius: 3, transition: 'width 0.8s ease',
                    minWidth: rate > 0 ? '6px' : '0',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

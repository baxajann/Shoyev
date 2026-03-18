'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getIssues, updateIssueStatus } from '@/lib/store';
import { MOCK_CATEGORIES, MOCK_USERS } from '@/lib/mockData';
import { Issue } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { CheckCircle, XCircle, UserCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function ModeratorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [assignWorker, setAssignWorker] = useState('');
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'moderator') { router.push('/auth'); return; }
    setIssues(getIssues());
  }, [user, router]);

  const refresh = () => setIssues(getIssues());

  const workers = MOCK_USERS.filter(u => u.role === 'worker');

  const pendingIssues = issues.filter(i => i.status === 'new');
  const displayIssues = tab === 'pending' ? pendingIssues : issues;

  const handleApprove = (issue: Issue) => {
    const worker = workers.find(w => w.id === assignWorker) || workers[0];
    updateIssueStatus(issue.id, 'in_progress', {
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
    });
    setActionTarget(null);
    setActionType(null);
    setAssignWorker('');
    refresh();
  };

  const handleReject = (issue: Issue) => {
    updateIssueStatus(issue.id, 'closed', { rejectionReason: rejectReason || 'Не соответствует критериям' });
    setActionTarget(null);
    setActionType(null);
    setRejectReason('');
    refresh();
  };

  const stats = {
    pending: issues.filter(i => i.status === 'new').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => ['resolved', 'closed'].includes(i.status)).length,
  };

  if (!user || user.role !== 'moderator') return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px 48px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
          🛡️ Панель диспетчера
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Проверяйте заявки и назначайте исполнителей
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Ожидают проверки', value: stats.pending, color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={20} /> },
          { label: 'В работе', value: stats.inProgress, color: '#3b82f6', bg: '#eff6ff', icon: <UserCheck size={20} /> },
          { label: 'Завершено', value: stats.resolved, color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle size={20} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
        {([['pending', `На проверке (${stats.pending})`], ['all', 'Все заявки']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: tab === t ? 'white' : 'transparent',
            color: tab === t ? '#2563eb' : '#64748b',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayIssues.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <CheckCircle size={40} style={{ margin: '0 auto 12px', color: '#10b981' }} />
            <p style={{ fontWeight: 600, margin: 0 }}>Нет заявок для проверки 🎉</p>
          </div>
        ) : displayIssues.map((issue) => {
          const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
          const isExpanded = expanded === issue.id;
          const isActionTarget = actionTarget === issue.id;

          return (
            <div key={issue.id} className="card animate-fadeInUp" style={{ overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{
                display: 'flex', gap: '16px', padding: '20px', cursor: 'pointer', alignItems: 'flex-start',
              }} onClick={() => setExpanded(isExpanded ? null : issue.id)}>
                {issue.photoBefore && (
                  <img src={issue.photoBefore} alt="Фото" style={{
                    width: 72, height: 72, borderRadius: '10px', objectFit: 'cover', flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{cat?.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{issue.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <StatusBadge status={issue.status} />
                      {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    👤 {issue.userName} · 📍 {issue.address} · 📅 {new Date(issue.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '20px', background: '#f8fafc' }}>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>
                    {issue.description}
                  </p>

                  {/* Action buttons */}
                  {issue.status === 'new' && !isActionTarget && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn-primary" style={{ fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        onClick={() => { setActionTarget(issue.id); setActionType('approve'); }}>
                        <CheckCircle size={14} /> Одобрить и назначить
                      </button>
                      <button className="btn-danger" style={{ fontSize: '13px' }}
                        onClick={() => { setActionTarget(issue.id); setActionType('reject'); }}>
                        <XCircle size={14} /> Отклонить
                      </button>
                    </div>
                  )}

                  {isActionTarget && actionType === 'approve' && (
                    <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', margin: '0 0 12px' }}>
                        Назначить исполнителя:
                      </p>
                      <select value={assignWorker} onChange={e => setAssignWorker(e.target.value)}
                        className="input-field" style={{ marginBottom: '12px' }}>
                        <option value="">— Выбрать исполнителя —</option>
                        {workers.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" style={{ fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                          onClick={() => handleApprove(issue)}>
                          <CheckCircle size={14} /> Подтвердить
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '13px' }}
                          onClick={() => setActionTarget(null)}>Отмена</button>
                      </div>
                    </div>
                  )}

                  {isActionTarget && actionType === 'reject' && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b', margin: '0 0 12px' }}>
                        Причина отклонения:
                      </p>
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        className="input-field" placeholder="Укажите причину отклонения..." style={{ marginBottom: '12px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-danger" onClick={() => handleReject(issue)}>
                          <XCircle size={14} /> Отклонить
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '13px' }}
                          onClick={() => setActionTarget(null)}>Отмена</button>
                      </div>
                    </div>
                  )}

                  {issue.assignedWorkerName && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1d4ed8' }}>
                      🔧 Назначен: <strong>{issue.assignedWorkerName}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

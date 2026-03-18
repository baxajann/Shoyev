'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getIssues, updateIssueStatus } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { Issue } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Upload, CheckCircle, Clock, X } from 'lucide-react';

export default function WorkerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'worker') { router.push('/auth'); return; }
    refreshIssues();
  }, [user, router]);

  const refreshIssues = () => {
    const all = getIssues();
    if (user) {
      setIssues(all.filter(i => i.assignedWorkerId === user.id || i.status === 'in_progress'));
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPhotoAfter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, []);

  const handleMarkDone = async (issue: Issue) => {
    setUploading(issue.id);
    await new Promise(r => setTimeout(r, 800));
    updateIssueStatus(issue.id, 'resolved', { photoAfter: photoAfter || undefined });
    setPhotoAfter(null);
    setUploading(null);
    setExpanded(null);
    refreshIssues();
  };

  if (!user || user.role !== 'worker') return null;

  const active = issues.filter(i => i.status === 'in_progress');
  const done = issues.filter(i => ['resolved', 'closed'].includes(i.status));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 48px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
          🔧 Панель исполнителя
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Ваши задачи — загрузите фото после выполнения и закройте задачу.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'В работе сейчас', value: active.length, color: '#3b82f6', bg: '#eff6ff', icon: <Clock size={20} /> },
          { label: 'Выполнено мной', value: done.length, color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle size={20} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
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

      {/* Active tasks */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
        📋 Активные задачи
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {active.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <CheckCircle size={36} style={{ margin: '0 auto 10px', color: '#10b981' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Нет активных задач</p>
          </div>
        ) : active.map(issue => {
          const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
          const isExp = expanded === issue.id;
          return (
            <div key={issue.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '16px', padding: '20px', cursor: 'pointer' }}
                onClick={() => setExpanded(isExp ? null : issue.id)}>
                {issue.photoBefore && (
                  <img src={issue.photoBefore} alt="До" style={{
                    width: 80, height: 80, borderRadius: '12px', objectFit: 'cover', flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>
                    {cat?.icon} {issue.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    📍 {issue.address} · 📅 {new Date(issue.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {issue.description.slice(0, 120)}{issue.description.length > 120 && '...'}
                  </p>
                </div>
                <StatusBadge status={issue.status} />
              </div>

              {isExp && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '20px', background: '#f8fafc' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 12px' }}>
                    📸 Загрузите фото «после» для закрытия задачи:
                  </p>

                  {photoAfter ? (
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                      <img src={photoAfter} alt="После" style={{
                        width: '100%', borderRadius: '12px', maxHeight: '220px', objectFit: 'cover',
                      }} />
                      <button onClick={() => setPhotoAfter(null)} style={{
                        position: 'absolute', top: 10, right: 10, width: 30, height: 30,
                        borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                        color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      style={{
                        border: '2px dashed ' + (dragging ? '#2563eb' : '#cbd5e1'),
                        borderRadius: '12px', padding: '32px', textAlign: 'center',
                        background: dragging ? '#eff6ff' : 'white', cursor: 'pointer',
                        marginBottom: '16px', transition: 'all 0.2s',
                      }}
                      onClick={() => document.getElementById(`photo-${issue.id}`)?.click()}
                    >
                      <Upload size={28} color={dragging ? '#2563eb' : '#94a3b8'} style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        Drag & Drop или нажмите для загрузки фото «после»
                      </p>
                      <input id={`photo-${issue.id}`} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>
                  )}

                  {/* Before/After comparison */}
                  {issue.photoBefore && photoAfter && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>⬅️ ДО</div>
                        <img src={issue.photoBefore} style={{ width: '100%', borderRadius: '8px', height: '100px', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', marginBottom: '4px' }}>➡️ ПОСЛЕ</div>
                        <img src={photoAfter} style={{ width: '100%', borderRadius: '8px', height: '100px', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}

                  <button className="btn-primary" onClick={() => handleMarkDone(issue)}
                    disabled={uploading === issue.id}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {uploading === issue.id ? '⏳ Сохраняем...' : <><CheckCircle size={15} /> Отметить как выполнено</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done tasks */}
      {done.length > 0 && (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            ✅ Выполненные задачи
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {done.map(issue => {
              const cat = MOCK_CATEGORIES.find(c => c.id === issue.categoryId);
              return (
                <div key={issue.id} className="card" style={{ overflow: 'hidden' }}>
                  {issue.photoAfter ? (
                    <img src={issue.photoAfter} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '80px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      {cat?.icon}
                    </div>
                  )}
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{issue.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{issue.address}</div>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

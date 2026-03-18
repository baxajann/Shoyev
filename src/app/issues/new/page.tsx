'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { addIssue, generateId } from '@/lib/store';
import { Issue } from '@/lib/types';
import { ChevronLeft, ChevronRight, Upload, X, Check, MapPin } from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const STEPS = ['Категория', 'Описание', 'Фото', 'Место', 'Готово'];

export default function NewIssuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [lat, setLat] = useState<number>(43.252849);
  const [lng, setLng] = useState<number>(76.916709);
  const [address, setAddress] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => { if (step < 4) setStep(s => s + 1); };
  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const canNext = () => {
    if (step === 0) return !!categoryId;
    if (step === 1) return title.trim().length > 5 && description.trim().length > 10;
    if (step === 3) return lat !== 0 && lng !== 0;
    return true;
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, []);

  const handleSubmit = () => {
    if (!user) { router.push('/auth'); return; }
    const issue: Issue = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      categoryId,
      title,
      description,
      latitude: lat,
      longitude: lng,
      address,
      photoBefore: photo || undefined,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addIssue(issue);
    setSubmitted(true);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Для подачи заявки необходимо войти в систему.</p>
        <button className="btn-primary" onClick={() => router.push('/auth')} style={{ marginTop: '16px' }}>
          Войти
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card animate-fadeInUp" style={{ maxWidth: '440px', width: '100%', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            <Check size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#065f46', margin: '0 0 12px' }}>
            Заявка подана!
          </h2>
          <p style={{ color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
            Ваша заявка успешно зарегистрирована и отправлена на модерацию. Мы уведомим вас о статусе.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => router.push('/dashboard')}>
              Мои заявки
            </button>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(0); setCategoryId(''); setTitle(''); setDescription(''); setPhoto(null); setAddress(''); }}>
              <MapPin size={15} /> Ещё заявку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 48px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
        📝 Новая заявка
      </h1>
      <p style={{ color: '#64748b', margin: '0 0 32px', fontSize: '14px' }}>
        Опишите проблему, и городские службы займутся её устранением.
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '0' }}>
        {STEPS.map((s, idx) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: '13px',
                background: idx < step ? '#10b981' : idx === step ? '#2563eb' : '#e2e8f0',
                color: idx <= step ? 'white' : '#94a3b8',
                transition: 'all 0.3s',
              }}>
                {idx < step ? <Check size={14} /> : idx + 1}
              </div>
              <span style={{ fontSize: '10px', color: idx === step ? '#2563eb' : '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {s}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 6px', marginBottom: '18px',
                background: idx < step ? '#10b981' : '#e2e8f0', transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card animate-fadeIn" style={{ padding: '28px', minHeight: '300px' }}>
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              Выберите категорию проблемы
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {MOCK_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategoryId(cat.id)} style={{
                  padding: '18px 16px', borderRadius: '14px',
                  border: '2px solid ' + (categoryId === cat.id ? cat.color : '#e2e8f0'),
                  background: categoryId === cat.id ? cat.color + '12' : 'white',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                  <span style={{
                    fontWeight: 600, fontSize: '14px',
                    color: categoryId === cat.id ? cat.color : '#374151',
                  }}>{cat.title}</span>
                  {categoryId === cat.id && (
                    <Check size={16} color={cat.color} style={{ marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Description */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Опишите проблему
            </h2>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Краткое название *
              </label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="input-field" placeholder="Например: Яма на дороге у дома №5"
                maxLength={80}
              />
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                {title.length}/80
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Подробное описание *
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                className="input-field" placeholder="Опишите проблему подробно: размер, опасность, как давно возникла..."
                style={{ minHeight: '120px', resize: 'vertical' }} maxLength={500}
              />
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                {description.length}/500
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photo */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              Приложите фото (необязательно)
            </h2>
            {photo ? (
              <div style={{ position: 'relative' }}>
                <img src={photo} alt="Превью" style={{
                  width: '100%', borderRadius: '12px', maxHeight: '280px', objectFit: 'cover',
                }} />
                <button onClick={() => setPhoto(null)} style={{
                  position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  borderRadius: '14px', padding: '48px 24px', textAlign: 'center',
                  background: dragging ? '#eff6ff' : '#f8fafc', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => document.getElementById('photo-input')?.click()}
              >
                <Upload size={36} color={dragging ? '#2563eb' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>
                  Drag & Drop или нажмите для загрузки
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  JPG, PNG, WEBP — до 10 МБ
                </p>
                <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Map */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>
              Отметьте место проблемы
            </h2>
            <MapPicker lat={lat} lng={lng} onChange={(la, ln, addr) => {
              setLat(la); setLng(ln); setAddress(addr);
            }} />
            {address && (
              <div style={{
                marginTop: '12px', padding: '10px 14px', background: '#eff6ff',
                borderRadius: '10px', fontSize: '13px', color: '#1d4ed8', fontWeight: 500,
                border: '1px solid #bfdbfe',
              }}>
                📍 {address}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
              Проверьте и отправьте
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Категория', value: MOCK_CATEGORIES.find(c => c.id === categoryId)?.title || '—' },
                { label: 'Название', value: title },
                { label: 'Описание', value: description },
                { label: 'Место', value: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}` },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc',
                  borderRadius: '10px', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, minWidth: '80px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
              {photo && (
                <img src={photo} alt="Фото" style={{ width: '100%', borderRadius: '10px', maxHeight: '160px', objectFit: 'cover' }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {step > 0 ? (
          <button className="btn-secondary" onClick={handleBack}>
            <ChevronLeft size={16} /> Назад
          </button>
        ) : <div />}
        {step < 4 ? (
          <button className="btn-primary" onClick={handleNext} disabled={!canNext()}
            style={{ opacity: canNext() ? 1 : 0.5 }}>
            Далее <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit}>
            <Check size={16} /> Отправить заявку
          </button>
        )}
      </div>
    </div>
  );
}

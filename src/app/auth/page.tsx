'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/lib/store';
import { MOCK_USERS } from '@/lib/mockData';
import { ROLE_LABELS } from '@/lib/types';
import { MapPin, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const user = login(email, password);
    setLoading(false);
    if (user) {
      setUser(user);
      if (user.role === 'moderator') router.push('/moderator');
      else if (user.role === 'worker') router.push('/worker');
      else if (user.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } else {
      setError('Неверный email или пароль');
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('123456');
  };

  const demoAccounts = MOCK_USERS.map(u => ({ email: u.email, role: u.role, name: u.name.split(' ')[0] }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fadeInUp">
          <div style={{
            width: 64, height: 64, borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}>
            <MapPin size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 6px' }}>
            Город<span style={{ color: '#2563eb' }}>ОК</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Платформа городских проблем
          </p>
        </div>

        {/* Card */}
        <div className="card animate-fadeInUp" style={{ padding: '32px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#f1f5f9', borderRadius: '10px',
            padding: '4px', marginBottom: '24px',
          }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#2563eb' : '#64748b',
                fontWeight: tab === t ? 700 : 500,
                fontSize: '14px', transition: 'all 0.2s',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
                {t === 'login' ? <><LogIn size={14} style={{ marginRight: 6, display: 'inline' }} />Войти</> : <><UserPlus size={14} style={{ marginRight: 6, display: 'inline' }} />Регистрация</>}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Электронная почта
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="email@example.com" required
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Пароль
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field" placeholder="••••••" required
                    style={{ paddingRight: '48px' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8',
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                  padding: '10px 14px', color: '#dc2626', fontSize: '13px',
                }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                disabled={loading}>
                {loading ? '⏳ Вход...' : '🔐 Войти в систему'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚧</div>
              <p style={{ fontSize: '14px' }}>Регистрация будет доступна в следующей версии.</p>
              <p style={{ fontSize: '13px' }}>Используйте демо-аккаунты ниже.</p>
            </div>
          )}

          {/* Demo accounts */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              🎮 Демо-аккаунты (пароль: 123456)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoAccounts.map(acc => (
                <button key={acc.email} onClick={() => handleQuickLogin(acc.email)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                  border: '1.5px solid ' + (email === acc.email ? '#bfdbfe' : '#e2e8f0'),
                  borderRadius: '10px', background: email === acc.email ? '#eff6ff' : 'white',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0,
                  }}>
                    {acc.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{acc.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{ROLE_LABELS[acc.role]}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/types';
import {
  MapPin, Plus, LayoutDashboard, Shield, HardHat,
  Settings, LogOut, Menu, X, Bell
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth');
    setMenuOpen(false);
  };

  const navLinks = (() => {
    if (!user) return [];
    if (user.role === 'user') return [
      { href: '/dashboard', label: 'Мои заявки', icon: <LayoutDashboard size={16} /> },
      { href: '/issues/new', label: 'Новая заявка', icon: <Plus size={16} /> },
    ];
    if (user.role === 'moderator') return [
      { href: '/moderator', label: 'Модерация', icon: <Shield size={16} /> },
    ];
    if (user.role === 'worker') return [
      { href: '/worker', label: 'Мои задачи', icon: <HardHat size={16} /> },
    ];
    if (user.role === 'admin') return [
      { href: '/admin', label: 'Администрация', icon: <Settings size={16} /> },
    ];
    return [];
  })();

  const isActive = (href: string) => pathname === href;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '64px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>
          <MapPin size={18} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e3a8a' }}>
          Город<span style={{ color: '#2563eb' }}>ОК</span>
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '32px', flex: 1 }}
        className="desktop-nav">
        <Link href="/" style={{
          padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          textDecoration: 'none',
          background: isActive('/') ? '#eff6ff' : 'transparent',
          color: isActive('/') ? '#2563eb' : '#475569',
        }}>
          Карта проблем
        </Link>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            background: isActive(link.href) ? '#eff6ff' : 'transparent',
            color: isActive(link.href) ? '#2563eb' : '#475569',
            transition: 'all 0.15s',
          }}>
            {link.icon}{link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        {user ? (
          <>
            <button style={{
              width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e2e8f0',
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#64748b', position: 'relative',
            }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                background: '#2563eb', borderRadius: '50%', border: '2px solid white',
              }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{user.name.split(' ')[0]}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{ROLE_LABELS[user.role]}</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '14px',
              }}>
                {user.name.charAt(0)}
              </div>
              <button onClick={handleLogout} style={{
                width: 34, height: 34, borderRadius: '8px', border: '1.5px solid #fecaca',
                background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#dc2626', transition: 'all 0.15s',
              }}
                title="Выйти">
                <LogOut size={15} />
              </button>
            </div>
          </>
        ) : (
          <Link href="/auth" className="btn-primary" style={{ textDecoration: 'none' }}>
            Войти
          </Link>
        )}
        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', width: 36, height: 36, borderRadius: '8px',
          border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center', color: '#475569',
        }} className="mobile-menu-btn">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 999,
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            background: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
          }} onClick={e => e.stopPropagation()}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={{
              padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
              color: '#1e293b', fontWeight: 500, background: '#f8fafc',
            }}>🗺️ Карта проблем</Link>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                color: '#1e293b', fontWeight: 500, background: '#f8fafc',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {link.icon}{link.label}
              </Link>
            ))}
            {user && (
              <button onClick={handleLogout} style={{
                padding: '12px 16px', borderRadius: '10px', border: 'none',
                background: '#fef2f2', color: '#dc2626', fontWeight: 500,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <LogOut size={16} /> Выйти
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

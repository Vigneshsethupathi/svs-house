import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserAvatar({ size = 38 }) {
  const { user, userProfile } = useAuth();
  const photoURL = user?.photoURL || userProfile?.photoURL || '';
  const name = userProfile?.name || user?.displayName || 'U';
  const email = user?.email || '';

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const colors = ['#1a5276', '#117a65', '#784212', '#6c3483', '#922b21'];
  const colorIdx = email.charCodeAt(0) % colors.length;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          referrerPolicy="no-referrer"
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: colors[colorIdx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <span style={{ color: '#fff', fontSize: size * 0.35, fontWeight: 700 }}>{initials}</span>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { LogOut, Mail, Shield, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

export default function UsersPage() {
  const { t, lang, toggleLang } = useLang();
  const { user, userProfile, logout } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db,'users'), snap => setUsers(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, []);

  const displayName = userProfile?.name || user?.displayName || 'User';
  const email = user?.email || userProfile?.email || '';
  const avatarColors = ['#2563eb','#16a34a','#d97706','#7c3aed','#0891b2'];
  const getColor = e => avatarColors[(e||'').charCodeAt(0)%avatarColors.length];
  const getInitials = n => (n||'U').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{paddingBottom:90}}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerRow}>
          <h2 style={S.title}>{t.users}</h2>
          <button style={S.langBtn} onClick={toggleLang} className="btn-press">
            🌐 {lang==='en'?'தமிழ்':'English'}
          </button>
        </div>

        {/* My profile */}
        <div style={S.myCard} className="animate-fadeInUp stagger-1">
          <div style={S.myAvatarWrap}>
            <UserAvatar size={68}/>
            <div style={S.onlineDot}/>
          </div>
          <div style={{flex:1}}>
            <p style={S.myName}>{displayName}</p>
            <div style={S.emailRow}>
              <Mail size={11} color="rgba(255,255,255,0.55)"/>
              <p style={S.myEmail}>{email}</p>
            </div>
            <div style={S.roleRow}>
              {userProfile?.role==='admin' ? <Shield size={12} color="#fbbf24"/> : <User size={12} color="rgba(255,255,255,0.6)"/>}
              <span style={S.roleBadge}>{userProfile?.role==='admin'?t.admin:t.member}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <p style={S.sectionTitle}>Team Members</p>
          <span style={S.countBadge}>{users.length}</span>
        </div>

        {users.map((u,i) => (
          <div key={u.id} style={S.userCard} className={`animate-fadeInUp stagger-${Math.min(i+1,5)}`}>
            <div style={S.userLeft}>
              {u.photoURL
                ? <img src={u.photoURL} alt={u.name} referrerPolicy="no-referrer" style={S.userPhoto}/>
                : <div style={{...S.userAvatar, background:getColor(u.email)+'22'}}>
                    <span style={{...S.userAvatarText, color:getColor(u.email)}}>{getInitials(u.name)}</span>
                  </div>
              }
              <div style={{flex:1,minWidth:0}}>
                <p style={S.userName}>{u.name}</p>
                <p style={S.userEmail}>{u.email}</p>
              </div>
            </div>
            <span style={{...S.badge, ...(u.role==='admin'?S.adminBadge:S.memberBadge)}}>
              {u.role==='admin'?<>👑 {t.admin}</>:<>{t.member}</>}
            </span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{padding:'8px 12px 16px'}}>
        <button style={S.logoutBtn} onClick={logout} className="btn-press">
          <LogOut size={18}/>
          {t.logout}
        </button>
      </div>
    </div>
  );
}

const S = {
  header:{background:'linear-gradient(160deg,#0c4a6e,#0891b2)',padding:'20px 16px 0',overflow:'hidden'},
  headerRow:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18},
  title:{fontSize:22,fontWeight:800,color:'#fff',margin:0},
  langBtn:{background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',borderRadius:20,padding:'7px 14px',cursor:'pointer',fontSize:13,fontWeight:500},
  myCard:{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(12px)',borderRadius:'14px 14px 0 0',padding:'16px',display:'flex',gap:14,alignItems:'center',border:'1px solid rgba(255,255,255,0.15)',borderBottom:'none'},
  myAvatarWrap:{position:'relative',flexShrink:0},
  onlineDot:{position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:'50%',background:'#22c55e',border:'2px solid rgba(255,255,255,0.8)'},
  myName:{color:'#fff',fontSize:18,fontWeight:800,margin:'0 0 4px'},
  emailRow:{display:'flex',alignItems:'center',gap:5,marginBottom:8},
  myEmail:{color:'rgba(255,255,255,0.6)',fontSize:12,margin:0,overflow:'hidden',textOverflow:'ellipsis'},
  roleRow:{display:'flex',alignItems:'center',gap:5},
  roleBadge:{fontSize:11,color:'rgba(255,255,255,0.85)',fontWeight:600},
  section:{padding:'14px 12px 0'},
  sectionHead:{display:'flex',alignItems:'center',gap:8,marginBottom:10},
  sectionTitle:{fontSize:15,fontWeight:700,color:'#1e293b',margin:0},
  countBadge:{background:'#0891b2',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10},
  userCard:{background:'#fff',borderRadius:16,padding:'12px',marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'},
  userLeft:{display:'flex',gap:12,alignItems:'center',flex:1,minWidth:0},
  userPhoto:{width:46,height:46,borderRadius:14,objectFit:'cover',flexShrink:0},
  userAvatar:{width:46,height:46,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  userAvatarText:{fontSize:16,fontWeight:800},
  userName:{fontSize:14,fontWeight:700,color:'#1e293b',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  userEmail:{fontSize:11,color:'#94a3b8',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  badge:{fontSize:11,padding:'4px 10px',borderRadius:10,fontWeight:600,flexShrink:0},
  adminBadge:{background:'#fef3c7',color:'#92400e'},
  memberBadge:{background:'#f1f5f9',color:'#64748b'},
  logoutBtn:{width:'100%',padding:14,background:'#fff',color:'#ef4444',border:'1.5px solid #fecaca',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'},
};

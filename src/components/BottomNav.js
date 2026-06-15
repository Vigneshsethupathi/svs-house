import React from 'react';
import { Home, Package, CreditCard, Camera, Users } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function BottomNav({ active, setActive }) {
  const { t } = useLang();
  const tabs = [
    { id:'dashboard', icon:Home, label:t.dashboard, color:'#2563eb' },
    { id:'materials', icon:Package, label:t.materials, color:'#16a34a' },
    { id:'payments', icon:CreditCard, label:t.payments, color:'#d97706' },
    { id:'photos', icon:Camera, label:t.photos, color:'#7c3aed' },
    { id:'users', icon:Users, label:t.users, color:'#0891b2' },
  ];
  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const on = active === tab.id;
          return (
            <button key={tab.id} style={S.tab} onClick={() => setActive(tab.id)} className="btn-press">
              <div style={{...S.iconWrap, background: on ? tab.color+'18' : 'transparent', transform: on ? 'scale(1.05)' : 'scale(1)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
                <Icon size={22} color={on ? tab.color : '#94a3b8'} strokeWidth={on ? 2.2 : 1.8} />
              </div>
              <span style={{...S.label, color: on ? tab.color : '#94a3b8', fontWeight: on ? 600 : 400}}>
                {tab.label}
              </span>
              {on && <div style={{...S.activeDot, background: tab.color}} className="animate-popIn" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const S = {
  nav:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(0,0,0,0.06)',zIndex:100,paddingBottom:'env(safe-area-inset-bottom)'},
  inner:{display:'flex'},
  tab:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 4px 10px',background:'none',border:'none',cursor:'pointer',position:'relative',gap:2},
  iconWrap:{width:44,height:34,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12},
  label:{fontSize:10,letterSpacing:0.2},
  activeDot:{position:'absolute',bottom:4,width:4,height:4,borderRadius:'50%'}
};

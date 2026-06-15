import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, CreditCard, IndianRupee, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { listenTo, saveBudget } from '../utils/firestore';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

export default function Dashboard() {
  const { t } = useLang();
  const { userProfile, user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [budget, setBudget] = useState(0);
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const u1 = listenTo('materials', setMaterials);
    const u2 = listenTo('payments', setPayments);
    const u3 = listenTo('logs', setLogs);
    const u4 = onSnapshot(doc(db, 'settings', 'budget'), snap => { if (snap.exists()) setBudget(snap.data().amount || 0); });
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const totalMaterials = materials.reduce((s, m) => s + (Number(m.totalCost) || 0), 0);
  const totalPayments = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalSpent = totalMaterials + totalPayments;
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const fmt = v => '₹' + Number(v).toLocaleString('en-IN');
  const fmtTime = ts => { if (!ts) return ''; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); };
  const firstName = (userProfile?.name || user?.displayName || 'User').split(' ')[0];

  const cards = [
    { label:t.totalSpent, value:fmt(totalSpent), grad:'linear-gradient(135deg,#1e40af,#3b82f6)', icon:IndianRupee, delay:'stagger-1' },
    { label:t.totalMaterials, value:fmt(totalMaterials), grad:'linear-gradient(135deg,#065f46,#10b981)', icon:Package, delay:'stagger-2' },
    { label:t.totalPayments, value:fmt(totalPayments), grad:'linear-gradient(135deg,#92400e,#f59e0b)', icon:CreditCard, delay:'stagger-3' },
    { label:t.balance, value:fmt(remaining), grad: remaining < 0 ? 'linear-gradient(135deg,#7f1d1d,#ef4444)' : 'linear-gradient(135deg,#14532d,#22c55e)', icon:TrendingUp, delay:'stagger-4' },
  ];

  const actionIcon = a => { if(a?.includes('MATERIAL')) return '📦'; if(a?.includes('PAYMENT')) return '💰'; if(a?.includes('PHOTO')) return '📷'; return '📝'; };

  return (
    <div style={{paddingBottom:90}}>
      {/* Hero header */}
      <div style={S.header}>
        <div style={S.headerBg} />
        <div style={S.headerContent}>
          <div className="animate-fadeIn">
            <p style={S.greeting}>{t.welcome}, {firstName} 👋</p>
            <h1 style={S.heroTitle}>SVS House</h1>
            <p style={S.heroSub}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
          </div>
          <div className="animate-popIn stagger-2">
            <UserAvatar size={48} />
          </div>
        </div>

        {/* Budget card inside header */}
        <div style={S.budgetCard} className="animate-fadeInUp stagger-2">
          <div style={S.budgetTop}>
            <div>
              <p style={S.budgetLbl}>{t.totalBudget}</p>
              {editBudget
                ? <div style={S.budgetEditRow}>
                    <input style={S.budgetInput} type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} autoFocus placeholder="0" />
                    <button style={S.budgetSaveBtn} onClick={async()=>{await saveBudget(Number(budgetInput));setBudget(Number(budgetInput));setEditBudget(false)}}><Check size={16}/></button>
                    <button style={S.budgetCancelBtn} onClick={()=>setEditBudget(false)}><X size={16}/></button>
                  </div>
                : <p style={S.budgetVal}>{fmt(budget)}</p>
              }
            </div>
            {!editBudget && <button style={S.editBtn} onClick={()=>{setEditBudget(true);setBudgetInput(budget)}} className="btn-press"><Edit2 size={15} color="rgba(255,255,255,0.7)"/></button>}
          </div>
          {budget > 0 && <>
            <div style={S.progressBg}>
              <div style={{...S.progressFill, width:`${pct}%`, background: pct>90?'#ef4444':pct>70?'#f59e0b':'#22c55e', transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)'}} />
            </div>
            <div style={S.progressRow}>
              <span style={S.progressLbl}>{Math.round(pct)}% {t.totalSpent.toLowerCase()}</span>
              <span style={{...S.progressLbl, color: remaining<0?'#fca5a5':'rgba(255,255,255,0.7)'}}>
                {remaining < 0 ? <span style={{display:'flex',alignItems:'center',gap:4}}><AlertTriangle size={11}/>{t.budgetWarning}</span> : `${fmt(remaining)} left`}
              </span>
            </div>
          </>}
        </div>
      </div>

      {/* Stat cards */}
      <div style={S.cardsGrid}>
        {cards.map((c,i) => {
          const Icon = c.icon;
          return (
            <div key={i} style={{...S.statCard, background:c.grad}} className={`animate-fadeInUp ${c.delay} btn-press`}>
              <div style={S.statIconWrap}><Icon size={20} color="rgba(255,255,255,0.9)"/></div>
              <p style={S.statVal}>{c.value}</p>
              <p style={S.statLbl}>{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div style={S.section} className="animate-fadeInUp stagger-4">
        <div style={S.sectionHead}>
          <h2 style={S.sectionTitle}>{t.recentActivity}</h2>
          <span style={S.countBadge}>{logs.length}</span>
        </div>
        {logs.length === 0 && <div style={S.empty}><p>🏗️</p><p style={{fontSize:13,color:'#94a3b8',marginTop:6}}>{t.noData}</p></div>}
        {logs.slice(0,6).map((log,i) => (
          <div key={log.id} style={S.logRow} className={`animate-fadeIn stagger-${Math.min(i+1,5)}`}>
            <div style={S.logIconBox}>{actionIcon(log.action)}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={S.logText}>{log.details}</p>
              <p style={S.logMeta}>{log.userName} · {fmtTime(log.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  header:{background:'linear-gradient(160deg,#0f2444,#1a5276,#0e6655)',padding:'20px 16px 0',position:'relative',overflow:'hidden',paddingTop:'env(safe-area-inset-top, 20px)'},
  headerBg:{position:'absolute',inset:0,background:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'},
  headerContent:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,position:'relative'},
  greeting:{fontSize:13,color:'rgba(255,255,255,0.7)',margin:'0 0 3px'},
  heroTitle:{fontSize:26,fontWeight:900,color:'#fff',margin:'0 0 3px',letterSpacing:2},
  heroSub:{fontSize:11,color:'rgba(255,255,255,0.5)',margin:0},
  budgetCard:{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(16px)',borderRadius:'18px 18px 0 0',padding:'16px 16px 20px',border:'1px solid rgba(255,255,255,0.15)',position:'relative'},
  budgetTop:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12},
  budgetLbl:{fontSize:11,color:'rgba(255,255,255,0.65)',margin:'0 0 4px',fontWeight:500,textTransform:'uppercase',letterSpacing:0.5},
  budgetVal:{fontSize:24,fontWeight:800,color:'#fff',margin:0},
  budgetEditRow:{display:'flex',gap:6,alignItems:'center'},
  budgetInput:{background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'6px 10px',color:'#fff',fontSize:18,fontWeight:700,width:140,outline:'none'},
  budgetSaveBtn:{width:32,height:32,borderRadius:8,background:'#22c55e',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'},
  budgetCancelBtn:{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.2)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'},
  editBtn:{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  progressBg:{height:8,background:'rgba(255,255,255,0.15)',borderRadius:4,overflow:'hidden'},
  progressFill:{height:'100%',borderRadius:4},
  progressRow:{display:'flex',justifyContent:'space-between',marginTop:6},
  progressLbl:{fontSize:11,color:'rgba(255,255,255,0.65)'},
  cardsGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'14px 12px 0'},
  statCard:{borderRadius:16,padding:'14px 14px',boxShadow:'0 4px 16px rgba(0,0,0,0.15)',overflow:'hidden',position:'relative'},
  statIconWrap:{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10},
  statVal:{fontSize:18,fontWeight:800,color:'#fff',margin:'0 0 3px'},
  statLbl:{fontSize:10,color:'rgba(255,255,255,0.75)',margin:0,fontWeight:500},
  section:{margin:'16px 12px 0'},
  sectionHead:{display:'flex',alignItems:'center',gap:8,marginBottom:12},
  sectionTitle:{fontSize:15,fontWeight:700,color:'#1e293b',margin:0},
  countBadge:{background:'#1a5276',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10},
  logRow:{display:'flex',gap:12,marginBottom:10,alignItems:'flex-start',background:'#fff',borderRadius:14,padding:'10px 12px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'},
  logIconBox:{width:36,height:36,borderRadius:10,background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0},
  logText:{fontSize:13,color:'#334155',margin:'0 0 3px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  logMeta:{fontSize:11,color:'#94a3b8',margin:0},
  empty:{textAlign:'center',padding:'32px 0',fontSize:28},
};

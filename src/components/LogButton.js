import React, { useState, useEffect } from 'react';
import { ClipboardList, X, Zap } from 'lucide-react';
import { listenTo } from '../utils/firestore';
import { useLang } from '../context/LangContext';

export default function LogButton() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => { return listenTo('logs', data => { setLogs(data); setNewCount(n => n + 1); }, 'timestamp'); }, []);

  const fmtTime = ts => { if(!ts) return ''; const d = ts.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); };

  const actionGrad = a => {
    if(a?.includes('ADD')) return 'linear-gradient(135deg,#dcfce7,#bbf7d0)';
    if(a?.includes('EDIT')) return 'linear-gradient(135deg,#fef3c7,#fde68a)';
    if(a?.includes('DELETE')) return 'linear-gradient(135deg,#fee2e2,#fecaca)';
    return 'linear-gradient(135deg,#dbeafe,#bfdbfe)';
  };
  const actionColor = a => { if(a?.includes('ADD')) return '#16a34a'; if(a?.includes('EDIT')) return '#d97706'; if(a?.includes('DELETE')) return '#dc2626'; return '#2563eb'; };
  const actionIcon = a => { if(a?.includes('MATERIAL')) return '📦'; if(a?.includes('PAYMENT')) return '💰'; if(a?.includes('PHOTO')) return '📷'; return '📝'; };

  return (
    <>
      <button style={S.fab} onClick={()=>{setOpen(true);setNewCount(0);}} className="btn-press">
        <ClipboardList size={22} color="#fff"/>
        {newCount > 0 && <span style={S.badge} className="animate-bounceIn">{newCount > 99 ? '99+' : newCount}</span>}
        <div style={S.fabRing}/>
      </button>

      {open && (
        <div style={S.overlay} onClick={()=>setOpen(false)}>
          <div style={S.drawer} onClick={e=>e.stopPropagation()} className="animate-slideUp">
            <div style={S.handle}/>
            <div style={S.drawerHeader}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={S.headerIcon}><Zap size={16} color="#fff"/></div>
                <span style={S.drawerTitle}>{t.activityLog}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={S.logCount}>{logs.length} entries</span>
                <button style={S.closeBtn} onClick={()=>setOpen(false)} className="btn-press"><X size={18}/></button>
              </div>
            </div>

            <div style={S.logList}>
              {logs.length===0 && <div style={S.empty}><Zap size={32} color="#e2e8f0"/><p style={{color:'#94a3b8',fontSize:13,marginTop:8}}>{t.noData}</p></div>}
              {logs.map((log,i) => (
                <div key={log.id} style={{...S.logItem, animationDelay:`${i*0.03}s`}} className="animate-fadeInUp">
                  <div style={{...S.logIconBox, background:actionGrad(log.action)}}>
                    <span style={{fontSize:18}}>{actionIcon(log.action)}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={S.logText}>{log.details}</p>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                      <span style={{...S.actionTag, color:actionColor(log.action), background:actionColor(log.action)+'15'}}>{log.action?.replace(/_/g,' ')}</span>
                      <span style={S.logMeta}>{log.userName}</span>
                    </div>
                  </div>
                  <span style={S.logTime}>{fmtTime(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  fab:{position:'fixed',bottom:80,right:16,width:54,height:54,borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#2563eb)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 6px 20px rgba(37,99,235,0.4)',zIndex:99,position:'fixed'},
  badge:{position:'absolute',top:-4,right:-4,background:'#ef4444',color:'#fff',fontSize:10,borderRadius:10,padding:'2px 5px',fontWeight:700,minWidth:18,textAlign:'center'},
  fabRing:{position:'absolute',inset:-4,borderRadius:'50%',border:'2px solid rgba(37,99,235,0.3)',animation:'pulse 2s ease-in-out infinite'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end',backdropFilter:'blur(4px)'},
  drawer:{width:'100%',background:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'80vh',display:'flex',flexDirection:'column'},
  handle:{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'10px auto 0',flexShrink:0},
  drawerHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #f1f5f9',flexShrink:0},
  headerIcon:{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#1a3a5c,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center'},
  drawerTitle:{fontSize:16,fontWeight:700,color:'#1e293b'},
  logCount:{fontSize:11,color:'#94a3b8',fontWeight:500},
  closeBtn:{background:'#f1f5f9',border:'none',borderRadius:10,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  logList:{overflowY:'auto',flex:1,padding:'8px 0 16px'},
  logItem:{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 16px',borderBottom:'1px solid #f8fafc'},
  logIconBox:{width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  logText:{fontSize:13,color:'#334155',margin:0,fontWeight:500},
  actionTag:{fontSize:9,padding:'2px 6px',borderRadius:4,fontWeight:700},
  logMeta:{fontSize:11,color:'#94a3b8'},
  logTime:{fontSize:10,color:'#cbd5e1',whiteSpace:'nowrap',flexShrink:0,marginTop:2},
  empty:{display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 0'},
};

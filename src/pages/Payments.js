import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import { listenTo, addPayment, updatePayment, deletePayment } from '../utils/firestore';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const empty = { paymentTo:'', amount:'', date:new Date().toISOString().split('T')[0], note:'' };

const recipientColors = ['#2563eb','#16a34a','#d97706','#7c3aed','#0891b2','#dc2626'];
const getColor = name => recipientColors[(name||'').charCodeAt(0) % recipientColors.length];
const getInitial = name => (name||'?')[0].toUpperCase();

export default function Payments() {
  const { t } = useLang();
  const { userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => listenTo('payments', setItems), []);

  const open = (item=null) => {
    setForm(item ? {...item} : empty);
    setEditId(item ? item.id : null);
    setModal(true);
  };

  const save = async () => {
    if(!form.paymentTo || !form.amount) return;
    setLoading(true);
    if(editId) await updatePayment(editId, form, userProfile);
    else await addPayment(form, userProfile);
    setModal(false); setLoading(false);
  };

  const remove = async item => { if(!window.confirm(t.confirmDelete)) return; await deletePayment(item.id, item, userProfile); };

  const filtered = filterMonth === 'all' ? items : items.filter(i => { const d = new Date(i.date); return MONTHS[d.getMonth()] === filterMonth; });
  const total = filtered.reduce((s,i) => s+(Number(i.amount)||0), 0);

  // group by month
  const groups = {};
  filtered.forEach(i => {
    const d = new Date(i.date);
    const key = isNaN(d) ? 'Other' : MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    if(!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  return (
    <div style={{paddingBottom:90}}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <h2 style={S.title}>{t.payments}</h2>
            <p style={S.sub}>{filtered.length} {t.payments.toLowerCase()}</p>
          </div>
          <button style={S.addBtn} onClick={()=>open()} className="btn-press animate-popIn">
            <Plus size={22} color="#fff" strokeWidth={2.5}/>
          </button>
        </div>

        {/* Total */}
        <div style={S.totalBanner} className="animate-fadeInUp stagger-2">
          <div>
            <p style={S.totalLbl}>{t.totalPayments}</p>
            <p style={S.totalVal}>₹{Number(total).toLocaleString('en-IN')}</p>
          </div>
          <div style={S.trendIcon}>
            <TrendingUp size={28} color="rgba(255,255,255,0.8)"/>
          </div>
        </div>
      </div>

      {/* Month filter chips */}
      <div style={S.catScroll} className="animate-fadeIn stagger-1">
        <button style={{...S.chip,...(filterMonth==='all'?S.chipOn:{})}} onClick={()=>setFilterMonth('all')}>{t.all}</button>
        {MONTHS.map(m => (
          <button key={m} style={{...S.chip,...(filterMonth===m?S.chipOn:{})}} onClick={()=>setFilterMonth(m)}>{m}</button>
        ))}
      </div>

      {/* Payment groups */}
      <div style={{padding:'0 12px'}}>
        {Object.keys(groups).length === 0 && (
          <div style={S.emptyState}>
            <span style={{fontSize:48}}>💳</span>
            <p style={S.emptyText}>{t.noData}</p>
          </div>
        )}
        {Object.entries(groups).map(([month, list], gi) => (
          <div key={month} className={`animate-fadeInUp stagger-${Math.min(gi+1,4)}`}>
            <div style={S.monthHead}>
              <span style={S.monthLbl}>{month}</span>
              <span style={S.monthTotal}>₹{list.reduce((s,i)=>s+(Number(i.amount)||0),0).toLocaleString('en-IN')}</span>
            </div>
            {list.map((item,i) => (
              <div key={item.id} style={S.card} className="btn-press">
                <div style={{...S.avatar, background: getColor(item.paymentTo)+'22'}}>
                  <span style={{...S.avatarText, color: getColor(item.paymentTo)}}>{getInitial(item.paymentTo)}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={S.toName}>{item.paymentTo}</p>
                  {item.note && <p style={S.noteText}>{item.note}</p>}
                  <p style={S.metaText}>{item.date} · {item.createdBy}</p>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <p style={S.amount}>₹{Number(item.amount).toLocaleString('en-IN')}</p>
                  <div style={{display:'flex',gap:5}}>
                    <button style={S.iconBtn} onClick={()=>open(item)} className="btn-press"><Edit2 size={13} color="#64748b"/></button>
                    <button style={{...S.iconBtn,background:'#fef2f2'}} onClick={()=>remove(item)} className="btn-press"><Trash2 size={13} color="#ef4444"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={S.overlay} onClick={()=>setModal(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()} className="animate-slideUp">
            <div style={S.handle}/>
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>{t.addPayment}</span>
              <button style={S.closeBtn} onClick={()=>setModal(false)} className="btn-press"><X size={20}/></button>
            </div>
            <div style={S.modalBody}>
              <F label={t.paymentTo} value={form.paymentTo} onChange={v=>setForm({...form,paymentTo:v})} placeholder={t.engineer}/>
              <F label={t.paymentAmount} value={form.amount} onChange={v=>setForm({...form,amount:v})} type="number" prefix="₹"/>
              <F label={t.paymentDate} value={form.date} onChange={v=>setForm({...form,date:v})} type="date"/>
              <div style={{marginBottom:16}}>
                <label style={S.lbl}>{t.photoNote}</label>
                <textarea style={S.textarea} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder={t.addNote} rows={2}/>
              </div>
              {form.amount && (
                <div style={S.previewBox} className="animate-popIn">
                  <span style={S.previewLbl}>Payment Preview</span>
                  <span style={S.previewVal}>₹{Number(form.amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <button style={S.saveBtn} onClick={save} disabled={loading} className="btn-press">
                {loading ? <div style={S.spinner}/> : `💰 ${t.save}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({label,value,onChange,type='text',placeholder='',prefix}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,color:'#64748b',fontWeight:500,display:'block',marginBottom:5}}>{label}</label>
      <div style={{position:'relative'}}>
        {prefix && <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,fontWeight:600,color:'#64748b'}}>{prefix}</span>}
        <input style={{width:'100%',padding:`10px 12px 10px ${prefix?'28px':'12px'}`,border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',background:'#f8fafc'}} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={e=>e.target.style.borderColor='#d97706'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
      </div>
    </div>
  );
}

const S = {
  header:{background:'linear-gradient(160deg,#78350f,#d97706)',padding:'20px 16px 0',position:'relative',overflow:'hidden'},
  headerRow:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},
  title:{fontSize:22,fontWeight:800,color:'#fff',margin:0},
  sub:{fontSize:12,color:'rgba(255,255,255,0.65)',margin:'3px 0 0'},
  addBtn:{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  totalBanner:{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',borderRadius:'14px 14px 0 0',padding:'14px 16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid rgba(255,255,255,0.15)',borderBottom:'none'},
  totalLbl:{fontSize:11,color:'rgba(255,255,255,0.7)',margin:'0 0 4px',fontWeight:500,textTransform:'uppercase',letterSpacing:0.5},
  totalVal:{fontSize:26,fontWeight:900,color:'#fff',margin:0},
  trendIcon:{width:52,height:52,borderRadius:16,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'},
  catScroll:{display:'flex',gap:8,overflowX:'auto',padding:'12px 12px 8px',scrollbarWidth:'none'},
  chip:{flexShrink:0,padding:'6px 14px',borderRadius:20,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:12,cursor:'pointer',color:'#64748b',fontWeight:500,transition:'all 0.2s'},
  chipOn:{background:'#d97706',color:'#fff',borderColor:'#d97706'},
  monthHead:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 4px',marginBottom:8},
  monthLbl:{fontSize:13,fontWeight:700,color:'#1e293b'},
  monthTotal:{fontSize:13,fontWeight:700,color:'#d97706'},
  card:{background:'#fff',borderRadius:16,padding:'12px',marginBottom:8,display:'flex',alignItems:'flex-start',gap:12,boxShadow:'0 2px 8px rgba(0,0,0,0.05)',transition:'transform 0.15s'},
  avatar:{width:44,height:44,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  avatarText:{fontSize:18,fontWeight:800},
  toName:{fontSize:14,fontWeight:700,color:'#1e293b',margin:'0 0 2px'},
  noteText:{fontSize:12,color:'#64748b',margin:'0 0 2px'},
  metaText:{fontSize:11,color:'#94a3b8',margin:0},
  amount:{fontSize:17,fontWeight:800,color:'#d97706',margin:0},
  iconBtn:{width:30,height:30,background:'#f1f5f9',border:'none',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  emptyState:{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 0',gap:8},
  emptyText:{color:'#94a3b8',fontSize:14,margin:0},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end',backdropFilter:'blur(4px)'},
  modal:{width:'100%',background:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column'},
  handle:{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'10px auto 0'},
  modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #f1f5f9'},
  modalTitle:{fontSize:17,fontWeight:700,color:'#1e293b'},
  closeBtn:{background:'#f1f5f9',border:'none',borderRadius:10,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  modalBody:{overflowY:'auto',padding:'16px 20px 40px'},
  lbl:{fontSize:12,color:'#64748b',fontWeight:500,display:'block',marginBottom:5},
  textarea:{width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,resize:'none',boxSizing:'border-box',outline:'none',background:'#f8fafc'},
  previewBox:{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',borderRadius:12,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,border:'1px solid #fde68a'},
  previewLbl:{fontSize:12,color:'#92400e',fontWeight:600},
  previewVal:{fontSize:22,fontWeight:900,color:'#d97706'},
  saveBtn:{width:'100%',padding:14,background:'linear-gradient(135deg,#78350f,#d97706)',color:'#fff',border:'none',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8},
  spinner:{width:20,height:20,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite'},
};

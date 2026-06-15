import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Package, AlertCircle } from 'lucide-react';
import { listenTo, addMaterial, updateMaterial, deleteMaterial, uploadImage } from '../utils/firestore';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

const empty = { name:'', category:'cement', quantity:'', unit:'bags', perUnit:'', totalCost:'', date:new Date().toISOString().split('T')[0], imageUrl:'' };
const catColors = { cement:'#64748b', sand:'#d97706', brick:'#dc2626', steel:'#6366f1', paint:'#ec4899', wood:'#92400e', electrical:'#eab308', plumbing:'#0891b2', other:'#6b7280' };
const catEmoji  = { cement:'🧱', sand:'⛱️', brick:'🏗️', steel:'⚙️', paint:'🎨', wood:'🪵', electrical:'⚡', plumbing:'🔧', other:'📦' };

export default function Materials() {
  const { t } = useLang();
  const { userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => listenTo('materials', setItems), []);

  const open = (item=null) => {
    setForm(item ? {...item} : empty);
    setEditId(item ? item.id : null);
    setImgPrev(item?.imageUrl || '');
    setImgFile(null); setError(''); setUploadPct(0);
    setModal(true);
  };

  const setF = (k, v) => {
    const u = {...form, [k]:v};
    if (k==='quantity'||k==='perUnit') u.totalCost = (parseFloat(u.quantity)||0)*(parseFloat(u.perUnit)||0);
    setForm(u);
  };

  const save = async () => {
    if (!form.name || !form.quantity) { setError('Please fill name and quantity.'); return; }
    setSaving(true); setError(''); setUploadPct(0);
    try {
      let imageUrl = form.imageUrl || '';
      if (imgFile) {
        setUploadPct(1); // show bar immediately
        imageUrl = await uploadImage(imgFile, 'materials', pct => setUploadPct(pct));
      }
      const data = { ...form, imageUrl, totalCost: Number(form.totalCost) };
      if (editId) await updateMaterial(editId, data, userProfile);
      else await addMaterial(data, userProfile);
      setModal(false);
    } catch (e) {
      setError(e.message || 'Save failed. Try again.');
    }
    setSaving(false); setUploadPct(0);
  };

  const remove = async item => { if (!window.confirm(t.confirmDelete)) return; await deleteMaterial(item.id, item.name, userProfile); };

  const catKeys = Object.keys(t.categories);
  const filtered = items.filter(i => (filterCat==='all'||i.category===filterCat) && i.name?.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((s,i) => s+(Number(i.totalCost)||0), 0);

  return (
    <div style={{paddingBottom:90}}>
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <h2 style={S.title}>{t.materials}</h2>
            <p style={S.sub}>{filtered.length} {t.materials.toLowerCase()}</p>
          </div>
          <button style={S.addBtn} onClick={()=>open()} className="btn-press animate-popIn"><Plus size={22} color="#fff" strokeWidth={2.5}/></button>
        </div>
        <div style={S.totalBanner} className="animate-fadeInUp stagger-2">
          <span style={S.totalLbl}>{t.totalCost}</span>
          <span style={S.totalVal}>₹{Number(total).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style={S.searchWrap}>
        <div style={S.searchBox}>
          <Search size={16} color="#94a3b8"/>
          <input style={S.searchInput} placeholder={`${t.filter}...`} value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button style={S.clearBtn} onClick={()=>setSearch('')}><X size={14} color="#94a3b8"/></button>}
        </div>
      </div>

      <div style={S.catScroll}>
        <button style={{...S.chip,...(filterCat==='all'?S.chipOn:{})}} onClick={()=>setFilterCat('all')}>{t.all}</button>
        {catKeys.map(k=>(
          <button key={k} style={{...S.chip,...(filterCat===k?{...S.chipOn,background:catColors[k],borderColor:catColors[k]}:{})}} onClick={()=>setFilterCat(k)}>
            {catEmoji[k]} {t.categories[k]}
          </button>
        ))}
      </div>

      <div style={{padding:'0 12px'}}>
        {filtered.length===0 && <div style={S.emptyState}><Package size={48} color="#e2e8f0"/><p style={S.emptyText}>{t.noData}</p></div>}
        {filtered.map((item,i)=>(
          <div key={item.id} style={S.card} className={`animate-fadeInUp stagger-${Math.min(i+1,5)} btn-press`}>
            <div style={S.cardLeft}>
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} style={S.thumb}/>
                : <div style={{...S.thumbPlaceholder,background:catColors[item.category]+'22'}}><span style={{fontSize:24}}>{catEmoji[item.category]||'📦'}</span></div>
              }
              <div style={{flex:1,minWidth:0}}>
                <p style={S.itemName}>{item.name}</p>
                <span style={{...S.chip2,background:catColors[item.category]+'18',color:catColors[item.category]}}>{catEmoji[item.category]} {t.categories[item.category]||item.category}</span>
                <p style={S.itemMeta}>{item.quantity} {item.unit} · {item.date}</p>
                <p style={S.itemMeta}>by {item.createdBy}</p>
              </div>
            </div>
            <div style={S.cardRight}>
              <p style={S.itemCost}>₹{Number(item.totalCost).toLocaleString('en-IN')}</p>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <button style={S.iconBtn} onClick={()=>open(item)} className="btn-press"><Edit2 size={14} color="#64748b"/></button>
                <button style={{...S.iconBtn,background:'#fef2f2'}} onClick={()=>remove(item)} className="btn-press"><Trash2 size={14} color="#ef4444"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={S.overlay} onClick={()=>!saving&&setModal(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()} className="animate-slideUp">
            <div style={S.handle}/>
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>{editId?t.editMaterial:t.addMaterial}</span>
              <button style={S.closeBtn} onClick={()=>!saving&&setModal(false)} className="btn-press"><X size={20}/></button>
            </div>
            <div style={S.modalBody}>

              {/* Image upload area */}
              <div style={{...S.imgUpload, borderColor: imgPrev?'#16a34a':'#e2e8f0'}} onClick={()=>!saving&&document.getElementById('mat-img').click()}>
                {imgPrev
                  ? <img src={imgPrev} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}}/>
                  : <div style={{textAlign:'center'}}>
                      <span style={{fontSize:36}}>📷</span>
                      <p style={{fontSize:12,color:'#94a3b8',margin:'6px 0 0',fontWeight:500}}>{t.imageOptional}</p>
                      <p style={{fontSize:11,color:'#cbd5e1',margin:'3px 0 0'}}>Tap to add photo</p>
                    </div>
                }
                <input id="mat-img" type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                  const f=e.target.files[0];
                  if(f){setImgFile(f);setImgPrev(URL.createObjectURL(f));setError('');}
                }}/>
              </div>

              {/* Upload progress bar */}
              {saving && uploadPct > 0 && (
                <div style={S.progressWrap} className="animate-fadeIn">
                  <div style={S.progressBg}>
                    <div style={{...S.progressFill, width:`${uploadPct}%`}}/>
                  </div>
                  <p style={S.progressText}>{uploadPct < 100 ? `Uploading image... ${uploadPct}%` : 'Saving...'}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div style={S.errBox} className="animate-popIn">
                  <AlertCircle size={16} color="#dc2626"/>
                  <span>{error}</span>
                </div>
              )}

              <Field label={t.materialName} value={form.name} onChange={v=>setF('name',v)}/>
              <div style={{display:'flex',gap:10,marginBottom:12}}>
                <div style={{flex:1}}>
                  <label style={S.lbl}>{t.category}</label>
                  <select style={S.sel} value={form.category} onChange={e=>setF('category',e.target.value)}>
                    {catKeys.map(k=><option key={k} value={k}>{catEmoji[k]} {t.categories[k]}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.lbl}>{t.unit}</label>
                  <select style={S.sel} value={form.unit} onChange={e=>setF('unit',e.target.value)}>
                    {t.units.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',gap:10,marginBottom:12}}>
                <Field label={t.quantity} value={form.quantity} onChange={v=>setF('quantity',v)} type="number" flex/>
                <Field label={t.perUnit} value={form.perUnit} onChange={v=>setF('perUnit',v)} type="number" flex/>
              </div>
              <div style={S.totalBox}>
                <span style={S.totalBoxLbl}>{t.totalCost}</span>
                <span style={S.totalBoxVal}>₹{Number(form.totalCost||0).toLocaleString('en-IN')}</span>
              </div>
              <Field label={t.date} value={form.date} onChange={v=>setF('date',v)} type="date"/>

              <button style={{...S.saveBtn, opacity:saving?0.8:1}} onClick={save} disabled={saving} className="btn-press">
                {saving
                  ? <><div style={S.spinner}/> {uploadPct > 0 && uploadPct < 100 ? `Uploading ${uploadPct}%...` : 'Saving...'}</>
                  : `✅ ${t.save}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({label,value,onChange,type='text',flex}) {
  return (
    <div style={{marginBottom:12,flex:flex?1:undefined}}>
      <label style={{fontSize:12,color:'#64748b',fontWeight:500,display:'block',marginBottom:5}}>{label}</label>
      <input style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',background:'#f8fafc'}}
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
    </div>
  );
}

const S = {
  header:{background:'linear-gradient(160deg,#065f46,#059669)',padding:'20px 16px 0',position:'relative',overflow:'hidden'},
  headerRow:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,position:'relative'},
  title:{fontSize:22,fontWeight:800,color:'#fff',margin:0},
  sub:{fontSize:12,color:'rgba(255,255,255,0.65)',margin:'3px 0 0'},
  addBtn:{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  totalBanner:{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',borderRadius:'14px 14px 0 0',padding:'12px 16px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid rgba(255,255,255,0.15)',borderBottom:'none'},
  totalLbl:{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:500},
  totalVal:{fontSize:22,fontWeight:800,color:'#fff'},
  searchWrap:{padding:'12px 12px 0'},
  searchBox:{display:'flex',alignItems:'center',gap:10,background:'#fff',borderRadius:14,padding:'10px 14px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  searchInput:{flex:1,border:'none',outline:'none',fontSize:14,background:'transparent'},
  clearBtn:{background:'none',border:'none',cursor:'pointer',padding:2,display:'flex'},
  catScroll:{display:'flex',gap:8,overflowX:'auto',padding:'10px 12px',scrollbarWidth:'none'},
  chip:{flexShrink:0,padding:'6px 14px',borderRadius:20,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:12,cursor:'pointer',color:'#64748b',fontWeight:500,transition:'all 0.2s'},
  chipOn:{background:'#1a5276',color:'#fff',borderColor:'#1a5276'},
  chip2:{display:'inline-block',fontSize:10,padding:'3px 8px',borderRadius:8,fontWeight:600,marginTop:4},
  card:{background:'#fff',borderRadius:16,padding:'12px',marginBottom:10,display:'flex',justifyContent:'space-between',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  cardLeft:{display:'flex',gap:12,flex:1,minWidth:0},
  cardRight:{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0},
  thumb:{width:58,height:58,borderRadius:12,objectFit:'cover',flexShrink:0},
  thumbPlaceholder:{width:58,height:58,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  itemName:{fontSize:14,fontWeight:700,color:'#1e293b',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  itemMeta:{fontSize:11,color:'#94a3b8',margin:'3px 0 0'},
  itemCost:{fontSize:16,fontWeight:800,color:'#16a34a'},
  iconBtn:{width:32,height:32,background:'#f1f5f9',border:'none',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  emptyState:{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 0',gap:8},
  emptyText:{color:'#94a3b8',fontSize:14,margin:0},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end',backdropFilter:'blur(4px)'},
  modal:{width:'100%',background:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column'},
  handle:{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'10px auto 0'},
  modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #f1f5f9'},
  modalTitle:{fontSize:17,fontWeight:700,color:'#1e293b'},
  closeBtn:{background:'#f1f5f9',border:'none',borderRadius:10,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  modalBody:{overflowY:'auto',padding:'16px 20px 40px'},
  imgUpload:{width:'100%',height:110,background:'#f8fafc',border:'2px dashed',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginBottom:14,overflow:'hidden',transition:'border-color 0.3s'},
  progressWrap:{marginBottom:12},
  progressBg:{height:6,background:'#e2e8f0',borderRadius:3,overflow:'hidden'},
  progressFill:{height:'100%',background:'linear-gradient(90deg,#16a34a,#22c55e)',borderRadius:3,transition:'width 0.3s ease'},
  progressText:{fontSize:11,color:'#16a34a',fontWeight:600,margin:'5px 0 0',textAlign:'center'},
  errBox:{display:'flex',alignItems:'center',gap:8,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 12px',fontSize:12,color:'#dc2626',marginBottom:12},
  lbl:{fontSize:12,color:'#64748b',fontWeight:500,display:'block',marginBottom:5},
  sel:{width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc'},
  totalBox:{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',borderRadius:12,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14},
  totalBoxLbl:{fontSize:13,color:'#166534',fontWeight:600},
  totalBoxVal:{fontSize:22,fontWeight:800,color:'#16a34a'},
  saveBtn:{width:'100%',padding:14,background:'linear-gradient(135deg,#065f46,#16a34a)',color:'#fff',border:'none',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10},
  spinner:{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite',flexShrink:0},
};

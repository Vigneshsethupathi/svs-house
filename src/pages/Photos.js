import React, { useEffect, useState } from 'react';
import { Plus, X, Camera, Calendar, AlertCircle } from 'lucide-react';
import { listenTo, addPhoto, uploadImage } from '../utils/firestore';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

export default function Photos() {
  const { t } = useLang();
  const { userProfile } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [modal, setModal] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => listenTo('photos', setPhotos), []);

  const resetModal = () => {
    setImgFile(null); setImgPrev(''); setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(''); setUploadPct(0);
  };

  const upload = async () => {
    if (!imgFile) { setError('Please select a photo first.'); return; }
    setSaving(true); setError(''); setUploadPct(1);
    try {
      const imageUrl = await uploadImage(imgFile, 'daily-photos', pct => setUploadPct(pct));
      await addPhoto({ imageUrl, note, date }, userProfile);
      setModal(false); resetModal();
    } catch (e) {
      setError(e.message || 'Upload failed. Please try again.');
    }
    setSaving(false); setUploadPct(0);
  };

  const groups = {};
  photos.forEach(p => { const k=p.date||'Unknown'; if(!groups[k]) groups[k]=[]; groups[k].push(p); });
  const fmtDate = d => { const dt=new Date(d); return isNaN(dt)?d:dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'}); };

  return (
    <div style={{paddingBottom:90}}>
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <h2 style={S.title}>{t.photos}</h2>
            <p style={S.sub}>{photos.length} photos · {Object.keys(groups).length} days</p>
          </div>
          <button style={S.addBtn} onClick={()=>{resetModal();setModal(true);}} className="btn-press animate-popIn">
            <Plus size={22} color="#fff" strokeWidth={2.5}/>
          </button>
        </div>
        <div style={S.statsRow} className="animate-fadeInUp stagger-2">
          {[{v:photos.length,l:'Total'},{v:Object.keys(groups).length,l:'Days'},{v:photos.filter(p=>p.date===new Date().toISOString().split('T')[0]).length,l:'Today'}].map((s,i)=>(
            <React.Fragment key={i}>
              {i>0&&<div style={S.statDiv}/>}
              <div style={S.statItem}><span style={S.statVal}>{s.v}</span><span style={S.statLbl}>{s.l}</span></div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 12px 0'}}>
        {Object.keys(groups).length===0 && (
          <div style={S.emptyState}>
            <Camera size={56} color="#e2e8f0" strokeWidth={1.5}/>
            <p style={S.emptyTitle}>{t.noData}</p>
            <p style={S.emptyText}>Tap + to upload today's site photo</p>
          </div>
        )}
        {Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,list],gi)=>(
          <div key={d} className={`animate-fadeInUp stagger-${Math.min(gi+1,4)}`}>
            <div style={S.dateHead}>
              <Calendar size={13} color="#64748b"/>
              <span style={S.dateLbl}>{fmtDate(d)}</span>
              <span style={S.dateCount}>{list.length}</span>
            </div>
            <div style={S.grid}>
              {list.map(photo=>(
                <div key={photo.id} style={S.photoCard} onClick={()=>setLightbox(photo)} className="btn-press">
                  <img src={photo.imageUrl} alt={photo.note||d} style={S.photoImg}/>
                  {photo.note&&<div style={S.photoOverlay}><p style={S.photoNote}>{photo.note}</p></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload modal */}
      {modal && (
        <div style={S.overlay} onClick={()=>!saving&&setModal(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()} className="animate-slideUp">
            <div style={S.handle}/>
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>{t.uploadPhoto}</span>
              <button style={S.closeBtn} onClick={()=>!saving&&setModal(false)} className="btn-press"><X size={20}/></button>
            </div>
            <div style={S.modalBody}>

              {/* Upload area */}
              <div style={{...S.uploadArea, borderColor:imgPrev?'#7c3aed':'#e2e8f0', cursor:saving?'not-allowed':'pointer'}}
                onClick={()=>!saving&&document.getElementById('ph-inp').click()}>
                {imgPrev
                  ? <img src={imgPrev} alt="preview" style={{width:'100%',height:'100%',objectFit:'contain',borderRadius:12}}/>
                  : <div style={{textAlign:'center',padding:'0 20px'}}>
                      <Camera size={44} color="#c4b5fd" strokeWidth={1.5}/>
                      <p style={{color:'#7c3aed',fontSize:14,fontWeight:600,margin:'10px 0 4px'}}>Tap to add photo</p>
                      <p style={{color:'#94a3b8',fontSize:12,margin:0}}>Opens camera or gallery</p>
                    </div>
                }
                <input id="ph-inp" type="file" accept="image/*" capture="environment" style={{display:'none'}}
                  onChange={e=>{const f=e.target.files[0];if(f){setImgFile(f);setImgPrev(URL.createObjectURL(f));setError('');}}}/>
              </div>

              {/* Progress bar */}
              {saving && uploadPct > 0 && (
                <div style={S.progressWrap} className="animate-fadeIn">
                  <div style={S.progressBg}>
                    <div style={{...S.progressFill, width:`${uploadPct}%`}}/>
                  </div>
                  <p style={S.progressText}>{uploadPct<100?`Uploading photo... ${uploadPct}%`:'Saving...'}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={S.errBox} className="animate-popIn">
                  <AlertCircle size={16} color="#dc2626"/>
                  <span style={{flex:1}}>{error}</span>
                </div>
              )}

              <div style={{marginBottom:14}}>
                <label style={S.lbl}>{t.date}</label>
                <input style={S.input} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={S.lbl}>{t.addNote}</label>
                <textarea style={S.textarea} value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Foundation work completed..." rows={2}/>
              </div>

              <button style={{...S.saveBtn, opacity:saving||!imgFile?0.6:1}} onClick={upload} disabled={saving||!imgFile} className="btn-press">
                {saving
                  ? <><div style={S.spinner}/>{uploadPct>0&&uploadPct<100?`Uploading ${uploadPct}%...`:'Saving...'}</>
                  : `📷 ${t.uploadPhoto}`
                }
              </button>

              {!imgFile && !saving && <p style={{textAlign:'center',fontSize:11,color:'#94a3b8',marginTop:8}}>Select a photo to enable upload</p>}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={S.lightbox} onClick={()=>setLightbox(null)} className="animate-fadeIn">
          <button style={S.lbClose} className="btn-press"><X size={22} color="#fff"/></button>
          <img src={lightbox.imageUrl} alt={lightbox.note} style={S.lbImg}/>
          <div style={S.lbInfo}>
            {lightbox.note&&<p style={S.lbNote}>{lightbox.note}</p>}
            <p style={S.lbMeta}>{lightbox.date} · {lightbox.createdBy}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  header:{background:'linear-gradient(160deg,#4c1d95,#7c3aed)',padding:'20px 16px 0',overflow:'hidden'},
  headerRow:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},
  title:{fontSize:22,fontWeight:800,color:'#fff',margin:0},
  sub:{fontSize:12,color:'rgba(255,255,255,0.65)',margin:'3px 0 0'},
  addBtn:{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  statsRow:{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',borderRadius:'14px 14px 0 0',padding:'14px 16px 18px',display:'flex',justifyContent:'space-around',border:'1px solid rgba(255,255,255,0.15)',borderBottom:'none'},
  statItem:{display:'flex',flexDirection:'column',alignItems:'center',gap:3},
  statVal:{fontSize:22,fontWeight:900,color:'#fff'},
  statLbl:{fontSize:10,color:'rgba(255,255,255,0.65)',fontWeight:500},
  statDiv:{width:1,background:'rgba(255,255,255,0.2)'},
  dateHead:{display:'flex',alignItems:'center',gap:6,padding:'8px 4px',marginBottom:8},
  dateLbl:{fontSize:12,fontWeight:600,color:'#475569',flex:1},
  dateCount:{background:'#7c3aed',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:8},
  grid:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:14},
  photoCard:{aspectRatio:'1',borderRadius:14,overflow:'hidden',position:'relative',cursor:'pointer',background:'#f1f5f9'},
  photoImg:{width:'100%',height:'100%',objectFit:'cover'},
  photoOverlay:{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.65))',padding:'16px 6px 6px'},
  photoNote:{color:'#fff',fontSize:9,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  emptyState:{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 0',gap:8},
  emptyTitle:{color:'#64748b',fontSize:16,fontWeight:600,margin:0},
  emptyText:{color:'#94a3b8',fontSize:13,margin:0},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end',backdropFilter:'blur(4px)'},
  modal:{width:'100%',background:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column'},
  handle:{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'10px auto 0'},
  modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #f1f5f9'},
  modalTitle:{fontSize:17,fontWeight:700,color:'#1e293b'},
  closeBtn:{background:'#f1f5f9',border:'none',borderRadius:10,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  modalBody:{overflowY:'auto',padding:'16px 20px 40px'},
  uploadArea:{width:'100%',height:200,background:'#faf5ff',border:'2px dashed',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginBottom:14,overflow:'hidden',transition:'border-color 0.3s'},
  progressWrap:{marginBottom:12},
  progressBg:{height:6,background:'#e2e8f0',borderRadius:3,overflow:'hidden'},
  progressFill:{height:'100%',background:'linear-gradient(90deg,#7c3aed,#a855f7)',borderRadius:3,transition:'width 0.3s ease'},
  progressText:{fontSize:11,color:'#7c3aed',fontWeight:600,margin:'5px 0 0',textAlign:'center'},
  errBox:{display:'flex',alignItems:'center',gap:8,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 12px',fontSize:12,color:'#dc2626',marginBottom:12},
  lbl:{fontSize:12,color:'#64748b',fontWeight:500,display:'block',marginBottom:5},
  input:{width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',background:'#f8fafc'},
  textarea:{width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,resize:'none',boxSizing:'border-box',outline:'none',background:'#f8fafc'},
  saveBtn:{width:'100%',padding:14,background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'#fff',border:'none',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10},
  spinner:{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite',flexShrink:0},
  lightbox:{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16},
  lbClose:{position:'absolute',top:20,right:20,background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'50%',width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
  lbImg:{maxWidth:'100%',maxHeight:'72vh',borderRadius:16,objectFit:'contain'},
  lbInfo:{textAlign:'center',marginTop:14},
  lbNote:{color:'#fff',fontSize:14,fontWeight:500,margin:'0 0 5px'},
  lbMeta:{color:'rgba(255,255,255,0.5)',fontSize:12,margin:0},
};

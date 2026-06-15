import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const { lang, toggleLang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try { await loginWithGoogle(); }
    catch (e) { setError(lang === 'ta' ? 'உள்நுழைவு தோல்வி. மீண்டும் முயல்க.' : 'Login failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={S.bg}>
      {/* Animated background blobs */}
      <div style={{...S.blob, top:'-60px', left:'-60px', background:'rgba(99,179,237,0.3)', animationDelay:'0s'}} />
      <div style={{...S.blob, top:'30%', right:'-80px', background:'rgba(154,117,234,0.25)', animationDelay:'1s'}} />
      <div style={{...S.blob, bottom:'10%', left:'10%', background:'rgba(72,187,120,0.2)', animationDelay:'2s'}} />

      <button onClick={toggleLang} style={S.langBtn} className="btn-press">
        {lang === 'en' ? '🌐 தமிழ்' : '🌐 English'}
      </button>

      <div style={S.card} className="animate-fadeInUp">
        {/* Logo area */}
        <div style={S.logoArea} className="animate-float">
          <div style={S.logoCircle}>
            <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
              <path d="M26 6L46 22H40V46H30V34H22V46H12V22H6L26 6Z" fill="white"/>
            </svg>
          </div>
        </div>

        <h1 style={S.appName} className="animate-fadeIn stagger-1">SVS</h1>
        <p style={S.appSub} className="animate-fadeIn stagger-2">
          {lang === 'ta' ? 'வீடு மேலாண்மை' : 'House Management'}
        </p>

        <div style={S.divider} className="animate-fadeIn stagger-3" />

        <p style={S.welcomeTitle} className="animate-fadeIn stagger-3">
          {lang === 'ta' ? 'வரவேற்கிறோம் 👋' : 'Welcome back 👋'}
        </p>
        <p style={S.welcomeSub} className="animate-fadeIn stagger-4">
          {lang === 'ta' ? 'Google மூலம் தொடரவும்' : 'Sign in to continue'}
        </p>

        <button style={{...S.googleBtn, opacity: loading ? 0.75 : 1}} onClick={handleGoogle} disabled={loading} className="btn-press animate-fadeIn stagger-5">
          {loading
            ? <div style={S.spinner} />
            : <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
          }
          <span style={S.googleBtnText}>
            {loading ? (lang==='ta'?'உள்நுழைகிறது...':'Signing in...') : (lang==='ta'?'Google மூலம் உள்நுழை':'Continue with Google')}
          </span>
        </button>

        {error && <div style={S.errBox} className="animate-popIn">⚠️ {error}</div>}

        <p style={S.secureNote} className="animate-fadeIn stagger-5">
          🔒 {lang==='ta'?'பாதுகாப்பான உள்நுழைவு · SMS கட்டணம் இல்லை':'Secure login · No SMS charges'}
        </p>
      </div>

      <p style={S.brand}>SVS House Management © 2025</p>
    </div>
  );
}

const S = {
  bg:{minHeight:'100vh',background:'linear-gradient(160deg,#0f2444 0%,#1a5276 45%,#0e6655 100%)',backgroundSize:'400% 400%',animation:'gradientShift 8s ease infinite',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'},
  blob:{position:'absolute',width:220,height:220,borderRadius:'50%',animation:'float 6s ease-in-out infinite',filter:'blur(40px)'},
  langBtn:{position:'absolute',top:18,right:18,background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',borderRadius:24,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:500,backdropFilter:'blur(8px)'},
  card:{background:'rgba(255,255,255,0.97)',borderRadius:28,padding:'36px 28px 28px',width:'100%',maxWidth:360,boxShadow:'0 32px 80px rgba(0,0,0,0.35)',position:'relative'},
  logoArea:{textAlign:'center',marginBottom:12},
  logoCircle:{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#1a3a5c,#2980b9)',display:'inline-flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(26,82,118,0.4)'},
  appName:{fontSize:32,fontWeight:900,color:'#1a3a5c',textAlign:'center',margin:'8px 0 4px',letterSpacing:4},
  appSub:{fontSize:13,color:'#94a3b8',textAlign:'center',margin:'0 0 20px',fontWeight:500},
  divider:{height:1,background:'linear-gradient(90deg,transparent,#e2e8f0,transparent)',margin:'0 0 20px'},
  welcomeTitle:{fontSize:20,fontWeight:700,color:'#1e293b',textAlign:'center',margin:'0 0 6px'},
  welcomeSub:{fontSize:13,color:'#94a3b8',textAlign:'center',margin:'0 0 24px'},
  googleBtn:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'14px 16px',background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:14,cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',transition:'all 0.2s'},
  googleBtnText:{fontSize:15,fontWeight:600,color:'#1e293b'},
  spinner:{width:22,height:22,borderRadius:'50%',border:'2.5px solid #e2e8f0',borderTopColor:'#1a5276',animation:'spin 0.7s linear infinite'},
  errBox:{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#dc2626',textAlign:'center',marginTop:12},
  secureNote:{fontSize:11,color:'#94a3b8',textAlign:'center',marginTop:16},
  brand:{color:'rgba(255,255,255,0.25)',fontSize:11,marginTop:24}
};

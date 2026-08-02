import { useState } from "react";
import { motion } from "motion/react";
import { useI18n } from "./i18n";
import { B, I } from "./data";

export function OnboardingOverlay({ user, profile, onUpdate }: any) {
  const { lang } = useI18n();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      await onUpdate({ nickname: nickname.trim() });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(255,255,255,0.9)", backdropFilter: "none", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
       <motion.div initial={{opacity:0, scale:0.92, y:20}} animate={{opacity:1, scale:1, y:0}} style={{maxWidth:440, width:"100%", background:"white", padding:"48px 40px", borderRadius:40, boxShadow:"0 30px 60px rgba(44,32,22,0.15)", textAlign:"center", border:"1px solid rgba(44,32,22,0.05)"}}>
          <div style={{fontSize:48, marginBottom:24}}>✨</div>
          <h2 style={{fontSize:28, fontWeight:900, marginBottom:12, color:"#2C2016", letterSpacing:"-0.5px"}}>{lang === "id" ? "Selamat Datang! 👋" : "Welcome! 👋"}</h2>
          <p style={{fontSize:15, color:"rgba(44,32,22,0.6)", marginBottom:32, lineHeight:1.6}}>{lang === "id" ? "Senang sekali Anda bergabung. Agar pengalaman mengelola konten jadi lebih akrab, boleh kami tahu siapa nama panggilan Anda?" : "Glad to have you onboard. To make your content management experience more personal, what should we call you?"}</p>
          
          <div style={{position:"relative", marginBottom:24}}>
            <input 
              value={nickname} 
              onChange={e=>setNickname(e.target.value)} 
              placeholder={lang === "id" ? "Misal: Nalen, Putra, dll." : "E.g., John, Jane, etc."} 
              autoFocus
              onKeyDown={e=>e.key==="Enter"&&handleSave()}
              style={{
                width:"100%", borderRadius:20, border:"2px solid rgba(44,32,22,0.08)", padding:"18px 24px", fontSize:16, fontWeight:600, outline:"none", transition:"all 0.3s ease", textAlign:"center", background:"#FAFAF8"
              }}
              className="focus:border-[var(--theme-primary)] focus:bg-white"
            />
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={loading || !nickname.trim()}
            style={{...B(true), width:"100%", height:60, borderRadius:30, fontSize:15, fontWeight:800, letterSpacing:0.5}}
            className="hover-scale shadow-lg"
          >
            {loading ? (lang === "id" ? "Menyiapkan Workspace..." : "Preparing Workspace...") : (lang === "id" ? "Mulai Gunakan Dashboard" : "Start Using Dashboard")}
          </button>
          
          <p style={{fontSize:11, color:"rgba(44,32,22,0.4)", marginTop:24, fontWeight:600}}>{lang === "id" ? "Anda dapat mengubah nama ini kapan saja di pengaturan profil." : "You can change this anytime in profile settings."}</p>
       </motion.div>
    </div>
  );
}


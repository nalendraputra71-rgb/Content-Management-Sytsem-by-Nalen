import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, setDoc } from "./firebase";
import { db } from "./firebase";
import { CARD, B, I } from "./data";
import { motion, AnimatePresence } from "motion/react";

export function BillingView({ userProfile, onUpdate }: { userProfile: any, activeWorkspace: any, onUpdate: (data: any) => void }) {
  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      const snap = await getDocs(collection(db, "plans"));
      if (snap.empty) {
        const defaultPlans = [
          {
            id: "promo1",
            name: "1 Bulan (Promo Anak Baru)",
            price: 29000,
            originalPrice: 79000,
            period: "1 Bulan",
            desc: "Hanya berlaku untuk pembayaran pertama kali.",
            features: ["Akses Semua Fitur", "Tanpa Watermark", "Analytics Lengkap", "Dukungan Prioritas"],
            color: "#FF6B00",
            promoOnly: true,
            addMonths: 1
          },
          {
            id: "normal1",
            name: "1 Bulan (Pro)",
            price: 79000,
            originalPrice: null,
            period: "1 Bulan",
            desc: "Harga standar untuk pembaruan tiap bulan.",
            features: ["Akses Semua Fitur", "Analytics Lengkap", "Pembaruan Manual"],
            color: "#2C2016",
            promoOnly: false,
            addMonths: 1
          },
          {
            id: "pro3",
            name: "3 Bulan (Pro)",
            price: 199000,
            originalPrice: 237000,
            period: "3 Bulan",
            desc: "Lebih hemat untuk merencakan konten 1 kuartal.",
            features: ["Semua Fitur Pro", "Diskon Harga Coret"],
            color: "#2C2016",
            promoOnly: false,
            addMonths: 3
          },
          {
            id: "pro6",
            name: "6 Bulan (Pro)",
            price: 379000,
            originalPrice: 474000,
            period: "6 Bulan",
            desc: "Fokus bikin karya setengah tahun penuh.",
            features: ["Semua Fitur Pro", "Diskon Harga Coret"],
            color: "#2C2016",
            promoOnly: false,
            addMonths: 6
          },
          {
            id: "pro12",
            name: "12 Bulan (Best Value)",
            price: 948000,
            originalPrice: null,
            period: "15 Bulan",
            desc: "Bayar 12 Bulan, dapat akses 15 Bulan!",
            features: ["Semua Fitur Pro", "+3 Bulan GRATIS", "Akses Fitur Eksklusif"],
            color: "#9C2B4E",
            promoOnly: false,
            popular: true,
            addMonths: 15
          }
        ];
        
        for (const p of defaultPlans) {
          await setDoc(doc(db, "plans", p.id), p);
        }
        setPlans(defaultPlans);
      } else {
        const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        // Sort based on price or ID if needed, we'll just sort by addMonths
        loaded.sort((a:any, b:any) => (a.addMonths||0) - (b.addMonths||0));
        setPlans(loaded);
      }
    };
    loadPlans();
  }, []);

  const handleSelectPlan = (plan: any) => {
    setModal(plan);
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      setTimeout(async () => {
        let addMonths = modal.addMonths || 1;

        const currentActive = profileActiveUntil > new Date() ? profileActiveUntil : new Date();
        currentActive.setMonth(currentActive.getMonth() + addMonths);

        const uRef = doc(db, "users", userProfile.uid);
        await updateDoc(uRef, {
          activeUntil: currentActive.toISOString(),
          plan: "pro",
          hasUsedPromo: true
        });

        await setDoc(doc(collection(db, "transactions")), {
          userId: userProfile.uid,
          userEmail: userProfile.email,
          amount: modal.price,
          planName: modal.name,
          paymentMethod: "Xendit QRIS",
          timestamp: new Date().toISOString()
        });

        onUpdate({
          ...userProfile,
          activeUntil: currentActive.toISOString(),
          plan: "pro",
          hasUsedPromo: true
        });
        
        setLoading(false);
        setModal(null);
        alert("Simulasi Xendit Berhasil! Akun Anda telah diperpanjang ke versi Pro.");
      }, 1500);
    } catch(e) {
      alert("Error memproses pembayaran.");
      setLoading(false);
    }
  };

  const profileActiveUntil = new Date(userProfile.activeUntil || 0);
  const isRestricted = new Date() > profileActiveUntil;
  const sisaHari = Math.ceil((profileActiveUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));


  const displayPlans = plans.map(p => ({
    ...p,
    hide: p.promoOnly && userProfile.hasUsedPromo ? true : (p.id === "normal1" && !userProfile.hasUsedPromo ? true : false)
  }));

  return (
    <div style={{minHeight:"100vh", padding:40, background:"#FAFAFA", fontFamily:"'Inter', sans-serif"}}>
      <div style={{maxWidth:1100, margin:"0 auto"}}>
        <button 
          onClick={() => window.location.hash = "/profile"} 
          style={{background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight:600, color:"rgba(44,32,22,0.6)", padding:0, marginBottom:32}}
          className="hover-scale"
        >
          <span style={{fontSize:20}}>←</span> Kembali ke Pengaturan Profil
        </button>

        <div style={{textAlign:"center", marginBottom:40}}>
           <h1 style={{fontSize:36, fontWeight:800, color:"#2C2016", letterSpacing:"-1px", marginBottom:12}}>Langganan & Penagihan</h1>
           <p style={{fontSize:16, color:"rgba(44,32,22,0.6)", maxWidth:600, margin:"0 auto", lineHeight:1.6}}>
             Pilih paket yang sesuai untuk merancang konten dengan maksimal. <br/>Pembayaran aman via sistem Manual Renewal Xendit.
           </p>
        </div>

        <div style={{...CARD(), display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:48, padding:"24px 32px"}}>
           <div>
             <div style={{fontSize:14, fontWeight:600, color:"rgba(44,32,22,0.5)", marginBottom:4, textTransform:"uppercase", letterSpacing:1}}>Status Akun Anda</div>
             <div style={{fontSize:24, fontWeight:800, color: isRestricted ? "#9C2B4E" : "#538135"}}>
               {isRestricted ? "Mode Terbatas (Restricted)" : userProfile.plan === "trial" ? "Masa Uji Coba (Free Trial)" : "Akun Pro Aktif"}
             </div>
             <div style={{fontSize:15, color:"rgba(44,32,22,0.7)", marginTop:6}}>
               {isRestricted 
                 ? "Masa aktif Anda telah berakhir. Perpanjang akses untuk menambah/edit konten." 
                 : userProfile.plan === "trial" 
                 ? `Akses penuh tersisa ${sisaHari} hari lagi.` 
                 : `Akses Pro aktif hingga ${profileActiveUntil.toLocaleDateString("id-ID", {dateStyle: "long"})}.`}
             </div>
           </div>
           {(!isRestricted && userProfile.plan === "trial" && sisaHari > 0) && (
             <div style={{background:"var(--theme-primary)22", color:"var(--theme-primary)", padding:"12px 24px", borderRadius:12, fontWeight:700, fontSize:14, textAlign:"center"}}>
               Sisa {sisaHari} Hari Trial
             </div>
           )}
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20}}>
          {displayPlans.filter(p => !p.hide).map(p => (
            <div key={p.id} style={{background:"white", border:`2px solid ${p.popular ? p.color : "rgba(44,32,22,0.05)"}`, borderRadius:20, padding:24, display:"flex", flexDirection:"column", position:"relative", boxShadow: p.popular ? "0 15px 35px rgba(156,43,78,0.12)" : "0 8px 24px rgba(0,0,0,0.02)"}}>
              {p.popular && <div style={{position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:p.color, color:"white", padding:"4px 12px", borderRadius:16, fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase"}}>Best Value</div>}
              <div style={{fontSize:16, fontWeight:700, color:p.color, marginBottom:4}}>{p.name}</div>
              <div style={{display:"flex", alignItems:"flex-end", gap:6, marginBottom:8}}>
                 <div style={{fontSize:24, fontWeight:800, color:"#2C2016", letterSpacing:"-0.5px"}}>
                   Rp {p.price.toLocaleString("id-ID")}
                 </div>
                 {p.originalPrice && <div style={{fontSize:13, fontWeight:600, color:"rgba(44,32,22,0.4)", textDecoration:"line-through", marginBottom:4}}>Rp {p.originalPrice.toLocaleString("id-ID")}</div>}
              </div>
              <div style={{fontSize:13, color:"rgba(44,32,22,0.6)", marginBottom:20, lineHeight:1.4, minHeight:36}}>{p.desc}</div>
              
              <div style={{flex:1, marginBottom:24}}>
                {p.features.map((f, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:8, marginBottom:10, fontSize:13, fontWeight:600, color:"#2C2016"}}>
                    <div style={{width:16, height:16, borderRadius:"50%", background: p.color+"1A", color:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10}}>✓</div>
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => handleSelectPlan(p)} style={{background: p.popular ? p.color : "#FAF7F2", color: p.popular ? "white" : "#2C2016", fontWeight:700, fontSize:14, padding:"12px", borderRadius:12, border:"none", cursor:"pointer", width:"100%", transition:"all 0.2s"}} className="hover-scale">
                Pilih Paket
              </button>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
             <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} style={{background:"white", borderRadius:24, padding:40, maxWidth:500, width:"100%", textAlign:"center", boxShadow:"0 20px 40px rgba(0,0,0,0.2)"}}>
               <div style={{width:64, height:64, background:"#F4F6FC", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 24px"}}>💳</div>
               <h3 style={{fontSize:24, fontWeight:800, color:"#2C2016", marginBottom:8}}>Konfirmasi Pembayaran</h3>
               <p style={{fontSize:15, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>Anda memilih paket <strong style={{color:"var(--theme-primary)"}}>{modal.name}</strong> seharga Rp {modal.price.toLocaleString("id-ID")}.</p>
               
               <div style={{background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.05)", borderRadius:16, padding:20, textAlign:"left", marginBottom:32}}>
                 <div style={{display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:14}}><span style={{color:"rgba(44,32,22,0.5)"}}>Durasi</span> <strong>{modal.period}</strong></div>
                 <div style={{display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:14}}><span style={{color:"rgba(44,32,22,0.5)"}}>Pajak (0%)</span> <strong>Rp 0</strong></div>
                 <div style={{height:1, background:"rgba(44,32,22,0.1)", margin:"12px 0"}}/>
                 <div style={{display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:800, color:"#2C2016"}}><span>Total Tagihan</span> <span>Rp {modal.price.toLocaleString("id-ID")}</span></div>
               </div>

               <div style={{display:"flex", gap:12}}>
                 <button onClick={()=>setModal(null)} style={{flex:1, background:"#FAF7F2", color:"#2C2016", fontWeight:600, padding:"16px", borderRadius:16, border:"none", cursor:"pointer"}}>Batal</button>
                 <button onClick={handleSimulatePayment} disabled={loading} style={{flex:1, background:"#2C2016", color:"white", fontWeight:600, padding:"16px", borderRadius:16, border:"none", cursor:loading?"wait":"pointer"}}>
                   {loading ? "Memproses..." : "Bayar"}
                 </button>
               </div>
               <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", marginTop:16, fontStyle:"italic", background:"#FAFAFA", padding:"8px", borderRadius:8}}>
                 *Catatan: Pembayaran ini hanya untuk satu kali transaksi. Jika waktu langganan telah habis, Anda harus mengulang pembayaran manual untuk memperpanjang pelayanan CMS Anda (TIDAK ADA AUTO DEBIT/TAGIHAN OTOMATIS).
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

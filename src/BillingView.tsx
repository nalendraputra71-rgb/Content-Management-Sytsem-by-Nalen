import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, setDoc } from "./firebase";
import { db } from "./firebase";
import { CARD, B, I } from "./data";
import { motion, AnimatePresence } from "motion/react";

export function BillingView({ userProfile, onUpdate }: { userProfile: any, activeWorkspace: any, onUpdate: (data: any) => void }) {
  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    const loadPlansAndPromos = async () => {
      const plansSnap = await getDocs(collection(db, "plans"));
      if (plansSnap.empty) {
        const defaultPlans = [
          { id: "starter", name: "Starter Pro", price: 49000, desc: "Cocok untuk kreator pemula yang ingin mencoba fitur Pro.", addMonths: 1, popular: false, features: ["Akses Semua Template", "Tanpa Watermark", "Email Support"] },
          { id: "pro", name: "Ultimate Pro", price: 99000, desc: "Pilihan terbaik untuk profesional dengan fitur terlengkap.", addMonths: 1, popular: true, features: ["Semua Fitur Starter", "Prioritas Render", "Voucher Diskon Bulanan", "Custom Domain"] },
          { id: "business", name: "Enterprise", price: 249000, desc: "Solusi skala besar untuk tim dan agensi konten.", addMonths: 3, popular: false, features: ["Semua Fitur Pro", "Akun Tim (3 User)", "Dedicated Support", "Analytics Eksklusif"] }
        ];
        setPlans(defaultPlans);
      } else {
        setPlans(plansSnap.docs.map(d => ({ ...d.data(), id: d.id })));
      }

      const promosSnap = await getDocs(collection(db, "promos"));
      setPromos(promosSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    };
    loadPlansAndPromos();
  }, []);

  const handleApplyVoucher = (code: string) => {
    const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    if (!promo) {
      setVoucherError("Kode voucher tidak valid atau sudah tidak aktif.");
      return;
    }

    // Check dates
    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) {
      setVoucherError("Voucher ini belum masa berlaku.");
      return;
    }
    if (promo.endDate && new Date(promo.endDate) < now) {
      setVoucherError("Voucher ini sudah kadaluarsa.");
      return;
    }

    // Check usage limit
    if (promo.usageLimit > 0 && (promo.usageCount || 0) >= promo.usageLimit) {
      setVoucherError("Voucher ini sudah mencapai batas pemakaian.");
      return;
    }

    // Check target type
    if (promo.targetType === "first_timer") {
      if (userProfile.hasUsedPromo) {
        setVoucherError("Voucher ini hanya berlaku untuk pengguna yang pertama kali melakukan perpanjangan.");
        return;
      }
    }

    setAppliedVoucher(promo);
    setVoucherCodeInput("");
    setVoucherError("");
    setShowVoucherList(false);
  };

  const calculateFinalPrice = (price: number) => {
    if (!appliedVoucher) return price;
    if (appliedVoucher.type === "percent") {
      return price - (price * (appliedVoucher.value / 100));
    } else {
      return Math.max(0, price - appliedVoucher.value);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setModal(plan);
    setVoucherError("");
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      setTimeout(async () => {
        let addMonths = modal.addMonths || 1;
        const finalPrice = calculateFinalPrice(modal.price);

        const currentActive = profileActiveUntil > new Date() ? profileActiveUntil : new Date();
        currentActive.setMonth(currentActive.getMonth() + addMonths);

        const uRef = doc(db, "users", userProfile.uid);
        // We attempt to update, but this SHOULD be blocked by Firestore Rules now!
        try {
          await updateDoc(uRef, {
            activeUntil: currentActive.toISOString(),
            plan: "pro",
            hasUsedPromo: true
          });

          // Track transaction
          await setDoc(doc(collection(db, "transactions")), {
            userId: userProfile.uid,
            userEmail: userProfile.email,
            amount: finalPrice,
            originalAmount: modal.price,
            voucherCode: appliedVoucher?.code || null,
            planName: modal.name,
            paymentMethod: "Xendit QRIS",
            timestamp: new Date().toISOString()
          });

          // Update promo usage count
          if (appliedVoucher) {
            const pRef = doc(db, "promos", appliedVoucher.id);
            await updateDoc(pRef, {
              usageCount: (appliedVoucher.usageCount || 0) + 1
            });
          }

          onUpdate({
            ...userProfile,
            activeUntil: currentActive.toISOString(),
            plan: "pro",
            hasUsedPromo: true
          });
          
          setLoading(false);
          setModal(null);
          setAppliedVoucher(null);
          alert(`Simulasi Xendit Berkasih! Pembayaran Rp ${finalPrice.toLocaleString()} dikonfirmasi.`);
        } catch (ruleError) {
          console.error(ruleError);
          setLoading(false);
          setModal(null);
          setAppliedVoucher(null);
          alert(`Success! Firebase Security Rules blocked this client-side transaction (Zero-Trust). In production, Xendit webhook at /api/webhooks/xendit handles this securely.`);
        }
      }, 1500);
    } catch(e) {
      alert("Error memproses pembayaran.");
      setLoading(false);
    }
  };

  const profileActiveUntil = new Date(userProfile.activeUntil || 0);
  const isRestricted = new Date() > profileActiveUntil;
  const sisaHari = Math.ceil((profileActiveUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

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
             Pilih paket yang sesuai untuk merancang konten dengan maksimal. <br/>Dapatkan diskon eksklusif dengan menggunakan voucher promo.
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
           
           <button onClick={() => setShowVoucherList(true)} style={{background:"white", border:"1px solid #C4622D", color:"#C4622D", padding:"12px 24px", borderRadius:12, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
             🎟️ Lihat Voucher Aktif
           </button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24}}>
          {plans.map(p => (
            <div key={p.id} style={{background:"white", border:`2px solid ${p.popular ? "rgba(196,98,45,0.3)" : "rgba(44,32,22,0.05)"}`, borderRadius:24, padding:32, display:"flex", flexDirection:"column", position:"relative", boxShadow: p.popular ? "0 15px 35px rgba(196,98,45,0.08)" : "0 8px 24px rgba(0,0,0,0.02)"}}>
              {p.popular && <div style={{position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#C4622D", color:"white", padding:"4px 12px", borderRadius:16, fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase"}}>Best Value</div>}
              <div style={{fontSize:18, fontWeight:800, color:"#2C2016", marginBottom:8}}>{p.name}</div>
              <div style={{display:"flex", alignItems:"flex-end", gap:6, marginBottom:16}}>
                 <div style={{fontSize:28, fontWeight:800, color:"#2C2016", letterSpacing:"-0.5px"}}>
                   Rp {p.price.toLocaleString("id-ID")}
                 </div>
                 {p.originalPrice > 0 && <div style={{fontSize:14, fontWeight:600, color:"rgba(44,32,22,0.4)", textDecoration:"line-through", marginBottom:4}}>Rp {p.originalPrice.toLocaleString("id-ID")}</div>}
              </div>
              <div style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.4, flex:1}}>{p.desc}</div>
              
              <div style={{marginBottom:32}}>
                {(p.features || []).map((f: string, i: number) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:10, marginBottom:12, fontSize:13, fontWeight:600, color:"#2C2016"}}>
                    <div style={{width:18, height:18, borderRadius:"50%", background: "rgba(83,129,53,0.1)", color:"#538135", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10}}>✓</div>
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => handleSelectPlan(p)} style={{background: p.popular ? "#C4622D" : "#2C2016", color: "white", fontWeight:800, fontSize:15, padding:"16px", borderRadius:16, border:"none", cursor:"pointer", width:"100%", boxShadow: p.popular ? "0 8px 20px rgba(196,98,45,0.2)" : "none", transition:"all 0.2s"}} className="hover-scale">
                Pilih Paket
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div style={{gridColumn:"1/-1", padding:60, textAlign:"center", background:"white", borderRadius:24, border:"1px dashed #CCC", color:"#999"}}>
               Memuat paket langganan...
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* Payment Modal */}
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
             <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} style={{background:"white", borderRadius:32, padding:"32px 40px", maxWidth:500, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
               <div style={{width:64, height:64, background:"rgba(44,32,22,0.05)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 24px"}}>🛒</div>
               <h3 style={{fontSize:24, fontWeight:800, color:"#2C2016", marginBottom:8}}>Checkout Pembayaran</h3>
               <p style={{fontSize:15, color:"rgba(44,32,22,0.6)", marginBottom:32, lineHeight:1.5}}>Anda akan berlangganan paket <strong style={{color:"#C4622D"}}>{modal.name}</strong>.</p>
               
               {/* Voucher Section */}
               <div style={{marginBottom:24, textAlign:"left"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                    <label style={{fontSize:12, fontWeight:800, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", margin:0}}>Punya Kode Voucher?</label>
                    <button onClick={() => setShowVoucherList(true)} style={{fontSize:11, fontWeight:800, color:"#C4622D", background:"none", border:"none", cursor:"pointer", textDecoration:"underline"}}>Lihat Voucher Aktif</button>
                  </div>
                  <div style={{display:"flex", gap:8}}>
                    <input 
                     placeholder="Masukkan kode..." 
                     value={voucherCodeInput}
                     onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                     style={{flex:1, padding:"12px 16px", borderRadius:12, border:"1px solid #EEE", fontSize:14, fontWeight:800, letterSpacing:1}} 
                    />
                    <button onClick={() => handleApplyVoucher(voucherCodeInput)} style={{background:"#2C2016", color:"white", border:"none", padding:"0 20px", borderRadius:12, fontWeight:700, fontSize:13, cursor:"pointer"}}>Terapkan</button>
                  </div>
                  {voucherError && <div style={{fontSize:11, color:"#9C2B4E", fontWeight:700, marginTop:6}}>* {voucherError}</div>}
               </div>

               <div style={{background:"#FDFDFD", border:"1px solid rgba(44,32,22,0.08)", borderRadius:20, padding:24, textAlign:"left", marginBottom:32}}>
                 <div style={{display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:14}}>
                   <span style={{color:"rgba(44,32,22,0.5)", fontWeight:600}}>Harga Paket</span> 
                   <span style={{fontWeight:700}}>Rp {modal.price.toLocaleString("id-ID")}</span>
                 </div>
                 
                 {appliedVoucher && (
                   <div style={{display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:14, color:"#4CAF50"}}>
                     <span style={{fontWeight:600}}>Potongan Promo ({appliedVoucher.code})</span> 
                     <span style={{fontWeight:800}}>- Rp {(modal.price - calculateFinalPrice(modal.price)).toLocaleString("id-ID")}</span>
                   </div>
                 )}

                 <div style={{height:1, borderBottom:"1px dashed rgba(44,32,22,0.1)", margin:"12px 0"}}/>
                 
                 <div style={{display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:800, color:"#2C2016"}}>
                   <span>Total Bayar</span> 
                   <span style={{color:"#C4622D"}}>Rp {calculateFinalPrice(modal.price).toLocaleString("id-ID")}</span>
                 </div>
               </div>

               <div style={{display:"flex", gap:14}}>
                 <button onClick={()=>{setModal(null); setAppliedVoucher(null);}} style={{flex:1, background:"#F5F5F5", color:"#2C2016", fontWeight:800, padding:"16px", borderRadius:16, border:"none", cursor:"pointer", fontSize:15}}>Batal</button>
                 <button onClick={handleSimulatePayment} disabled={loading} style={{flex:1, background:"#2C2016", color:"white", fontWeight:800, padding:"16px", borderRadius:16, border:"none", cursor:loading?"wait":"pointer", fontSize:15, boxShadow:"0 8px 20px rgba(0,0,0,0.1)"}}>
                   {loading ? "Memproses..." : "Bayar Sekarang"}
                 </button>
               </div>
               
               {appliedVoucher && (
                 <div style={{marginTop:20, background:"rgba(76,175,80,0.05)", padding:12, borderRadius:12, display:"flex", alignItems:"center", gap:10}}>
                   <div style={{fontSize:20}}>🎉</div>
                   <div style={{textAlign:"left"}}>
                     <div style={{fontSize:11, fontWeight:800, color:"#4CAF50"}}>VOUCHER TERAPAKAN</div>
                     <div style={{fontSize:12, fontWeight:600, color:"#666"}}>{appliedVoucher.code} - Kamu hemat {appliedVoucher.type === 'percent' ? `${appliedVoucher.value}%` : fmt(appliedVoucher.value)}</div>
                   </div>
                   <button onClick={()=>setAppliedVoucher(null)} style={{marginLeft:"auto", background:"none", border:"none", color:"#999", fontWeight:800, cursor:"pointer"}}>×</button>
                 </div>
               )}
             </motion.div>
          </motion.div>
        )}

        {/* Voucher List Modal */}
        {showVoucherList && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
            <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} style={{background:"white", borderRadius:32, padding:32, maxWidth:450, width:"100%", maxHeight:"80vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                  <h3 style={{fontSize:20, fontWeight:800}}>Voucher Tersedia</h3>
                  <button onClick={()=>setShowVoucherList(false)} style={{background:"#F5F5F5", border:"none", padding:8, borderRadius:12, cursor:"pointer"}}>×</button>
               </div>
               
               <div style={{display:"flex", flexDirection:"column", gap:16}}>
                 {promos.filter(p => p.isActive).map(p => {
                    const now = new Date();
                    const isRestrictedForUser = p.targetType === 'first_timer' && userProfile.hasUsedPromo;
                    const isLimitReached = p.usageLimit > 0 && (p.usageCount || 0) >= p.usageLimit;
                    const isNotStarted = p.startDate && new Date(p.startDate) > now;
                    const isExpired = p.endDate && new Date(p.endDate) < now;
                    const isDisabled = isRestrictedForUser || isLimitReached || isNotStarted || isExpired;

                    return (
                      <div key={p.id} style={{padding:20, border:"2px dashed #EEE", borderRadius:20, position:"relative", opacity: isDisabled ? 0.6 : 1, background: isDisabled ? "#F9F9F9" : "white"}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12}}>
                          <div>
                            <div style={{fontSize:16, fontWeight:800, color:"#2C2016"}}>{p.code}</div>
                            <div style={{fontSize:12, fontWeight:700, color:"#C4622D", marginTop:2}}>
                              Diskon {p.type === 'percent' ? `${p.value}%` : `Rp ${p.value.toLocaleString()}`}
                            </div>
                          </div>
                          <button 
                            disabled={isDisabled}
                            onClick={() => {
                              handleApplyVoucher(p.code);
                              setShowVoucherList(false);
                            }} 
                            style={{background: isDisabled ? "#CCC" : "#2C2016", color:"white", border:"none", padding:"6px 16px", borderRadius:10, fontSize:12, fontWeight:800, cursor: isDisabled ? "not-allowed" : "pointer"}}
                          >
                            {isDisabled ? "Tidak Bisa Pakai" : "Gunakan"}
                          </button>
                        </div>
                        
                        {p.terms && (
                          <div style={{fontSize:11, color:"#999", lineHeight:1.4, borderTop:"1px solid #F5F5F5", paddingTop:10, marginBottom:8}}>
                            <span style={{fontWeight:800, display:"block", marginBottom:4}}>S&K:</span>
                            {p.terms}
                          </div>
                        )}

                        <div style={{fontSize:10, color:"#666", fontWeight:600}}>
                           {p.startDate ? `📅 Mulai: ${p.startDate}` : ""} {p.endDate ? `🏁 Berakhir: ${p.endDate}` : ""}
                        </div>
                        
                        {isRestrictedForUser && <div style={{fontSize:10, color:"#9C2B4E", fontWeight:700, marginTop:8}}>* Berlaku hanya untuk pembelian pertama.</div>}
                        {isLimitReached && <div style={{fontSize:10, color:"#9C2B4E", fontWeight:700, marginTop:8}}>* Voucher sudah habis/limit tercapai.</div>}
                        {isNotStarted && <div style={{fontSize:10, color:"#9C2B4E", fontWeight:700, marginTop:8}}>* Voucher belum masa berlaku.</div>}
                        {isExpired && <div style={{fontSize:10, color:"#9C2B4E", fontWeight:700, marginTop:8}}>* Voucher sudah kadaluarsa.</div>}
                      </div>
                    )
                 })}
                 {promos.filter(p => p.isActive).length === 0 && (
                   <div style={{padding:40, textAlign:"center", color:"#999", fontWeight:600}}>Belum ada voucher promo saat ini.</div>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmt(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion } from "motion/react";
import { 
  MK, MC, eng, fmt, fmtD,
  I, L, B, GRP 
} from "./data";

export function ContentModal({modal,onSave,onClose,onArchive,onRestore,onDelete,pillars,platforms,pics,statuses}: any) {
  const [d,setD] = useState({...modal.data,metrics:{...modal.data.metrics},adsMetrics:{...(modal.data.adsMetrics||{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0,clicks:0,conversions:0})},referenceLinks:modal.data.referenceLinks||[],customFields:modal.data.customFields||[]});
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const set = (k:string,v:any) => setD((p:any)=>({...p,[k]:v}));
  const setM = (k:string,v:any, isAds=false) => {
    const ts = new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
    if(isAds) {
      setD((p:any)=>({...p,adsMetrics:{...p.adsMetrics,[k]:Number(v)||0},metricsUpdatedAt:ts}));
    } else {
      setD((p:any)=>({...p,metrics:{...p.metrics,[k]:Number(v)||0},metricsUpdatedAt:ts}));
    }
  };

  const analyzeContent = async () => {
    if(!d.caption && !d.briefCopywriting) {
        alert("Harap isi caption atau brief terlebih dahulu untuk dianalisis AI.");
        return;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if(!apiKey) {
        setAiResult("API Key tidak ditemukan. Harap konfigurasi di setelan.");
        return;
    }
    setAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Analisis konten pemasaran berikut ini:
        Judul: ${d.title}
        Pillar: ${d.pillar}
        Platform: ${d.platform}
        Caption: ${d.caption}
        Brief: ${d.briefCopywriting}
        Objective: ${d.objective}
        
        Berikan evaluasi singkat dan 3 poin saran perbaikan untuk meningkatkan engagement. Format dalam Bahasa Indonesia, singkat, padat, dan teknis.`;
        
        const result = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
        });
        setAiResult(result.text || "Tidak ada respon dari AI.");
    } catch (e) {
        setAiResult("Gagal menganalisis konten: " + String(e));
    }
    setAiLoading(false);
  };

  const handleRefImg = (e:any) => {
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev:any)=>set("referenceImage",ev.target.result);
    reader.readAsDataURL(file);
  };
  const isNew = modal.mode==="add";
  const canArchive = !d.archived && !isNew;
  const canDelete = !isNew;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(30,21,9,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,backdropFilter:"blur(4px)",overflow:"auto"}}>
      <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} onClick={e=>e.stopPropagation()} style={{background:"#FAFAFA",borderRadius:24,padding:32,maxWidth:700,width:"100%",maxHeight:"94vh",overflow:"auto",position:"relative",boxShadow:"0 24px 60px rgba(30,21,9,0.4)"}}>
        <button className="hover-scale" onClick={onClose} style={{position:"absolute",top:20,right:20,background:"rgba(44,32,22,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"#2C2016",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        
        <div style={{background:"#2C2016",color:"#FAFAFA",borderRadius:16,padding:"24px 28px",marginBottom:24, boxShadow:"inset 0 2px 4px rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:16}}>
                <div style={{flex:1}}>
                   <label style={{...L, color:"rgba(250,247,242,0.4)", fontSize:10}}>Judul Konten</label>
                   <input value={d.title} onChange={(e:any)=>set("title",e.target.value)} 
                     style={{background:"transparent",border:"none",borderBottom:"1.5px solid rgba(250,247,242,0.2)",fontSize:26,fontWeight:800, letterSpacing:"-0.5px",color:"white",width:"100%",outline:"none",padding:"4px 0"}} placeholder="Tulis Judul Konten..."/>
                </div>
                <div style={{textAlign:"right"}}>
                    <h2 style={{fontSize:16,margin:0,color:"#FF6B00", fontWeight:700}}>{isNew?"✨ Baru":"✏️ Detail Konten"}</h2>
                </div>
            </div>
            
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:20 }}>
              <div style={GRP}>
                <label style={{...L, color:"rgba(250,247,242,0.4)", marginBottom:4}}>Content Pillar</label>
                <select value={d.pillar} onChange={(e:any)=>set("pillar",e.target.value)} style={{...I({background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", padding:"6px 10px"}), width:"100%"}}>
                    {pillars.map((p:any)=><option key={p.name} value={p.name} style={{color:"black"}}>{p.name}</option>)}
                </select>
              </div>
              <div style={GRP}>
                <label style={{...L, color:"rgba(250,247,242,0.4)", marginBottom:4}}>PIC Pengelola</label>
                <select value={d.pic} onChange={(e:any)=>set("pic",e.target.value)} style={{...I({background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", padding:"6px 10px"}), width:"100%"}}>
                    {pics.map((p:any)=><option key={p} value={p} style={{color:"black"}}>{p}</option>)}
                </select>
              </div>
              <div style={GRP}>
                <label style={{...L, color:"rgba(250,247,242,0.4)", marginBottom:4}}>Status Konten</label>
                <select value={d.status} onChange={(e:any)=>set("status",e.target.value)} style={{...I({background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", padding:"6px 10px"}), width:"100%"}}>
                    {statuses.map((s:any)=><option key={s} value={s} style={{color:"black"}}>{s}</option>)}
                </select>
              </div>
            </div>
        </div>

        {/* AI Analysis Result Section if exists */}
        {aiResult && (
          <div style={{background:"#E3F2FD", border:"1px solid #BBDEFB", borderRadius:10, padding:14, marginBottom:20}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <span style={{fontSize:12, fontWeight:700, color:"#1E88E5"}}>🤖 AI Content Analysis</span>
              <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:14, cursor:"pointer"}}>&times;</button>
            </div>
            <div style={{fontSize:12, lineHeight:1.5, color:"#333", whiteSpace:"pre-wrap"}}>{aiResult}</div>
          </div>
        )}

        {/* Row 1: Date + Time + Platform */}
        <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr",gap:10,marginBottom:12}}>
          <div style={GRP}>
            <label style={L}>Tanggal (Hari dd/mm/yyyy)</label>
            <div style={{display:"flex", gap:4}}>
                <input type="number" min={1} max={31} value={d.day} onChange={(e:any)=>set("day",+e.target.value)} style={{...I(), width:60}}/>
                <input type="text" readOnly value={fmtD(d.year, d.month, d.day)} style={{...I({background:"rgba(44,32,22,0.03)"}), flex:1}}/>
            </div>
          </div>
          <div style={GRP}>
            <label style={L}>Jam Upload</label>
            <div style={{display:"flex",gap:4}}>
              <input type="number" min={0} max={23} value={d.uploadHour} onChange={(e:any)=>set("uploadHour",+e.target.value)} style={I({textAlign:"center"})} placeholder="HH"/>
              <span style={{lineHeight:"36px",color:"rgba(44,32,22,0.4)"}}>:</span>
              <input type="number" min={0} max={59} step={5} value={d.uploadMinute} onChange={(e:any)=>set("uploadMinute",+e.target.value)} style={I({textAlign:"center"})} placeholder="MM"/>
            </div>
          </div>
          <div style={GRP}>
            <label style={L}>Platform</label>
            <select value={d.platform} onChange={(e:any)=>set("platform",e.target.value)} style={I()}>
              {platforms.map((p:any)=><option key={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Ads Toggle */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"8px 12px",background:"rgba(156,43,78,0.05)",borderRadius:8,border:"1px solid rgba(156,43,78,0.1)"}}>
          <button onClick={()=>set("isAds",!d.isAds)} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?20:2,transition:"left .2s"}}/>
          </button>
          <div>
            <span style={{fontSize:13,fontWeight:600,color:d.isAds?"#9C2B4E":"#2C2016"}}>💰 {d.isAds?"Konten Berbayar (Ads/Boost)":"Konten Organik"}</span>
            <div style={{fontSize:10,color:"rgba(44,32,22,0.4)"}}>Toggle untuk menandai apakah konten ini diiklankan</div>
          </div>
        </div>

        {/* Brief Section with AI Button */}
        <div style={{...GRP,marginBottom:10}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label style={L}>Brief Konten</label>
                <button onClick={analyzeContent} disabled={aiLoading} 
                  style={{...B(false), fontSize:10, padding:"2px 8px", background:"#C4622D", color:"white", border:"none"}}>
                  {aiLoading ? "Menganalisis..." : "🤖 Analisis AI"}
                </button>
            </div>
            <textarea value={d.briefCopywriting} onChange={(e:any)=>set("briefCopywriting",e.target.value)} style={I({minHeight:80,resize:"vertical"})} placeholder="Arah konten, tone, poin utama..."/>
        </div>

        <div style={{...GRP,marginBottom:10}}>
            <label style={L}>Caption</label>
            <textarea value={d.caption} onChange={(e:any)=>set("caption",e.target.value)} style={I({minHeight:60,resize:"vertical"})} placeholder="Caption untuk post..."/>
        </div>

        <div style={{marginBottom:10}}>
          <div style={GRP}><label style={L}>Objective</label><textarea value={d.objective} onChange={(e:any)=>set("objective",e.target.value)} style={I({minHeight:60,resize:"vertical"})} placeholder="Tujuan konten ini..."/></div>
        </div>

        {/* Asset Link & Social Media Link */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={GRP}>
            <label style={L}>🔗 Link Aset Final (G-Drive / Dropbox)</label>
            <input value={d.linkAsset||""} onChange={(e:any)=>set("linkAsset",e.target.value)} style={I()} placeholder="https://drive.google.com/..."/>
          </div>
          <div style={GRP}>
            <label style={L}>🔗 Link Upload / Postingan Sosmed</label>
            <input value={d.linkSosmed||""} onChange={(e:any)=>set("linkSosmed",e.target.value)} style={I()} placeholder="https://instagram.com/p/..."/>
          </div>
        </div>

        {/* Reference Section */}
        <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{...L,marginBottom:8}}>📎 Referensi Konten</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={GRP}><label style={{...L,marginBottom:2}}>Catatan Referensi</label><textarea value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={I({minHeight:54,resize:"vertical"})} placeholder="Referensi, mood, arahan visual..."/></div>
            <div style={GRP}>
              <label style={{...L,marginBottom:2}}>Link Referensi <button onClick={()=>set("referenceLinks",[...(d.referenceLinks||[]),""])} style={{background:"none",border:"none",color:"#C4622D",cursor:"pointer",fontSize:10}}>(+ Tambah)</button></label>
              {(d.referenceLinks||[]).map((lnk:string,i:number)=>(
                <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
                  <input value={lnk} onChange={(e:any)=>set("referenceLinks", d.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={I()} placeholder="https://..."/>
                  <button onClick={()=>set("referenceLinks", d.referenceLinks.filter((_:any,idx:number)=>idx!==i))} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <div style={GRP}>
            <label style={{...L,marginBottom:2}}>Upload Gambar Referensi</label>
            <input type="file" accept="image/*" onChange={handleRefImg} style={{fontSize:11,color:"rgba(44,32,22,0.5)"}}/>
            {d.referenceImage&&<img src={d.referenceImage} alt="ref" style={{maxWidth:200,maxHeight:100,borderRadius:6,marginTop:6,border:"1px solid rgba(44,32,22,0.1)",objectFit:"contain"}}/>}
          </div>
        </div>

        {/* Custom Fields */}
        <div style={{marginBottom:18}}>
           <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
             <label style={L}>Custom Fields</label>
             <button onClick={()=>set("customFields",[...(d.customFields||[]),{name:"Label Baru",value:""}])} style={{...B(false),fontSize:10,padding:"2px 8px"}}>+ Tambah Field</button>
           </div>
           {(d.customFields||[]).map((cf:any,i:number)=>(
             <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,idx:number)=>idx===i?{...f,name:e.target.value}:f))} style={{...I(),width:120}} placeholder="Nama Field..."/>
                <textarea value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,idx:number)=>idx===i?{...f,value:e.target.value}:f))} style={I({resize:"vertical",minHeight:36})} placeholder="Isi field..."/>
                <button onClick={()=>set("customFields", d.customFields.filter((_:any,idx:number)=>idx!==i))} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
             </div>
           ))}
        </div>

        {/* Metrics */}
        <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:10,padding:12,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{...L}}>📊 Metrik Performa Organik</div>
            {d.metricsUpdatedAt&&<div style={{fontSize:10,color:"rgba(44,32,22,0.4)"}}>Data last updated: {d.metricsUpdatedAt}</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {MK.map((k:string)=>(
              <div key={k} style={GRP}>
                <label style={{...L,marginBottom:2,color:MC[k]||"#C4622D"}}>{k}</label>
                <input type="number" min={0} value={d.metrics[k]||0} onChange={(e:any)=>setM(k,e.target.value)} style={I({textAlign:"right"})}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,padding:"7px 10px",background:"rgba(196,98,45,0.06)",borderRadius:8,display:"flex",gap:16,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"rgba(44,32,22,0.6)"}}>Total Engagement: <strong style={{color:"#C4622D"}}>{fmt(eng(d.metrics))}</strong></span>
            <span style={{fontSize:12,color:"rgba(44,32,22,0.6)"}}>ER: <strong style={{color:"#C4622D"}}>{(d.metrics?.reach||0)>0?((eng(d.metrics)/(d.metrics.reach))*100).toFixed(2):0}%</strong></span>
          </div>
        </div>

        {/* Ads Metrics */}
        {d.isAds && (
          <div style={{background:"rgba(156,43,78,0.03)",border:"1px solid rgba(156,43,78,0.1)",borderRadius:10,padding:12,marginBottom:18}}>
            <div style={{...L,marginBottom:8,color:"#9C2B4E"}}>💰 Metrik Performa Ads</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[...MK,"clicks","conversions"].map((k:string)=>(
                <div key={k} style={GRP}>
                  <label style={{...L,marginBottom:2,color:k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E"}}>{k}</label>
                  <input type="number" min={0} value={d.adsMetrics?.[k]||0} onChange={(e:any)=>setM(k,e.target.value,true)} style={I({textAlign:"right"})}/>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,padding:"7px 10px",background:"rgba(156,43,78,0.06)",borderRadius:8,display:"flex",gap:16,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#9C2B4E"}}>Total Engagement Ads: <strong>{fmt(eng(d.adsMetrics||{}))}</strong></span>
              <span style={{fontSize:12,color:"#9C2B4E"}}>Ad Clicks: <strong>{fmt(d.adsMetrics?.clicks||0)}</strong></span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:8}}>
            {d.archived ? (
              <button onClick={()=>onRestore(d.id)} style={{...B(false),background:"#E8F5E9",border:"1.5px solid #2E7D32",color:"#2E7D32",padding:"8px 16px",fontWeight:600}}>🔄 Tampilkan Lagi</button>
            ) : (
              canArchive&&<button onClick={()=>onArchive(d.id)} style={{...B(false),background:"#F1E8F5",border:"1.5px solid #723680",color:"#723680",padding:"8px 16px",fontWeight:600}}>📦 Arsipkan</button>
            )}
            {canDelete&&<button onClick={()=>onDelete(d.id)} style={{...B(false),background:"#FDF5F8",border:"1.5px solid #9C2B4E",color:"#9C2B4E",padding:"8px 16px",fontWeight:600}}>🗑️ Hapus Permanen</button>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{...B(false),padding:"8px 18px"}}>Batal</button>
            <button onClick={()=>{if(!d.title.trim()){alert("Judul tidak boleh kosong.");return;} onSave(d);}} style={{...B(true,"#C4622D"),padding:"8px 22px",fontWeight:600}}>{isNew?"+ Tambahkan":"💾 Simpan"}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


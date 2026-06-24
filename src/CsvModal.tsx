import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { emptyItem, gid, B, CARD } from "./data";
import { motion } from "motion/react";
import { Upload } from "lucide-react";

export function CsvModal({onClose, onImport, pillars, platforms, contentTypes, pics, statuses, existingContent}: any) {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility to clean encoding issues (like â instead of quotes/dashes)
  const cleanStr = (str: any) => {
    if (!str) return "";
    let s = String(str);
    return s
      .replace(/â€\x9d/g, '"')
      .replace(/â€\x9c/g, '"')
      .replace(/â€/g, "-")
      .replace(/â/g, "");
  };

  const textToHtml = (str: string) => {
    if (!str) return "";
    if (/<[a-z][\s\S]*>/i.test(str)) return str;
    let html = str;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    html = html.replace(/\r?\n/g, "<br>");
    return html;
  };

  const handleImportClick = () => {
    const hasDups = dataPreview.some(d => existingContent?.some((ec:any) => ec.id !== d.id && ec.title === d.title && ec.year === d.year && ec.month === d.month && ec.day === d.day));
    if (hasDups) {
       setShowConfirm(true);
    } else {
       onImport(dataPreview);
       onClose();
    }
  };

  const template = [
    ["Judul Konten", "Tanggal (1-31)", "Bulan (1-12)", "Tahun", "Jam (0-23)", "Menit", "Pillar", "Platform", "Tipe Konten", "PIC", "Status Konten", "Status Ads", "Views", "Reach", "Likes", "Comments", "Shares", "Saves", "Objective", "Brief Konten", "Caption", "Link Aset", "Link Sosmed", "Link Referensi"],
    ["Contoh Konten Instagram", "15", "5", "2025", "10", "30", pillars[0]?.name||"Pillar Utama", platforms[0]?.name||"Instagram", contentTypes?.[0]?.name||"Video Pendek", pics[0]||"PIC 1", statuses[0]||"Draft", "N", "100", "80", "10", "2", "1", "5", "Meningkatkan brand awareness", "Gunakan nada bicara santai", "Keren banget nih!", "https://drive.google.com/...", "https://instagram.com/...", "https://contoh.com, https://contoh2.com"]
  ];

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const csv = XLSX.utils.sheet_to_csv(ws);
    // Adding BOM for better Excel compatibility (fixes encoding issues on some systems)
    const csvWithBom = "\uFEFF" + csv;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" }));
    a.download = "template.csv";
    a.click();
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e: any) => {
        try {
            const data = new Uint8Array(e.target.result);
            // sheet_to_json preserves data but we need to handle potential encoding weirdness
            const workbook = XLSX.read(data, { type: 'array', codepage: 65001 }); // Force UTF-8 detection
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length < 2) {
                setErrorMsg("File CSV kosong atau tidak memiliki data.");
                return;
            }

            const headerRow = json[0].map((h: string) => h ? String(h).toLowerCase().trim() : "");
            const getColIdx = (keys: string[]) => {
                let idx = headerRow.findIndex(h => keys.some(k => h === k));
                if (idx === -1) idx = headerRow.findIndex(h => keys.some(k => h.includes(k)));
                return idx;
            };
            
            const idxId = getColIdx(["id system", "id"]);
            const idxTitle = getColIdx(["judul"]);
            const idxDate = getColIdx(["tanggal"]);
            const idxMonth = getColIdx(["bulan"]);
            const idxYear = getColIdx(["tahun"]);
            const idxHour = getColIdx(["jam"]);
            const idxMin = getColIdx(["menit"]);
            const idxPillar = getColIdx(["pillar"]);
            const idxPlatform = getColIdx(["platform"]);
            const idxContentType = getColIdx(["tipe konten", "tipe"]);
            const idxPic = getColIdx(["pic"]);
            const idxStatus = getColIdx(["status konten", "status"]);
            const idxAds = getColIdx(["status ads", "ads"]);
            const idxViews = getColIdx(["views"]);
            const idxReach = getColIdx(["reach"]);
            const idxLikes = getColIdx(["likes"]);
            const idxComments = getColIdx(["comments"]);
            const idxShares = getColIdx(["share"]);
            const idxSaves = getColIdx(["save"]);
            const idxObjective = getColIdx(["objective"]);
            const idxBrief = getColIdx(["brief"]);
            const idxCaption = getColIdx(["caption"]);
            const idxLinkAset = getColIdx(["link aset", "aset"]);
            const idxLinkSosmed = getColIdx(["link sosmed", "sosmed"]);
            const idxLinkRefer = getColIdx(["link referensi", "referensi"]);

            const parsedData = json.slice(1).filter(r => r.length > 0 && idxTitle !== -1 && String(r[idxTitle]||"").trim() !== "").map((row: any) => {
                const item = emptyItem(Number(row[idxYear])||2025, Number(row[idxMonth])||1, Number(row[idxDate])||1, pillars, platforms, pics, statuses, contentTypes);
                if (idxId !== -1 && row[idxId]) item.id = cleanStr(row[idxId]);
                item.title = cleanStr(row[idxTitle]);
                if (idxHour !== -1) item.uploadHour = Number(row[idxHour])||9;
                if (idxMin !== -1) item.uploadMinute = Number(row[idxMin])||0;
                if (idxPillar !== -1) item.pillar = String(row[idxPillar]||item.pillar);
                if (idxPlatform !== -1) item.platform = String(row[idxPlatform]||item.platform);
                if (idxContentType !== -1) item.contentType = String(row[idxContentType]||item.contentType);
                if (idxPic !== -1) item.pic = String(row[idxPic]||item.pic);
                if (idxStatus !== -1) item.status = String(row[idxStatus]||item.status);
                if (idxAds !== -1) item.isAds = String(row[idxAds]).toUpperCase() === "Y";
                
                item.metrics = {
                    views: idxViews !== -1 ? Number(row[idxViews])||0 : 0,
                    reach: idxReach !== -1 ? Number(row[idxReach])||0 : 0,
                    likes: idxLikes !== -1 ? Number(row[idxLikes])||0 : 0,
                    comments: idxComments !== -1 ? Number(row[idxComments])||0 : 0,
                    shares: idxShares !== -1 ? Number(row[idxShares])||0 : 0,
                    saves: idxSaves !== -1 ? Number(row[idxSaves])||0 : 0,
                    reposts: 0,
                    profileVisits: 0,
                    bioLinkTaps: 0,
                    follows: 0
                };
                if (idxObjective !== -1) item.objective = textToHtml(cleanStr(row[idxObjective])) || "";
                if (idxBrief !== -1) item.briefCopywriting = textToHtml(cleanStr(row[idxBrief])) || "";
                if (idxCaption !== -1) item.caption = textToHtml(cleanStr(row[idxCaption])) || "";
                if (idxLinkAset !== -1) item.linkAsset = cleanStr(row[idxLinkAset]) || "";
                if (idxLinkSosmed !== -1) item.linkSosmed = cleanStr(row[idxLinkSosmed]) || "";
                if (idxLinkRefer !== -1) {
                    const refs = cleanStr(row[idxLinkRefer]);
                    if (refs) item.referenceLinks = refs.split(",").map((s:string) => s.trim()).filter(Boolean);
                }
                return item;
            });
            
            setDataPreview(parsedData);
            setStep(2);
        } catch (err) {
            setErrorMsg("Gagal membaca file. Pastikan format CSV sesuai template.");
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const redo = () => {
     setDataPreview([]);
     setStep(1);
     if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div key="csvImportOverlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} onClick={onClose} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
      <motion.div key="csvImportCard" initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e=>e.stopPropagation()} style={{...CARD({width:"100%", maxWidth:600, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", position:"relative"}), background: "#FFFFFF", backdropFilter: "none", WebkitBackdropFilter: "none"}}>
        <button className="hover-scale" onClick={onClose} style={{position:"absolute",top:20,right:20,background:"rgba(44,32,22,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"#2C2016",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        <h2 style={{fontSize:20, fontWeight:700, margin:"0 0 16px", color:"#2C2016", display:"flex", alignItems:"center", gap:8}}><Upload size={20} /> Bulk Import via CSV</h2>
        
        {step===1 && (
            <div>
                <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:16,lineHeight:1.5}}>
                    Gunakan template CSV kami untuk memastikan format data sesuai. 
                    Anda dapat mengunggah ratusan konten sekaligus ke dalam kalender.
                </p>
                <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
                    <button className="hover-scale" onClick={handleDownloadTemplate} style={{...B(false), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>
                        Download Template CSV
                    </button>
                    <label className="hover-scale btn-hover" style={{...B(true, "var(--theme-primary)"), flex: 1, padding:"8px 16px", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, height:48, cursor:"pointer"}}>
                        Pilih File CSV / Excel
                        <input type="file" accept=".csv, .xlsx" onChange={handleFile} ref={fileInputRef} style={{display:"none"}}/>
                    </label>
                </div>
                {errorMsg && <div style={{padding:"12px 16px",background:"rgba(156, 43, 78, 0.05)",color:"#9C2B4E",borderRadius:12,border:"1px solid rgba(156, 43, 78, 0.1)",fontSize:13,fontWeight:600}}>{errorMsg}</div>}
            </div>
        )}

        {step===2 && (
            <div>
                <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:16, lineHeight:1.5}}>
                    Berhasil membaca <strong>{dataPreview.length}</strong> baris data. 
                    Periksa kembali pratinjau data di bawah ini sebelum melanjutkan.
                </p>
                <div style={{background:"rgba(44,32,22,0.02)",border:"1px solid rgba(44,32,22,0.06)",borderRadius:12,maxHeight:240,overflow:"auto",marginBottom:24}}>
                    <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                        <thead style={{background:"rgba(44,32,22,0.04)",position:"sticky",top:0,backdropFilter:"blur(4px)"}}>
                            <tr>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>Judul</th>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>Tanggal</th>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>Pillar / Platform</th>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>Caption</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPreview.slice(0, 10).map((r,i)=>(
                                <tr key={i} style={{borderBottom:"1px solid rgba(44,32,22,0.03)"}}>
                                    <td style={{padding:"8px 12px",color:"#2C2016",fontWeight:500}}>{r.title}</td>
                                    <td style={{padding:"8px 12px",color:"rgba(44,32,22,0.6)"}}>{r.day}/{r.month}/{r.year}</td>
                                    <td style={{padding:"8px 12px",color:"rgba(44,32,22,0.6)"}}>{r.pillar} • {r.platform}</td>
                                    <td style={{padding:"8px 12px",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(44,32,22,0.6)"}} title={r.caption}>{r.caption}</td>
                                </tr>
                            ))}
                            {dataPreview.length > 10 && (
                                <tr>
                                    <td colSpan={4} style={{padding:"12px",textAlign:"center",color:"rgba(44,32,22,0.4)",fontSize:12,fontWeight:600,fontStyle:"italic"}}>... {dataPreview.length - 10} baris lainnya ...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{display:"flex",gap:12}}>
                    <button className="hover-scale" onClick={redo} style={{...B(false), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>Ulangi</button>
                    <button className="hover-scale btn-hover" onClick={handleImportClick} style={{...B(true, "var(--theme-primary)"), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>Mulai Import</button>
                </div>
            </div>
        )}

        {showConfirm && (
          <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:24,zIndex:100,padding:24}}>
            <div style={{...CARD({width:"100%", maxWidth:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.15)", textAlign:"center"})}}>
              <h3 style={{fontSize:20,color:"#9C2B4E",fontWeight:700,marginBottom:16}}>Data duplikat terdeteksi</h3>
              <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:24,lineHeight:1.5}}>
                Beberapa konten memiliki judul dan tanggal yang sama dengan data yang sudah ada. Bagaimana memprosesnya?
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <button className="hover-scale btn-hover" onClick={()=>{
                  const filtered = dataPreview.filter(d => !existingContent?.some((ec:any) => ec.id !== d.id && ec.title === d.title && ec.year === d.year && ec.month === d.month && ec.day === d.day));
                  onImport(filtered);
                  onClose();
                }} style={{...B(true, "var(--theme-primary)"), width:"100%", height:48, fontSize:14, borderRadius:24}}>Hanya Baru (Abaikan Duplikat)</button>
                
                <button className="hover-scale btn-hover" onClick={()=>{onImport(dataPreview); onClose();}} style={{...B(true, "#9C2B4E"), width:"100%", height:48, fontSize:14, borderRadius:24}}>Timpa / Tetap Impor</button>
                
                <button className="hover-scale" onClick={()=>setShowConfirm(false)} style={{...B(false), width:"100%", height:48, fontSize:14, borderRadius:24}}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

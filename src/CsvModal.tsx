import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { emptyItem, gid } from "./data";
import { motion } from "motion/react";

export function CsvModal({onClose, onImport, pillars, platforms, pics, statuses, existingContent}: any) {
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

  const handleImportClick = () => {
    const hasDups = dataPreview.some(d => existingContent?.some((ec:any) => ec.title === d.title && ec.year === d.year && ec.month === d.month && ec.day === d.day));
    if (hasDups) {
       setShowConfirm(true);
    } else {
       onImport(dataPreview);
       onClose();
    }
  };

  const template = [
    ["Judul Konten", "Tanggal (1-31)", "Bulan (1-12)", "Tahun", "Jam (0-23)", "Menit", "Pillar", "Platform", "PIC", "Status Konten", "Status Ads", "Views", "Reach", "Likes", "Comments", "Shares", "Saves", "Objective", "Brief Konten", "Caption"],
    ["Contoh Konten Instagram", "15", "5", "2025", "10", "30", pillars[0]?.name||"Pillar Utama", platforms[0]?.name||"Instagram", pics[0]||"PIC 1", statuses[0]||"Draft", "N", "100", "80", "10", "2", "1", "5", "Meningkatkan brand awareness", "Gunakan nada bicara santai", "Keren banget nih!"]
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
            
            const idxTitle = getColIdx(["judul"]);
            const idxDate = getColIdx(["tanggal"]);
            const idxMonth = getColIdx(["bulan"]);
            const idxYear = getColIdx(["tahun"]);
            const idxHour = getColIdx(["jam"]);
            const idxMin = getColIdx(["menit"]);
            const idxPillar = getColIdx(["pillar"]);
            const idxPlatform = getColIdx(["platform"]);
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

            const parsedData = json.slice(1).filter(r => r.length > 0 && idxTitle !== -1 && String(r[idxTitle]||"").trim() !== "").map((row: any) => {
                const item = emptyItem(Number(row[idxYear])||2025, Number(row[idxMonth])||1, Number(row[idxDate])||1, pillars, platforms, pics, statuses);
                item.title = cleanStr(row[idxTitle]);
                if (idxHour !== -1) item.uploadHour = Number(row[idxHour])||9;
                if (idxMin !== -1) item.uploadMinute = Number(row[idxMin])||0;
                if (idxPillar !== -1) item.pillar = String(row[idxPillar]||item.pillar);
                if (idxPlatform !== -1) item.platform = String(row[idxPlatform]||item.platform);
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
                    reposts: 0
                };
                if (idxObjective !== -1) item.objective = cleanStr(row[idxObjective]) || "";
                if (idxBrief !== -1) item.briefCopywriting = cleanStr(row[idxBrief]) || "";
                if (idxCaption !== -1) item.caption = cleanStr(row[idxCaption]) || "";
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
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(30,21,9,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
      <motion.div initial={{scale:0.95, opacity:0, y:15}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:15}} transition={{ duration: 0.2, ease: "easeOut" }} onClick={e=>e.stopPropagation()} style={{background:"#FAFAFA",borderRadius:24,padding:32,maxWidth:600,width:"100%",position:"relative", boxShadow:"0 20px 40px rgba(0,0,0,0.2)"}}>
        <button className="hover-scale" onClick={onClose} style={{position:"absolute",top:20,right:20,background:"rgba(44,32,22,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"#2C2016",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        <h2 style={{fontSize:24,margin:"0 0 16px",color:"#2C2016", fontWeight:800, letterSpacing:"-0.5px"}}>📥 Bulk Import via CSV</h2>
        
        {step===1 && (
            <div>
                <p style={{fontSize:13,color:"rgba(44,32,22,0.6)",marginBottom:16,lineHeight:1.5}}>
                    Gunakan template CSV kami untuk memastikan format data sesuai. 
                    Anda dapat mengunggah ratusan konten sekaligus ke dalam kalender Your Company CMS.
                </p>
                <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
                    <button onClick={handleDownloadTemplate} style={{background:"white",border:"1.5px solid #C4622D",color:"#C4622D",padding:"8px 16px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>
                        1. Download Template
                    </button>
                    <label style={{background:"#C4622D",border:"1.5px solid #C4622D",color:"white",padding:"8px 16px",borderRadius:8,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center"}}>
                        2. Pilih File CSV
                        <input type="file" accept=".csv" onChange={handleFile} ref={fileInputRef} style={{display:"none"}}/>
                    </label>
                </div>
                {errorMsg && <div style={{padding:"8px 12px",background:"#FDF5F8",color:"#9C2B4E",borderRadius:6,fontSize:12,fontWeight:500}}>{errorMsg}</div>}
            </div>
        )}

        {step===2 && (
            <div>
                <p style={{fontSize:13,color:"rgba(44,32,22,0.6)",marginBottom:16}}>
                    Berhasil membaca <strong>{dataPreview.length}</strong> baris data. 
                    Periksa kembali data di bawah ini sebelum melanjutkan.
                </p>
                <div style={{background:"white",border:"1px solid rgba(44,32,22,0.1)",borderRadius:8,maxHeight:240,overflow:"auto",marginBottom:16}}>
                    <table style={{width:"100%",fontSize:11,borderCollapse:"collapse"}}>
                        <thead style={{background:"rgba(44,32,22,0.03)",position:"sticky",top:0}}>
                            <tr>
                                <th style={{padding:"6px 8px",textAlign:"left"}}>Judul</th>
                                <th style={{padding:"6px 8px",textAlign:"left"}}>Tanggal</th>
                                <th style={{padding:"6px 8px",textAlign:"left"}}>Pillar / Platform</th>
                                <th style={{padding:"6px 8px",textAlign:"left"}}>Caption</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPreview.slice(0, 10).map((r,i)=>(
                                <tr key={i} style={{borderTop:"1px solid rgba(44,32,22,0.05)"}}>
                                    <td style={{padding:"6px 8px"}}>{r.title}</td>
                                    <td style={{padding:"6px 8px"}}>{r.day}/{r.month}/{r.year}</td>
                                    <td style={{padding:"6px 8px"}}>{r.pillar} • {r.platform}</td>
                                    <td style={{padding:"6px 8px",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.caption}>{r.caption}</td>
                                </tr>
                            ))}
                            {dataPreview.length > 10 && (
                                <tr>
                                    <td colSpan={3} style={{padding:"8px",textAlign:"center",color:"rgba(44,32,22,0.4)"}}>... {dataPreview.length - 10} data lainnya ...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <button onClick={redo} style={{background:"transparent",border:"none",color:"#2C2016",padding:"8px 16px",fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>Ulangi (Redo)</button>
                    <button onClick={handleImportClick} style={{background:"#C4622D",border:"none",color:"white",padding:"8px 24px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Mulai Import</button>
                </div>
            </div>
        )}

        {showConfirm && (
          <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:24,zIndex:100}}>
            <div style={{background:"white",padding:32,borderRadius:16,maxWidth:400,textAlign:"center",boxShadow:"0 10px 40px rgba(0,0,0,0.15)",border:"1px solid rgba(44,32,22,0.1)"}}>
              <h3 style={{fontSize:18,color:"#9C2B4E",fontWeight:800,marginBottom:12}}>⚠️ Data duplikat terdeteksi</h3>
              <p style={{fontSize:14,color:"rgba(44,32,22,0.7)",marginBottom:24,lineHeight:1.5}}>
                Beberapa konten yang akan diimpor memiliki judul dan tanggal yang sama dengan data yang sudah ada di database. Apakah Anda yakin ingin tetap memasukkannya?
              </p>
              <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                <button onClick={()=>setShowConfirm(false)} style={{background:"#F5F0E8",border:"none",color:"#2C2016",padding:"10px 24px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Tidak, Batal</button>
                <button onClick={()=>{onImport(dataPreview); onClose();}} style={{background:"#9C2B4E",border:"none",color:"white",padding:"10px 24px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Ya, Lanjutkan</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

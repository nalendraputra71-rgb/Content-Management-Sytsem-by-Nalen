import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { emptyItem, gid } from "./data";

export function CsvModal({onClose, onImport, pillars, platforms, pics, statuses}: any) {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const template = [
    ["Judul Konten", "Tanggal (1-31)", "Bulan (1-12)", "Tahun", "Jam (0-23)", "Menit", "Pillar", "Platform", "PIC", "Status", "Ads (Y/N)", "Views", "Reach", "Likes", "Comments", "Shares", "Saves"],
    ["Contoh Konten Instagram", "15", "5", "2025", "10", "30", pillars[0]?.name||"Pillar Utama", platforms[0]?.name||"Instagram", pics[0]||"PIC 1", statuses[0]||"Draft", "N", "100", "80", "10", "2", "1", "5"]
  ];

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const csv = XLSX.utils.sheet_to_csv(ws);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "fakdhera-template.csv";
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
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length < 2) {
                setErrorMsg("File CSV kosong atau tidak memiliki data.");
                return;
            }

            const parsedData = json.slice(1).filter(r => r.length > 0 && r[0]).map((row: any) => {
                const item = emptyItem(Number(row[3])||2025, Number(row[2])||1, Number(row[1])||1, pillars, platforms, pics, statuses);
                item.title = String(row[0]||"");
                item.uploadHour = Number(row[4])||9;
                item.uploadMinute = Number(row[5])||0;
                item.pillar = String(row[6]||item.pillar);
                item.platform = String(row[7]||item.platform);
                item.pic = String(row[8]||item.pic);
                item.status = String(row[9]||item.status);
                item.isAds = String(row[10]).toUpperCase() === "Y";
                item.metrics = {
                    views: Number(row[11])||0,
                    reach: Number(row[12])||0,
                    likes: Number(row[13])||0,
                    comments: Number(row[14])||0,
                    shares: Number(row[15])||0,
                    saves: Number(row[16])||0,
                    reposts: 0
                };
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
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(30,21,9,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#FAF7F2",borderRadius:16,padding:26,maxWidth:600,width:"100%",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(44,32,22,0.08)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:17,color:"#2C2016",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,margin:"0 0 16px",color:"#2C2016"}}>📥 Bulk Import via CSV</h2>
        
        {step===1 && (
            <div>
                <p style={{fontSize:13,color:"rgba(44,32,22,0.6)",marginBottom:16,lineHeight:1.5}}>
                    Gunakan template CSV kami untuk memastikan format data sesuai. 
                    Anda dapat mengunggah ratusan konten sekaligus ke dalam kalender Fakdhera CMS.
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
                            </tr>
                        </thead>
                        <tbody>
                            {dataPreview.slice(0, 10).map((r,i)=>(
                                <tr key={i} style={{borderTop:"1px solid rgba(44,32,22,0.05)"}}>
                                    <td style={{padding:"6px 8px"}}>{r.title}</td>
                                    <td style={{padding:"6px 8px"}}>{r.day}/{r.month}/{r.year}</td>
                                    <td style={{padding:"6px 8px"}}>{r.pillar} • {r.platform}</td>
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
                    <button onClick={()=>{onImport(dataPreview); onClose();}} style={{background:"#C4622D",border:"none",color:"white",padding:"8px 24px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Mulai Import</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { useI18n } from "./i18n";
import { emptyItem, gid, B, CARD } from "./data";
import { motion } from "motion/react";
import { Upload } from "lucide-react";

export function CsvModal({onClose, onImport, pillars, platforms, contentTypes, pics, statuses, existingContent}: any) {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lang } = useI18n();

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

  const template = lang === "id" ? [
    [
      "Judul Konten", "Tanggal (1-31)", "Bulan (1-12)", "Tahun", "Jam (0-23)", "Menit", 
      "Pillar", "Platform", "Tipe Konten", "PIC", "Status Konten", "Status Ads", 
      "Objective", "Hook", "Brief Konten", "Call to Action", "Catatan Referensi", "Caption", 
      "Link Aset", "Link Sosmed", "Link Referensi",
      "Views", "Reach", "Likes", "Comments", "Shares", "Saves", "Reposts", "Profile Visits", "Bio Link Taps", "Follows",
      "Ads Views", "Ads Reach", "Ads Likes", "Ads Comments", "Ads Shares", "Ads Saves", "Ads Reposts", "Ads Profile Visits", "Ads Bio Link Taps", "Ads Follows",
      "Ads Clicks", "Ads Conversions", "Ads Msg Conv Started", "Ads 3s Plays", "Ads Spend Budget", "Ads Daily Budget", "Ads Duration", "Ads CPR Profile Visit", "Ads Audience"
    ],
    [
      "Contoh Konten Instagram", "15", "5", "2025", "10", "30", 
      pillars[0]?.name||"Pillar Utama", platforms[0]?.name||"Instagram", contentTypes?.[0]?.name||"Video Pendek", pics[0]?.name||pics[0]||"PIC 1", statuses[0]?.name||statuses[0]||"Draft", "N", 
      "Meningkatkan brand awareness", "Tahukah kamu bahwa...", "Gunakan nada bicara santai", "Klik link di bio!", "Contoh referensi tone: kasual", "Keren banget nih!", 
      "https://drive.google.com/...", "https://instagram.com/...", "https://contoh.com, https://contoh2.com",
      "100", "80", "10", "2", "1", "5", "0", "10", "1", "2",
      "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", ""
    ]
  ] : [
    [
      "Content Title", "Date (1-31)", "Month (1-12)", "Year", "Hour (0-23)", "Minute", 
      "Pillar", "Platform", "Content Type", "PIC", "Content Status", "Ads Status", 
      "Objective", "Hook", "Content Brief", "Call to Action", "Reference Notes", "Caption", 
      "Asset Link", "Social Media Link", "Reference Link",
      "Views", "Reach", "Likes", "Comments", "Shares", "Saves", "Reposts", "Profile Visits", "Bio Link Taps", "Follows",
      "Ads Views", "Ads Reach", "Ads Likes", "Ads Comments", "Ads Shares", "Ads Saves", "Ads Reposts", "Ads Profile Visits", "Ads Bio Link Taps", "Ads Follows",
      "Ads Clicks", "Ads Conversions", "Ads Msg Conv Started", "Ads 3s Plays", "Ads Spend Budget", "Ads Daily Budget", "Ads Duration", "Ads CPR Profile Visit", "Ads Audience"
    ],
    [
      "Example Instagram Content", "15", "5", "2025", "10", "30", 
      pillars[0]?.name||"Main Pillar", platforms[0]?.name||"Instagram", contentTypes?.[0]?.name||"Short Video", pics[0]?.name||pics[0]||"PIC 1", statuses[0]?.name||statuses[0]||"Draft", "N", 
      "Increase brand awareness", "Did you know that...", "Use a casual tone", "Click link in bio!", "Casual tone reference", "This is so cool!", 
      "https://drive.google.com/...", "https://instagram.com/...", "https://example.com, https://example2.com",
      "100", "80", "10", "2", "1", "5", "0", "10", "1", "2",
      "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", ""
    ]
  ];

  const handleDownloadTemplate = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default || await import("exceljs");
      const { saveAs } = await import("file-saver");

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Template");
      const dataSheet = workbook.addWorksheet("DataLists", { state: "hidden" });

      // Add data lists
      pillars.forEach((p: any, i: number) => dataSheet.getCell(`A${i + 1}`).value = p?.name || p);
      platforms.forEach((p: any, i: number) => dataSheet.getCell(`B${i + 1}`).value = p?.name || p);
      contentTypes.forEach((p: any, i: number) => dataSheet.getCell(`C${i + 1}`).value = p?.name || p);
      pics.forEach((p: any, i: number) => dataSheet.getCell(`D${i + 1}`).value = p?.name || p);
      statuses.forEach((p: any, i: number) => dataSheet.getCell(`E${i + 1}`).value = p?.name || p);

      sheet.addRow(template[0]);
      sheet.addRow(template[1]);

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      
      // Adjust column width
      sheet.columns.forEach((c) => {
        if (c) c.width = 22;
      });

      // Apply Data Validation (max 1000 rows)
      const applyValidation = (col: string, dataCol: string, count: number) => {
        if (count > 0) {
          for (let i = 2; i <= 1000; i++) {
            sheet.getCell(`${col}${i}`).dataValidation = {
              type: "list",
              allowBlank: true,
              formulae: [`DataLists!$${dataCol}$1:$${dataCol}$${count}`]
            };
          }
        }
      };

      // Col G=Pillar, H=Platform, I=Tipe Konten, J=PIC, K=Status Konten
      applyValidation("G", "A", pillars.length);
      applyValidation("H", "B", platforms.length);
      applyValidation("I", "C", contentTypes.length);
      applyValidation("J", "D", pics.length);
      applyValidation("K", "E", statuses.length);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "Template_Impor_Konten.xlsx");
    } catch (err) {
      console.error("Failed to generate Excel template", err);
      setErrorMsg(lang === "id" ? "Gagal mengunduh template Excel." : "Failed to download Excel template.");
    }
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e: any) => {
        try {
            const data = new Uint8Array(e.target.result);
            import("xlsx").then((XLSX) => {
            // sheet_to_json preserves data but we need to handle potential encoding weirdness
            const workbook = XLSX.read(data, { type: 'array', codepage: 65001 }); // Force UTF-8 detection
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length < 2) {
                setErrorMsg(lang === "id" ? "File CSV kosong atau tidak memiliki data." : "CSV file is empty or has no data.");
                return;
            }

            const headerRow = json[0].map((h: string) => h ? String(h).toLowerCase().trim() : "");
            const getColIdx = (keys: string[]) => {
                let idx = headerRow.findIndex(h => keys.some(k => h === k));
                if (idx === -1) idx = headerRow.findIndex(h => keys.some(k => h.includes(k)));
                return idx;
            };

            const findExactMatch = (options: any[], value: any) => {
                if (value === undefined || value === null) return "";
                const valStr = String(value).trim().toLowerCase();
                if (!valStr) return "";
                for (const opt of (options || [])) {
                    const optName = opt?.name || opt;
                    if (String(optName).trim().toLowerCase() === valStr) {
                        return optName; // return the exactly cased option from the list
                    }
                }
                return String(value).trim(); // fallback
            };
            
            const idxId = getColIdx(["id system", "id"]);
            const idxTitle = getColIdx(["judul", "title"]);
            const idxDate = getColIdx(["tanggal", "date"]);
            const idxMonth = getColIdx(["bulan", "month"]);
            const idxYear = getColIdx(["tahun", "year"]);
            const idxHour = getColIdx(["jam", "hour"]);
            const idxMin = getColIdx(["menit", "minute"]);
            const idxPillar = getColIdx(["pillar"]);
            const idxPlatform = getColIdx(["platform"]);
            const idxContentType = getColIdx(["tipe konten", "tipe", "content type"]);
            const idxPic = getColIdx(["pic"]);
            const idxStatus = getColIdx(["status konten", "status", "content status"]);
            const idxAds = getColIdx(["status ads", "ads", "ads status"]);
            const idxObjective = getColIdx(["objective"]);
            const idxHook = getColIdx(["hook"]);
            const idxBrief = getColIdx(["brief", "content brief"]);
            const idxCta = getColIdx(["call to action", "cta"]);
            const idxRefText = getColIdx(["catatan referensi", "catatan", "reference notes"]);
            const idxCaption = getColIdx(["caption"]);
            
            const idxLinkAset = getColIdx(["link aset", "aset", "asset link"]);
            const idxLinkSosmed = getColIdx(["link sosmed", "sosmed", "social media link"]);
            const idxLinkRefer = getColIdx(["link referensi", "referensi", "reference link"]);

            const idxViews = getColIdx(["views"]);
            const idxReach = getColIdx(["reach"]);
            const idxLikes = getColIdx(["likes"]);
            const idxComments = getColIdx(["comments"]);
            const idxShares = getColIdx(["share"]);
            const idxSaves = getColIdx(["save"]);
            const idxReposts = getColIdx(["reposts", "repost"]);
            const idxProfileVisits = getColIdx(["profile visits", "profile visit"]);
            const idxBioLinkTaps = getColIdx(["bio link taps", "bio link tap", "link taps"]);
            const idxFollows = getColIdx(["follows", "follow"]);

            // Ads Metrics
            const idxAdsViews = getColIdx(["ads views"]);
            const idxAdsReach = getColIdx(["ads reach"]);
            const idxAdsLikes = getColIdx(["ads likes"]);
            const idxAdsComments = getColIdx(["ads comments"]);
            const idxAdsShares = getColIdx(["ads shares"]);
            const idxAdsSaves = getColIdx(["ads saves"]);
            const idxAdsReposts = getColIdx(["ads reposts"]);
            const idxAdsProfileVisits = getColIdx(["ads profile visits"]);
            const idxAdsBioLinkTaps = getColIdx(["ads bio link taps"]);
            const idxAdsFollows = getColIdx(["ads follows"]);
            const idxAdsClicks = getColIdx(["ads clicks"]);
            const idxAdsConversions = getColIdx(["ads conversions"]);
            const idxAdsMsgConvStarted = getColIdx(["ads msg conv started"]);
            const idxAds3sPlays = getColIdx(["ads 3s plays"]);
            const idxAdsSpendBudget = getColIdx(["ads spend budget"]);
            const idxAdsDailyBudget = getColIdx(["ads daily budget"]);
            const idxAdsDuration = getColIdx(["ads duration"]);
            const idxAdsCPRProfileVisit = getColIdx(["ads cpr profile visit"]);
            const idxAdsAudience = getColIdx(["ads audience"]);

            const parsedData = json.slice(1).filter(r => r.length > 0 && idxTitle !== -1 && String(r[idxTitle]||"").trim() !== "").map((row: any) => {
                const item = emptyItem(Number(row[idxYear])||2025, Number(row[idxMonth])||1, Number(row[idxDate])||1, pillars, platforms, pics, statuses, contentTypes);
                if (idxId !== -1 && row[idxId]) item.id = cleanStr(row[idxId]);
                item.title = cleanStr(row[idxTitle]);
                if (idxHour !== -1) item.uploadHour = Number(row[idxHour])||9;
                if (idxMin !== -1) item.uploadMinute = Number(row[idxMin])||0;
                if (idxPillar !== -1 && row[idxPillar]) item.pillar = findExactMatch(pillars, row[idxPillar]);
                if (idxPlatform !== -1 && row[idxPlatform]) item.platform = findExactMatch(platforms, row[idxPlatform]);
                if (idxContentType !== -1 && row[idxContentType]) item.contentType = findExactMatch(contentTypes, row[idxContentType]);
                if (idxPic !== -1 && row[idxPic]) item.pic = findExactMatch(pics, row[idxPic]);
                if (idxStatus !== -1 && row[idxStatus]) item.status = findExactMatch(statuses, row[idxStatus]);
                if (idxAds !== -1) item.isAds = String(row[idxAds]).toUpperCase() === "Y";
                
                item.metrics = {
                    views: idxViews !== -1 ? Number(row[idxViews])||0 : 0,
                    reach: idxReach !== -1 ? Number(row[idxReach])||0 : 0,
                    likes: idxLikes !== -1 ? Number(row[idxLikes])||0 : 0,
                    comments: idxComments !== -1 ? Number(row[idxComments])||0 : 0,
                    shares: idxShares !== -1 ? Number(row[idxShares])||0 : 0,
                    saves: idxSaves !== -1 ? Number(row[idxSaves])||0 : 0,
                    reposts: idxReposts !== -1 ? Number(row[idxReposts])||0 : 0,
                    profileVisits: idxProfileVisits !== -1 ? Number(row[idxProfileVisits])||0 : 0,
                    bioLinkTaps: idxBioLinkTaps !== -1 ? Number(row[idxBioLinkTaps])||0 : 0,
                    follows: idxFollows !== -1 ? Number(row[idxFollows])||0 : 0
                };
                item.adsMetrics = {
                    views: idxAdsViews !== -1 ? Number(row[idxAdsViews])||0 : 0,
                    reach: idxAdsReach !== -1 ? Number(row[idxAdsReach])||0 : 0,
                    likes: idxAdsLikes !== -1 ? Number(row[idxAdsLikes])||0 : 0,
                    comments: idxAdsComments !== -1 ? Number(row[idxAdsComments])||0 : 0,
                    shares: idxAdsShares !== -1 ? Number(row[idxAdsShares])||0 : 0,
                    saves: idxAdsSaves !== -1 ? Number(row[idxAdsSaves])||0 : 0,
                    reposts: idxAdsReposts !== -1 ? Number(row[idxAdsReposts])||0 : 0,
                    profileVisits: idxAdsProfileVisits !== -1 ? Number(row[idxAdsProfileVisits])||0 : 0,
                    bioLinkTaps: idxAdsBioLinkTaps !== -1 ? Number(row[idxAdsBioLinkTaps])||0 : 0,
                    follows: idxAdsFollows !== -1 ? Number(row[idxAdsFollows])||0 : 0,
                    clicks: idxAdsClicks !== -1 ? Number(row[idxAdsClicks])||0 : 0,
                    conversions: idxAdsConversions !== -1 ? Number(row[idxAdsConversions])||0 : 0,
                    msgConvStarted: idxAdsMsgConvStarted !== -1 ? Number(row[idxAdsMsgConvStarted])||0 : 0,
                    threeSecPlays: idxAds3sPlays !== -1 ? Number(row[idxAds3sPlays])||0 : 0,
                    spendBudget: idxAdsSpendBudget !== -1 ? Number(row[idxAdsSpendBudget])||0 : 0,
                    dailyBudget: idxAdsDailyBudget !== -1 ? Number(row[idxAdsDailyBudget])||0 : 0,
                    duration: idxAdsDuration !== -1 ? Number(row[idxAdsDuration])||0 : 0,
                    cprProfileVisit: idxAdsCPRProfileVisit !== -1 ? Number(row[idxAdsCPRProfileVisit])||0 : 0,
                    audience: idxAdsAudience !== -1 ? String(row[idxAdsAudience]||"") : ""
                };
                if (idxObjective !== -1) item.objective = textToHtml(cleanStr(row[idxObjective])) || "";
                if (idxHook !== -1) item.hook = textToHtml(cleanStr(row[idxHook])) || "";
                if (idxBrief !== -1) item.briefCopywriting = textToHtml(cleanStr(row[idxBrief])) || "";
                if (idxCta !== -1) item.cta = textToHtml(cleanStr(row[idxCta])) || "";
                if (idxRefText !== -1) item.referenceText = cleanStr(row[idxRefText]) || "";
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
                    });
        } catch (err) {
            setErrorMsg(lang === "id" ? "Gagal membaca file. Pastikan format CSV sesuai template." : "Failed to read file. Please make sure the CSV format matches the template.");
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
        <h2 style={{fontSize:20, fontWeight:700, margin:"0 0 16px", color:"#2C2016", display:"flex", alignItems:"center", gap:8}}><Upload size={20} /> {lang === "id" ? "Bulk Import via Excel / CSV" : "Bulk Import via Excel / CSV"}</h2>
        
        {step===1 && (
            <div>
                <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:16,lineHeight:1.5}}>
                    {lang === "id" 
                      ? "Gunakan template Excel kami untuk memastikan format data sesuai. Opsi dropdown sudah tersedia di dalam file! Anda dapat mengunggah ratusan konten sekaligus ke dalam kalender." 
                      : "Use our Excel template to ensure the correct data format. Dropdown options are already available inside the file! You can upload hundreds of content items at once to the calendar."}
                </p>
                <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
                    <button className="hover-scale" onClick={handleDownloadTemplate} style={{...B(false), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>
                        {lang === "id" ? "Download Template Excel" : "Download Excel Template"}
                    </button>
                    <label className="hover-scale btn-hover" style={{...B(true, "var(--theme-primary)"), flex: 1, padding:"8px 16px", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, height:48, cursor:"pointer"}}>
                        {lang === "id" ? "Pilih File Excel / CSV" : "Choose Excel / CSV File"}
                        <input type="file" accept=".csv, .xlsx" onChange={handleFile} ref={fileInputRef} style={{display:"none"}}/>
                    </label>
                </div>
                {errorMsg && <div style={{padding:"12px 16px",background:"rgba(156, 43, 78, 0.05)",color:"#9C2B4E",borderRadius:12,border:"1px solid rgba(156, 43, 78, 0.1)",fontSize:13,fontWeight:600}}>{errorMsg}</div>}
            </div>
        )}

        {step===2 && (
            <div>
                <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:16, lineHeight:1.5}}>
                    {lang === "id" ? (
                      <>Berhasil membaca <strong>{dataPreview.length}</strong> baris data. Periksa kembali pratinjau data di bawah ini sebelum melanjutkan.</>
                    ) : (
                      <>Successfully read <strong>{dataPreview.length}</strong> rows of data. Please review the data preview below before continuing.</>
                    )}
                </p>
                <div style={{background:"rgba(44,32,22,0.02)",border:"1px solid rgba(44,32,22,0.06)",borderRadius:12,maxHeight:240,overflow:"auto",marginBottom:24}}>
                    <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                        <thead style={{background:"rgba(44,32,22,0.04)",position:"sticky",top:0,backdropFilter:"blur(4px)"}}>
                            <tr>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>{lang === "id" ? "Judul" : "Title"}</th>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>{lang === "id" ? "Tanggal" : "Date"}</th>
                                <th style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#2C2016",borderBottom:"1px solid rgba(44,32,22,0.06)"}}>{lang === "id" ? "Pillar / Platform" : "Pillar / Platform"}</th>
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
                                    <td colSpan={4} style={{padding:"12px",textAlign:"center",color:"rgba(44,32,22,0.4)",fontSize:12,fontWeight:600,fontStyle:"italic"}}>... {dataPreview.length - 10} {lang === "id" ? "baris lainnya" : "more rows"} ...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{display:"flex",gap:12}}>
                    <button className="hover-scale" onClick={redo} style={{...B(false), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>{lang === "id" ? "Ulangi" : "Retry"}</button>
                    <button className="hover-scale btn-hover" onClick={handleImportClick} style={{...B(true, "var(--theme-primary)"), flex: 1, padding:"8px 16px", borderRadius:24, fontSize:14, height:48}}>{lang === "id" ? "Mulai Import" : "Start Import"}</button>
                </div>
            </div>
        )}

        {showConfirm && (
          <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:24,zIndex:100,padding:24}}>
            <div style={{...CARD({width:"100%", maxWidth:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.15)", textAlign:"center"})}}>
              <h3 style={{fontSize:20,color:"#9C2B4E",fontWeight:700,marginBottom:16}}>{lang === "id" ? "Data duplikat terdeteksi" : "Duplicate data detected"}</h3>
              <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:24,lineHeight:1.5}}>
                {lang === "id" 
                  ? "Beberapa konten memiliki judul dan tanggal yang sama dengan data yang sudah ada. Bagaimana memprosesnya?" 
                  : "Some content items have the same title and date as existing data. How do you want to handle them?"}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <button className="hover-scale btn-hover" onClick={()=>{
                  const filtered = dataPreview.filter(d => !existingContent?.some((ec:any) => ec.id !== d.id && ec.title === d.title && ec.year === d.year && ec.month === d.month && ec.day === d.day));
                  onImport(filtered);
                  onClose();
                }} style={{...B(true, "var(--theme-primary)"), width:"100%", height:48, fontSize:14, borderRadius:24}}>{lang === "id" ? "Hanya Baru (Abaikan Duplikat)" : "New Only (Ignore Duplicates)"}</button>
                
                <button className="hover-scale btn-hover" onClick={()=>{onImport(dataPreview); onClose();}} style={{...B(true, "#9C2B4E"), width:"100%", height:48, fontSize:14, borderRadius:24}}>{lang === "id" ? "Timpa / Tetap Impor" : "Overwrite / Import Anyway"}</button>
                
                <button className="hover-scale" onClick={()=>setShowConfirm(false)} style={{...B(false), width:"100%", height:48, fontSize:14, borderRadius:24}}>{lang === "id" ? "Batal" : "Cancel"}</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

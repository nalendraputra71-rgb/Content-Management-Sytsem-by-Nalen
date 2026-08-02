import React from "react";
import { useI18n } from "../../i18n";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { SocialThumbnail } from "./analyticsHelpers";
import { PBadge, gps } from "../../data";

export const MCard = ({
  label,
  val,
  sub,
  colorTheme = "glass",
  pctStr,
  icon: Icon,
  getPeriodText
}: {
  label: string;
  val: any;
  sub?: string;
  colorTheme?: string;
  pctStr?: string | null;
  icon?: any;
  getPeriodText?: () => string;
}) => {
  const themeStyles: Record<string, {bg: string, border: string, text: string, subText: string, iconBg: string, iconColor: string}> = {
    glass: { bg: "bg-white", border: "border-black/[0.03]", text: "text-gray-900", subText: "text-gray-500", iconBg: "bg-gray-100", iconColor: "text-gray-700" },
    blue: { bg: "bg-blue-50/40", border: "border-blue-100", text: "text-gray-900", subText: "text-blue-600 font-semibold", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    amber: { bg: "bg-amber-50/40", border: "border-amber-100", text: "text-gray-900", subText: "text-amber-700 font-semibold", iconBg: "bg-amber-100", iconColor: "text-amber-700" },
    purple: { bg: "bg-purple-50/40", border: "border-purple-100", text: "text-gray-900", subText: "text-purple-600 font-semibold", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    emerald: { bg: "bg-emerald-50/40", border: "border-emerald-100", text: "text-gray-900", subText: "text-emerald-700 font-semibold", iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
    rose: { bg: "bg-rose-50/40", border: "border-rose-100", text: "text-gray-900", subText: "text-rose-600 font-semibold", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
    cyan: { bg: "bg-cyan-50/40", border: "border-cyan-100", text: "text-gray-900", subText: "text-cyan-700 font-semibold", iconBg: "bg-cyan-100", iconColor: "text-cyan-700" }
  };
  
  const theme = themeStyles[colorTheme] || themeStyles.glass;
  
  return (
    <motion.div whileHover={{ y: -2 }} className={`flex-1 min-w-0 flex flex-col justify-between h-full p-5 rounded-2xl border ${theme.border} shadow-sm overflow-visible break-words transition-shadow hover:shadow-md ${theme.bg}`}>
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <div className={`${theme.iconBg} p-1.5 rounded-lg shrink-0`}><Icon size={16} className={theme.iconColor} /></div>}
          <div className={`text-[11px] font-bold tracking-wide uppercase leading-snug ${theme.subText}`}>{label}</div>
        </div>
        {pctStr && (
          <div className="flex flex-col items-end shrink-0">
            <div className={`text-[10px] font-bold px-1.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-0.5 ${pctStr.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : pctStr.startsWith('-') ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
              {pctStr.startsWith('+') ? <ArrowUpRight size={10}/> : pctStr.startsWith('-') ? <ArrowDownRight size={10}/> : null}
              {pctStr}
            </div>
            {getPeriodText && getPeriodText() && <div className="text-[9px] mt-1 font-semibold whitespace-nowrap text-gray-400">{getPeriodText()}</div>}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-extrabold leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${theme.text}`} title={String(val)}>{val}</div>
        {sub && <div className="text-[11px] mt-1.5 font-medium leading-snug text-gray-500">{sub}</div>}
      </div>
    </motion.div>
  );
};

export const CDataList = ({
  title,
  list,
  rank = 1,
  pillars,
  platforms,
  openEdit,
  fmt,
  getV,
  getR,
  getEng,
  topSort
}: {
  title: string;
  list: any[];
  rank?: number;
  pillars: any[];
  platforms: any[];
  openEdit: (item: any) => void;
  fmt: (v: number) => string;
  getV: (c: any) => number;
  getR: (c: any) => number;
  getEng: (c: any) => number;
  topSort: string;
}) => {
  const { lang } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h4 className="text-sm md:text-base font-bold text-gray-900 m-0 tracking-tight">{title}</h4>
      </div>
      {list.length===0 && <p className="text-xs md:text-sm text-gray-500 text-center py-5">{lang === "id" ? "Data tidak tersedia untuk filter saat ini." : "No data available for the current filters."}</p>}
      <div className="flex flex-col gap-2 md:gap-2.5">
        {list.map((item:any, i:number)=>{
          const e=getEng(item), ps=gps(pillars, item.pillar);
          return (
            <motion.div whileHover={{ scale: 1.01 }} key={item.id} className={`flex items-start gap-2.5 md:gap-3 p-2 md:p-3 rounded-xl transition-all duration-200 ${i===0&&rank===1 ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-black/5"}`}>
              {rank===1 && (
                <div className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[10px] md:text-xs font-bold rounded-full shrink-0 border-2 border-white shadow-sm ${i===0?"text-amber-600 bg-amber-200":i===1?"text-gray-400 bg-gray-100":"text-gray-300 bg-white"}`}>{i+1}</div>
              )}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-black/10">
                {item.referenceImage ? (
                  <img src={item.referenceImage} alt="thumb" className="w-full h-full object-cover" />
                ) : item.linkSosmed ? (
                  <SocialThumbnail url={item.linkSosmed} fallback={<div className="text-sm md:text-xl">{item.platform?.toLowerCase()?.includes('instagram') ? '📸' : item.platform?.toLowerCase()?.includes('tiktok') ? '🎵' : '🔗'}</div>} />
                ) : (
                  <div className="text-[8px] md:text-[9px] text-gray-400 text-center leading-tight flex items-center justify-center h-full font-semibold">NO<br/>IMG</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 text-gray-900 mb-0.5 md:mb-1">
                  <span onClick={()=>openEdit(item)} className="cursor-pointer truncate" title={lang === "id" ? "Buka Detail Brief" : "Open Brief Detail"}>{item.title||(lang === "id" ? "(Tanpa judul)" : "(No title)")}</span>
                  {item.linkSosmed && <a href={item.linkSosmed} target="_blank" rel="noreferrer" className="no-underline text-xs md:text-sm" title={lang === "id" ? "Buka Postingan" : "Open Post"}>🔗</a>}
                  {item.linkUpload && <a href={item.linkUpload} target="_blank" rel="noreferrer" className="no-underline text-xs md:text-sm" title={lang === "id" ? "Akses Upload/Aset" : "Access Upload/Asset"}>📤</a>}
                </div>
                <div className="flex gap-1 md:gap-1.5 flex-wrap items-center">
                  <PBadge name={item.platform} platforms={platforms}/>
                  <span style={{background:ps.light||"#F3F4F6",color:ps.color||"#111827"}} className="text-[8px] md:text-[10px] font-semibold px-1.5 md:px-2 py-0.5 rounded-full">{item.pillar}</span>
                  {item.isAds&&<span className="text-[8px] md:text-[10px] text-pink-500 font-bold bg-pink-50 px-1.5 md:px-2 py-0.5 rounded-full">💰 Ads</span>}
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col justify-center">
                <div className="text-sm md:text-lg font-bold text-gray-900 tracking-tight">{fmt(topSort==="engagement"?e:topSort==="reach"?getR(item):getV(item))}</div>
                <div className="text-[8px] md:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{topSort}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

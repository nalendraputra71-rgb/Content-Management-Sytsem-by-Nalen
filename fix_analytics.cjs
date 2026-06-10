const fs = require('fs');

let content = fs.readFileSync('src/AnalyticsView.tsx', 'utf-8');

// 1. Remove background: "#FDFDFD" from root div
content = content.replace(/background:\s*"#FDFDFD"/g, 'background: "transparent"');

// 2. The sticky header uses bg-[#FDFDFD]
content = content.replace(/bg-\[#FDFDFD\]/g, 'bg-transparent');

content = content.replace(/bg-white rounded-xl shadow-2xl/g, 'bg-white/70 backdrop-blur-md rounded-2xl shadow-xl');
content = content.replace(/bg-white px-3/g, 'bg-white/50 backdrop-blur-md border hover:bg-white/70 px-3');

// 3. For any card using style={{...CARD({background: "white", padding: "20px", ...boxShadow...})}}
// We replace it with the glassmorphism
const glassStyle = `{background: "rgba(255,255,255,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)"`;

content = content.replace(/\{\.\.\.CARD\(\{background: "white", padding: "20px", borderRadius: 16, border: "1px solid rgba\(0,0,0,0\.06\)", boxShadow: "0 4px 20px rgba\(0,0,0,0\.02\)", display: "flex", flexDirection: "column"\}\)\}/g, glassStyle + ', display: "flex", flexDirection: "column"}');

content = content.replace(/\{\.\.\.CARD\(\{background: "white", padding: "20px", borderRadius: 16, border: "1px solid rgba\(0,0,0,0\.06\)", boxShadow: "0 4px 20px rgba\(0,0,0,0\.02\)", width: "100%", overflow: "hidden"\}\)\}/g, glassStyle + ', width: "100%", overflow: "hidden"}');

// 4. Update individual card backgrounds in other places.
// For the 3 quick overview cards:
// The code is something like: <div style={{background:"white",padding:"20px",borderRadius:16,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.02)",display:"flex",flexDirection:"column",gap:16}}>
const overviewCardPattern = /background:"white",padding:"20px",borderRadius:16,border:"1px solid rgba\(0,0,0,0\.04\)",boxShadow:"0 10px 30px rgba\(0,0,0,0\.02\)"/g;
content = content.replace(overviewCardPattern, 'background: "rgba(255,255,255,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", transform: "translateZ(0)", willChange: "transform", padding:"20px", borderRadius:24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)"');

// For the active metrics filter row
const filterRowPattern = /background:"white",padding:"16px 20px",borderRadius:16,border:"1px solid rgba\(0,0,0,0\.06\)",boxShadow:"0 2px 10px rgba\(0,0,0,0\.02\)"/g;
content = content.replace(filterRowPattern, 'background: "rgba(255,255,255,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", transform: "translateZ(0)", willChange: "transform", padding:"16px 20px", borderRadius:24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)"');

// AI Insight card
const insightCardPattern = /background:"white",border:"1px solid #E5E7EB",borderRadius:16,padding:20,boxShadow:"0 10px 30px rgba\(0,0,0,0\.02\)"/g;
content = content.replace(insightCardPattern, 'background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", transform: "translateZ(0)", willChange: "transform", border:"1px solid rgba(255,255,255,0.8)", borderRadius:24, padding:20, boxShadow:"0 8px 32px rgba(0,0,0,0.05)"');

const ttvard = /background:"white",padding:"24px 32px",borderRadius:20,boxShadow:"0 20px 60px rgba\(0,0,0,0\.08\)",textAlign:"center",maxWidth:400, border: "1px solid rgba\(0,0,0,0\.08\)"/g;
content = content.replace(ttvard, 'background:"rgba(255,255,255,0.65)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",transform:"translateZ(0)",willChange:"transform",padding:"24px 32px",borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.08)",textAlign:"center",maxWidth:400,border:"1px solid rgba(255,255,255,0.7)"');

fs.writeFileSync('src/AnalyticsView.tsx', content);

console.log("AnalyticsView modified");

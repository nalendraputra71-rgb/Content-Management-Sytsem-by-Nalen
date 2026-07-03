const fs = require('fs');

// Patch SharedFooter.tsx
let shared = fs.readFileSync('src/SharedFooter.tsx', 'utf8');
const flameRegexShared = /<div className="w-9 h-9 bg-gradient-to-br from-\[#0B2A4A\] to-\[#1D4D7A\] rounded-xl flex items-center justify-center shadow-lg shadow-\[#1D4D7A\]\/20">\s*<Flame size=\{20\} className="text-white" \/>\s*<\/div>/g;

const imgStr = `<div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-[#1D4D7A]/20 bg-white p-0.5">
        <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
      </div>`;

shared = shared.replace(flameRegexShared, imgStr);
fs.writeFileSync('src/SharedFooter.tsx', shared);

// Patch Nav.tsx
let nav = fs.readFileSync('src/Nav.tsx', 'utf8');
const flameRegexNav = /<div style=\{\{ width: 40, height: 40, background: "rgba\(255,255,255,0\.1\)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 \}\}>\s*<Flame size=\{24\} color="#3B82F6" \/>\s*<\/div>/g;

const navImgStr = `<div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", background: "white", padding: 2 }}>
          <img src="/icon.png" alt="Hubify Social" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
        </div>`;

nav = nav.replace(flameRegexNav, navImgStr);
fs.writeFileSync('src/Nav.tsx', nav);

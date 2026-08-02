const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

const replacement = `        {(!hasCapability('analytics')) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 rounded-[20px]">
            <div className="bg-white/80 p-6 md:p-8 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] text-center max-w-[400px] border border-white/70">
              <AlertCircle size={40} className="text-blue-500 mx-auto mb-3" />
              <h3 className="text-[18px] font-bold mb-2 text-gray-900 tracking-tight">{lang === 'id' ? 'Akses Analitik Terkunci' : 'Analytics Access Locked'}</h3>
              <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">{lang === 'id' ? 'Upgrade ke paket yang lebih tinggi untuk membuka fitur Analitik Performa dan pantau kesuksesan konten Anda.' : 'Upgrade your plan to unlock Performance Analytics and track your content success.'}</p>
              <button className="hover-scale w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-[14px] border-none cursor-pointer shadow-[0_4px_14px_rgba(59,130,246,0.4)]" onClick={()=>window.location.href="/billing"}>{lang === 'id' ? 'Upgrade Sekarang' : 'Upgrade Now'}</button>
            </div>
          </div>
        )}
        <div className={\`flex flex-col gap-6 \${!hasCapability('analytics') ? "blur-[8px] pointer-events-none select-none" : ""}\`}>`;

code = code.replace(/        \{\(\!hasCapability\('heatmaps'\) \|\| \!hasCapability\('topBadAnalysis'\) \|\| \!hasCapability\('platformAnalytics'\)\) && \(\n          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white\/40 rounded-\[20px\]">\n            <div className="bg-white\/80 p-6 md:p-8 rounded-\[24px\] shadow-\[0_20px_60px_rgba\(0,0,0,0\.08\)\] text-center max-w-\[400px\] border border-white\/70">\n              <AlertCircle size=\{40\} className="text-blue-500 mx-auto mb-3" \/>\n              <h3 className="text-\[18px\] font-bold mb-2 text-gray-900 tracking-tight">\{lang === 'id' \? 'Akses Analitik Premium' : 'Premium Analytics Access'\}<\/h3>\n              <p className="text-\[13px\] text-gray-600 mb-5 leading-relaxed">\{lang === 'id' \? 'Upgrade ke paket yang lebih tinggi untuk membuka analitik premium, AI Insights mendalam, heatmap performa, dan integrasi multi-platform\.' : 'Upgrade your plan to unlock premium analytics, deep AI Insights, performance heatmaps, and multi-platform integration\.'\}<\/p>\n              <button className="hover-scale w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-\[14px\] border-none cursor-pointer shadow-\[0_4px_14px_rgba\(59,130,246,0\.4\)\]" onClick=\{\(\)=>window\.location\.href="\/billing"\}>\{lang === 'id' \? 'Upgrade Sekarang' : 'Upgrade Now'\}<\/button>\n            <\/div>\n          <\/div>\n        \)\}\n        <div className=\{\`flex flex-col gap-6 \$\{isRestricted \? "blur-\[8px\] pointer-events-none select-none" : ""\}\`\}>/, replacement);

fs.writeFileSync('src/AnalyticsView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  `              {/* KONEKSI PLATFORM - Minimalist Pills */}
              <div className="flex flex-col gap-3 mb-8">`,
  `              {metaApiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-red-800 text-sm">Meta API Error</span>
                    <span className="text-red-600 text-sm leading-relaxed">{metaApiError}</span>
                  </div>
                </div>
              )}

              {/* KONEKSI PLATFORM - Minimalist Pills */}
              <div className="flex flex-col gap-3 mb-8">`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);

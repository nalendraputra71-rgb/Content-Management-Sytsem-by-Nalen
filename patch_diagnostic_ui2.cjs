const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const diagnosticUI = `
                </div>
              </div>

              {/* CONNECTION DIAGNOSTICS */}
              <div className="flex flex-col gap-3 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#111827] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDiagnosing ? "animate-spin text-blue-600" : "text-blue-600"}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                      System Connection Diagnostic
                    </span>
                    <span className="text-xs text-[#111827]/60">Cek apakah token akses sosial media Anda masih valid atau sudah expired</span>
                  </div>
                  <button
                    onClick={runDiagnostic}
                    disabled={isDiagnosing}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isDiagnosing ? "Memeriksa..." : "Test Koneksi"}
                  </button>
                </div>
                
                {Object.keys(diagnosticResult).length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {Object.entries(diagnosticResult).map(([plat, res]: [string, any]) => (
                      <div key={plat} className={\`text-xs p-3 rounded-lg border \${res.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}\`}>
                        <span className="font-bold capitalize">{plat === 'all' ? 'System' : plat}: </span>
                        <span>{res.message}</span>
                        {res.status === 'error' && res.message.includes('token') && (
                          <div className="mt-2 font-semibold text-red-900 bg-red-100/50 p-2 rounded-md">
                            💡 Solusi: Token otorisasi sudah kadaluarsa (expired) atau tidak valid. Silakan klik icon {plat} di atas untuk "Disconnect", lalu klik lagi untuk "Connect" ulang agar mendapatkan token yang baru.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
`;

code = code.replace(
  /<div className="flex flex-col gap-3 mb-8 bg-blue-50\/50 p-5 rounded-2xl border border-blue-100">[\s\S]*?<\/div>\n              <\/div>/,
  diagnosticUI.trim()
);

fs.writeFileSync('src/SocialStudioView.tsx', code);

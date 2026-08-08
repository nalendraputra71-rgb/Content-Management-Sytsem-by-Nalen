const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const startIdx = code.indexOf('{/* AI Quota Card */}');
const endIdx = code.indexOf('{/* Asset Storage Card */}');

if (startIdx !== -1 && endIdx !== -1) {
    const newUI = `{/* Usage Limits Card */}
                      <div className="bg-black/[0.01] border border-black/[0.02] p-5 rounded-3xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-xl font-medium text-neutral-900">
                              {lang === "id" ? "Batas Penggunaan" : "Usage limits"}
                            </h4>
                            <span className="px-2 py-0.5 rounded bg-neutral-200 text-[10px] font-bold text-neutral-600 uppercase">
                              {planDetails?.name || (lang === "id" ? "GRATIS" : "FREE")}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                            {lang === "id"
                              ? "Batas paket Anda menentukan seberapa banyak Anda dapat menggunakan Hub.AI. Model dan fitur tingkat lanjut dapat menggunakan lebih banyak kuota."
                              : "Your plan's limits determine how much you can use Hub.AI over time. Advanced models and features can take up more usage."}
                          </p>
                      
                          <div className="flex flex-col gap-3">
                            {/* Daily Usage Card */}
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-neutral-900">
                                  {lang === "id" ? "Penggunaan hari ini" : "Current usage"}
                                </span>
                                <span className="text-sm font-bold text-neutral-900">
                                  {(() => {
                                    const maxReq = planDetails?.aiTokenLimitDaily || 50;
                                    if (maxReq === -1) return \`0% \${lang === "id" ? "digunakan" : "used"}\`;
                                    const todayStr = new Date().toISOString().split("T")[0];
                                    const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                    const usedPercent = Math.min((usedReq / maxReq) * 100, 100);
                                    return \`\${Math.round(usedPercent)}% \${lang === "id" ? "digunakan" : "used"}\`;
                                  })()}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                                {(() => {
                                  const maxReq = planDetails?.aiTokenLimitDaily || 50;
                                  const todayStr = new Date().toISOString().split("T")[0];
                                  const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                  const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                                  return <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: \`\${usedPercent}%\` }} />;
                                })()}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {lang === "id" ? "Direset pada 00:00" : "Resets at 12:00 AM"}
                              </div>
                            </div>
                      
                            {/* Monthly Limit Card */}
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-neutral-900">
                                  {lang === "id" ? "Batas bulanan" : "Monthly limit"}
                                </span>
                                <span className="text-sm font-bold text-neutral-900">
                                  {(() => {
                                    const maxReq = planDetails?.aiTokenLimit || 1000;
                                    if (maxReq === -1) return \`0% \${lang === "id" ? "digunakan" : "used"}\`;
                                    const currentMonth = new Date().toISOString().substring(0, 7);
                                    const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                                    const usedPercent = Math.min((usedReq / maxReq) * 100, 100);
                                    return \`\${Math.round(usedPercent)}% \${lang === "id" ? "digunakan" : "used"}\`;
                                  })()}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                                {(() => {
                                  const maxReq = planDetails?.aiTokenLimit || 1000;
                                  const currentMonth = new Date().toISOString().substring(0, 7);
                                  const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                                  const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                                  return <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: \`\${usedPercent}%\` }} />;
                                })()}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {(() => {
                                   const now = new Date();
                                   const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                                   return (lang === "id" ? "Direset pada " : "Resets ") + nextMonth.toLocaleDateString(lang === "id" ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      `;

    code = code.substring(0, startIdx) + newUI + code.substring(endIdx);
    fs.writeFileSync('src/SettingsPanel.tsx', code);
    console.log('SettingsPanel.tsx updated');
} else {
    console.log('Could not find target strings');
}

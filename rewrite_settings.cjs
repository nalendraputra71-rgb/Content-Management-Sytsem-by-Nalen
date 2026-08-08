const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const target1 = `<div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase">
                              {lang === "id" ? "Penggunaan Hari Ini" : "Used Today"}
                            </span>
                            <span className="text-sm font-black text-neutral-900">
                              {(() => {
                                const maxReq = planDetails?.aiTokenLimit || 50;
                                const todayStr = new Date().toISOString().split("T")[0];
                                const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                const formattedUsed = typeof usedReq === 'number' ? usedReq.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedReq;
                                return \`\${formattedUsed} / \${maxReq}\`;
                              })()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                            {(() => {
                              const maxReq = planDetails?.aiTokenLimit || 50;
                              const todayStr = new Date().toISOString().split("T")[0];
                              const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                              const usedPercent = Math.min((usedReq / maxReq) * 100, 100);
                              return <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: \`\${usedPercent}%\` }} />;
                            })()}
                          </div>`;

const replacement1 = `<div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase">
                              {lang === "id" ? "Penggunaan Hari Ini" : "Used Today"}
                            </span>
                            <span className="text-sm font-black text-neutral-900">
                              {(() => {
                                const maxReq = planDetails?.aiTokenLimitDaily || 50;
                                const todayStr = new Date().toISOString().split("T")[0];
                                const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                const formattedUsed = typeof usedReq === 'number' ? usedReq.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedReq;
                                return \`\${formattedUsed} / \${maxReq === -1 ? '∞' : maxReq}\`;
                              })()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden mb-4">
                            {(() => {
                              const maxReq = planDetails?.aiTokenLimitDaily || 50;
                              const todayStr = new Date().toISOString().split("T")[0];
                              const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                              const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                              return <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: \`\${usedPercent}%\` }} />;
                            })()}
                          </div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase">
                              {lang === "id" ? "Penggunaan Bulan Ini" : "Used This Month"}
                            </span>
                            <span className="text-sm font-black text-neutral-900">
                              {(() => {
                                const maxReq = planDetails?.aiTokenLimit || 1000;
                                const currentMonth = new Date().toISOString().substring(0, 7);
                                const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                                const formattedUsed = typeof usedReq === 'number' ? usedReq.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedReq;
                                return \`\${formattedUsed} / \${maxReq === -1 ? '∞' : maxReq}\`;
                              })()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                            {(() => {
                              const maxReq = planDetails?.aiTokenLimit || 1000;
                              const currentMonth = new Date().toISOString().substring(0, 7);
                              const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                              const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                              return <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: \`\${usedPercent}%\` }} />;
                            })()}
                          </div>`;

code = code.replace(target1, replacement1);
fs.writeFileSync('src/SettingsPanel.tsx', code);

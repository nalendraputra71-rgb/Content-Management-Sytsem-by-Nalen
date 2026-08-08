const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

const target1 = `                      {(() => {
                        const isSuperAdmin =
                          profile?.role === "admin" ||
                          user?.email?.toLowerCase() ===
                            "nalendraputra71@gmail.com";
                        if (isSuperAdmin) return "Unlimited";
                        const maxReq = planDetails?.aiTokenLimit || 50;
                        const todayStr = new Date().toISOString().split("T")[0];
                        const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                        const formattedUsed = typeof usedReq === 'number' ? usedReq.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedReq;
                        if (maxReq === -1) return \`\${formattedUsed} / ∞\`;
                        return \`\${formattedUsed} / \${maxReq.toLocaleString()}\`;
                      })()}
                    </span>
                  </div>`;
const replacement1 = `                      {(() => {
                        const isSuperAdmin =
                          profile?.role === "admin" ||
                          user?.email?.toLowerCase() ===
                            "nalendraputra71@gmail.com";
                        if (isSuperAdmin) return "Unlimited";
                        const maxDaily = planDetails?.aiTokenLimitDaily || 50;
                        const maxMonthly = planDetails?.aiTokenLimit || 50;
                        const todayStr = new Date().toISOString().split("T")[0];
                        const currentMonth = new Date().toISOString().substring(0, 7);
                        const usedDaily = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                        const usedMonthly = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                        const formattedDaily = typeof usedDaily === 'number' ? usedDaily.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedDaily;
                        const formattedMonthly = typeof usedMonthly === 'number' ? usedMonthly.toLocaleString(undefined, {maximumFractionDigits: 1}) : usedMonthly;
                        const dailyStr = maxDaily === -1 ? \`Harian: \${formattedDaily}/∞\` : \`Harian: \${formattedDaily}/\${maxDaily.toLocaleString()}\`;
                        const monthlyStr = maxMonthly === -1 ? \`Bulan ini: \${formattedMonthly}/∞\` : \`Bulan ini: \${formattedMonthly}/\${maxMonthly.toLocaleString()}\`;
                        return (
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                             <span>{dailyStr}</span>
                             <span style={{ fontSize: 10, color: "rgba(25,53,70,0.5)" }}>{monthlyStr}</span>
                           </div>
                        );
                      })()}
                    </span>
                  </div>`;
                  
const target2 = `                      const maxReq = planDetails?.aiTokenLimit || 50;
                      const todayStr = new Date().toISOString().split("T")[0];
                      const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                      const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);`;
const replacement2 = `                      const maxReq = planDetails?.aiTokenLimitDaily || 50;
                      const todayStr = new Date().toISOString().split("T")[0];
                      const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                      const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('src/HubAiTab.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const targetStrDaily = `                                  const todayStr = new Date().toISOString().split("T")[0];
                                  const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;`;

const newCodeDaily = `                                  const now = new Date();
                                  const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                                  const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;`;

const targetStrMonthly = `                                  const currentMonth = new Date().toISOString().substring(0, 7);
                                  const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;`;

const newCodeMonthly = `                                  const now = new Date();
                                  let resetDay = 1;
                                  if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                                  else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                                  let cycleStartMonth = now.getMonth();
                                  let cycleStartYear = now.getFullYear();
                                  if (now.getDate() < resetDay) {
                                      cycleStartMonth -= 1;
                                      if (cycleStartMonth < 0) { cycleStartMonth = 11; cycleStartYear -= 1; }
                                  }
                                  const actualResetDay = Math.min(resetDay, new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate());
                                  const currentMonth = \`\${cycleStartYear}-\${String(cycleStartMonth + 1).padStart(2, '0')}-\${String(actualResetDay).padStart(2, '0')}\`;
                                  const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;`;

// Replace all occurrences
code = code.split(targetStrDaily).join(newCodeDaily);
code = code.split(targetStrMonthly).join(newCodeMonthly);

// We also need to fix the display text for "Direset pada 12:00 AM" to use the right language
// And the Monthly reset date text

const oldResetMonthlyStr = `                                   const now = new Date();
                                   const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                                   return (lang === "id" ? "Direset pada " : "Resets ") + nextMonth.toLocaleDateString(lang === "id" ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });`;

const newResetMonthlyStr = `                                   const now = new Date();
                                   let resetDay = 1;
                                   if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                                   else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                                   let nextResetMonth = now.getMonth();
                                   let nextResetYear = now.getFullYear();
                                   if (now.getDate() >= resetDay) {
                                       nextResetMonth += 1;
                                       if (nextResetMonth > 11) { nextResetMonth = 0; nextResetYear += 1; }
                                   }
                                   const maxDays = new Date(nextResetYear, nextResetMonth + 1, 0).getDate();
                                   const actualResetDay = Math.min(resetDay, maxDays);
                                   const nextMonth = new Date(nextResetYear, nextResetMonth, actualResetDay);
                                   return (lang === "id" ? "Direset pada " : "Resets ") + nextMonth.toLocaleDateString(lang === "id" ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });`;

code = code.replace(oldResetMonthlyStr, newResetMonthlyStr);

fs.writeFileSync('src/SettingsPanel.tsx', code);
console.log('SettingsPanel.tsx updated');

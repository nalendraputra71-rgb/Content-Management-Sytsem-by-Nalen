const fs = require('fs');

// Patch SettingsPanel.tsx
let settingsCode = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const oldSettings1 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                  : profile?.plan === "vip"
                  ? "VIP"
                  : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                  ? "PRO"
                  : profile?.plan === "trial"
                  ? "TRIAL"
                  : "FREE"}`;

const newSettings1 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                  : profile?.plan ? profile.plan.toUpperCase() : "FREE"}`;

settingsCode = settingsCode.replace(oldSettings1, newSettings1);

const oldSettings2 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                              : profile?.plan === "vip"
                              ? "VIP"
                              : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                              ? "PRO"
                              : profile?.plan === "trial"
                              ? "TRIAL"
                              : "FREE"}`;

const newSettings2 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                              : profile?.plan ? profile.plan.toUpperCase() : "FREE"}`;

settingsCode = settingsCode.replace(oldSettings2, newSettings2);
fs.writeFileSync('src/SettingsPanel.tsx', settingsCode);


// Patch Nav.tsx
let navCode = fs.readFileSync('src/Nav.tsx', 'utf8');

const oldNavLogic = `{(() => {
                              if (profile?.plan === "vip") return "VIP";
                              if (planDetails?.name) {
                                let name = planDetails.name;
                                name = name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, ''); // remove (Annual), (Monthly), etc.
                                name = name.replace(/\\s*-\\s*(annual|monthly|tahunan|bulanan)/gi, '');
                                name = name.replace(/\\s+plan/gi, ''); // remove the word 'Plan'
                                return name.trim().toUpperCase();
                              }
                              if (profile?.plan === "trial") return "TRIAL";
                              return profile?.activeUntil && new Date(profile.activeUntil) > new Date() ? "PRO" : "FREE";
                            })()}`;

const newNavLogic = `{(() => {
                              if (planDetails?.name) {
                                let name = planDetails.name;
                                name = name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '');
                                name = name.replace(/\\s*-\\s*(annual|monthly|tahunan|bulanan)/gi, '');
                                name = name.replace(/\\s+plan/gi, '');
                                return name.trim().toUpperCase();
                              }
                              return profile?.plan ? profile.plan.toUpperCase() : "FREE";
                            })()}`;

navCode = navCode.replace(oldNavLogic, newNavLogic);

fs.writeFileSync('src/Nav.tsx', navCode);

console.log("Patched successfully!");

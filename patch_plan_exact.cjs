const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const target1 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim()
                  : profile?.plan === "vip"
                  ? "VIP Pass"
                  : profile?.activeUntil && new Date(profile.activeUntil) > new Date()
                  ? "PRO Member"
                  : "FREE Account"}`;

const replacement1 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                  : profile?.plan === "vip"
                  ? "VIP"
                  : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                  ? "PRO"
                  : profile?.plan === "trial"
                  ? "TRIAL"
                  : "FREE"}`;

code = code.replace(target1, replacement1);

const target2 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim()
                              : profile?.plan === "vip"
                              ? "VIP Lifetime"
                              : profile?.activeUntil && new Date(profile.activeUntil) > new Date()
                              ? "Premium PRO"
                              : "Free Account"}`;

const replacement2 = `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                              : profile?.plan === "vip"
                              ? "VIP"
                              : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                              ? "PRO"
                              : profile?.plan === "trial"
                              ? "TRIAL"
                              : "FREE"}`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/SettingsPanel.tsx', code);

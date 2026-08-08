const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

code = code.replace(
  /\{planDetails\?\.name \? planDetails\.name\.replace\(\/\\s\*\\(\?\(\?:annual\|monthly\|tahunan\|bulanan\)\\)\?\/\+?gi, ''\)\.replace\(\/\\s\+plan\/gi, ''\)\.trim\(\)\s*: profile\?\.plan === "vip"\s*\? "VIP Pass"\s*: profile\?\.activeUntil && new Date\(profile\.activeUntil\) > new Date\(\)\s*\? "PRO Member"\s*: "FREE Account"\}/g,
  `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                  : profile?.plan === "vip"
                  ? "VIP"
                  : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                  ? "PRO"
                  : profile?.plan === "trial"
                  ? "TRIAL"
                  : "FREE"}`
);

code = code.replace(
  /\{planDetails\?\.name \? planDetails\.name\.replace\(\/\\s\*\\(\?\(\?:annual\|monthly\|tahunan\|bulanan\)\\)\?\/\+?gi, ''\)\.replace\(\/\\s\+plan\/gi, ''\)\.trim\(\)\s*: profile\?\.plan === "vip"\s*\? "VIP Lifetime"\s*: profile\?\.activeUntil && new Date\(profile\.activeUntil\) > new Date\(\)\s*\? "Premium PRO"\s*: "Free Account"\}/g,
  `{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim().toUpperCase()
                              : profile?.plan === "vip"
                              ? "VIP"
                              : profile?.plan === "pro" || (profile?.activeUntil && new Date(profile.activeUntil) > new Date() && profile?.plan !== "trial")
                              ? "PRO"
                              : profile?.plan === "trial"
                              ? "TRIAL"
                              : "FREE"}`
);

fs.writeFileSync('src/SettingsPanel.tsx', code);

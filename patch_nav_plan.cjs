const fs = require('fs');
let code = fs.readFileSync('src/Nav.tsx', 'utf8');

const targetRegex = /<span\s+style={{[\s\S]*?background:[\s\S]*?profile\?\.plan === "vip"[\s\S]*?padding: "2px 4px",\s+borderRadius: 4,\s+fontSize: 8,\s+fontWeight: 800,\s+flexShrink: 0,\s+lineHeight: 1,\s+display: "inline-flex",\s+alignItems: "center",\s+gap: 3,\s+marginTop: 2,\s+}}\s+>\s+{profile\?\.plan === "vip" && <Crown size={9} \/>}\s+{profile\?\.plan === "vip"\s+\? "VIP"\s+: profile\?\.activeUntil &&\s+new Date\(profile\.activeUntil\) > new Date\(\)\s+\? "PRO"\s+: "FREE"}\s+<\/span>/g;

const newStr = `<span
                            style={{
                              background:
                                profile?.plan === "vip"
                                  ? "#FBC02D"
                                  : profile?.activeUntil &&
                                      new Date(profile.activeUntil) > new Date()
                                    ? "var(--theme-primary)"
                                    : "#9C2B4E",
                              color:
                                profile?.plan === "vip" ? "#2C2016" : "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              fontSize: 8,
                              fontWeight: 800,
                              flexShrink: 0,
                              lineHeight: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              marginTop: 2,
                            }}
                          >
                            {profile?.plan === "vip" && <Crown size={9} />}
                            {(() => {
                              if (profile?.plan === "vip") return "VIP";
                              if (planDetails?.name) {
                                let name = planDetails.name;
                                name = name.replace(/\\s*-\\s*(bulanan|tahunan|monthly|yearly)/i, '');
                                name = name.replace(/\\s+(bulanan|tahunan|monthly|yearly)/i, '');
                                return name.toUpperCase();
                              }
                              if (profile?.plan === "trial") return "TRIAL";
                              return profile?.activeUntil && new Date(profile.activeUntil) > new Date() ? "PRO" : "FREE";
                            })()}
                          </span>`;

const match = code.match(targetRegex);
if (match) {
  code = code.replace(targetRegex, newStr);
  fs.writeFileSync('src/Nav.tsx', code);
  console.log("Patched Nav.tsx successfully!");
} else {
  console.log("Target string not found!");
}

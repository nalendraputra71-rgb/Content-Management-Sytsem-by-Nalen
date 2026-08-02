const fs = require('fs');
let code = fs.readFileSync('src/components/ContentModalDesktopView.tsx', 'utf8');

const shareTabReplacement = `
                        onClick={() => {
                          if (ctx.hasCapability && !ctx.hasCapability('publicLink')) {
                            alert(ctx.lang === 'id' ? 'Upgrade paket untuk membagikan Tautan Publik.' : 'Upgrade plan to share Public Links.');
                            return;
                          }
                          ctx.setShareTab("public");
                        }}
`;

code = code.replace(/                        onClick=\{.*?setShareTab\("public"\)\}/, shareTabReplacement);

fs.writeFileSync('src/components/ContentModalDesktopView.tsx', code);

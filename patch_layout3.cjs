const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const targetRegex = /<span style={{ fontSize: 11, fontWeight: 700, color: "rgba\(44,32,22,0\.4\)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0\.5px" }}>\s*\{getFieldIcon\(icon, 14\)\} \{translatedLabel\}\s*\{renderSectionCommentBadge\(id\)\}\s*<\/span>\s*\{fieldValue && \(\s*<button/g;

const replacement = `<span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderSectionCommentBadge(id)}
              {fieldValue && (
                <button`;

content = content.replace(targetRegex, replacement);

const targetEndRegex = /<Copy size={11} style={{marginRight: 4}} \/> \{lang === "id" \? "Salin" : "Copy"\}<\/>\}\s*<\/button>\s*\)\}\s*<\/div>\s*<div style={{ fontSize: 13, color: "#2C2016"/g;

const replacementEnd = `<Copy size={11} style={{marginRight: 4}} /> {lang === "id" ? "Salin" : "Copy"}</>}
                </button>
              )}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#2C2016"`;

content = content.replace(targetEndRegex, replacementEnd);

fs.writeFileSync('src/ContentModal.tsx', content);

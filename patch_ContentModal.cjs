const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// Replace history display spans
const spanMobileRegex = /\{d\.history && d\.history\.length > 0 && \(\s*<span onClick=\{\(\) => setShowHistory\(true\)\} style=\{\{ fontSize: 10, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", maxWidth: 140, lineHeight: 1\.2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" \}\}>\s*\{lang === "id" \? "diedit terakhir oleh" : "last edited by"\} \{editorProfiles\[d\.history\[0\]\.editorId\]\?\.fullName \|\| editorProfiles\[d\.history\[0\]\.editorId\]\?\.nickname \|\| d\.history\[0\]\.editorName\} \{lang === "id" \? "pada" : "at"\} \{new Date\(d\.history\[0\]\.timestamp\)\.toLocaleTimeString\(lang === "id" \? "id-ID" : "en-US", \{ hour: "2-digit", minute: "2-digit" \}\)\}, \{new Date\(d\.history\[0\]\.timestamp\)\.toLocaleDateString\(lang === "id" \? "id-ID" : "en-US", \{ day: "numeric", month: "short", year: "numeric" \}\)\}\s*<\/span>\s*\)\}/;

const spanMobileReplacement = `{(d.lastEditedBy || (d.history && d.history.length > 0)) && (
                <span onClick={() => setShowHistory(true)} style={{ fontSize: 10, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", maxWidth: 140, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {d.lastEditorName || (d.history && d.history[0]?.editorName) || "User"} {lang === "id" ? "pada" : "at"} {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}`;

const spanDesktopRegex = /\{!isSaving && d\.history && d\.history\.length > 0 && \(\s*<span onClick=\{\(\) => setShowHistory\(true\)\} style=\{\{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", transition: "color 0\.2s" \}\} onMouseEnter=\{\(e\) => e\.currentTarget\.style\.color = "#3B82F6"\} onMouseLeave=\{\(e\) => e\.currentTarget\.style\.color = "#9CA3AF"\}>\s*\{lang === "id" \? "diedit terakhir oleh" : "last edited by"\} \{editorProfiles\[d\.history\[0\]\.editorId\]\?\.fullName \|\| editorProfiles\[d\.history\[0\]\.editorId\]\?\.nickname \|\| d\.history\[0\]\.editorName\} \{lang === "id" \? "pada" : "at"\} \{new Date\(d\.history\[0\]\.timestamp\)\.toLocaleTimeString\(lang === "id" \? "id-ID" : "en-US", \{ hour: "2-digit", minute: "2-digit" \}\)\}, \{new Date\(d\.history\[0\]\.timestamp\)\.toLocaleDateString\(lang === "id" \? "id-ID" : "en-US", \{ day: "numeric", month: "long", year: "numeric" \}\)\}\s*<\/span>\s*\)\}/;

const spanDesktopReplacement = `{!isSaving && (d.lastEditedBy || (d.history && d.history.length > 0)) && (
              <span onClick={() => setShowHistory(true)} style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#3B82F6"} onMouseLeave={(e) => e.currentTarget.style.color = "#9CA3AF"}>
                {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {d.lastEditorName || (d.history && d.history[0]?.editorName) || "User"} {lang === "id" ? "pada" : "at"} {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}`;

code = code.replace(spanMobileRegex, spanMobileReplacement);
code = code.replace(spanDesktopRegex, spanDesktopReplacement);

// Update HistoryView call
// Find <HistoryView ... editorProfiles={editorProfiles} />
code = code.replace(/<HistoryView([^>]*?)editorProfiles=\{editorProfiles\}\s*\/>/g, "<HistoryView$1 workspaceId={workspace?.id} editorProfiles={editorProfiles} />");

fs.writeFileSync('src/ContentModal.tsx', code);
console.log("ContentModal.tsx patched!");

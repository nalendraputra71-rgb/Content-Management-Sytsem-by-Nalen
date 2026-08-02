const fs = require('fs');
let content = fs.readFileSync('src/PublicBriefView.tsx', 'utf8');

const target1 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    const count = comments.filter(c => c.sectionId === sectionKey && !c.resolved).length;`;
const replacement1 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    if (!canComment) return null;
    const count = comments.filter(c => c.sectionId === sectionKey && !c.resolved).length;`;
content = content.replace(target1, replacement1);

const target2 = `  const renderInlineCommentThread = (sectionKey: string) => {
    const sectionComments = comments.filter(c => c.sectionId === sectionKey);`;
const replacement2 = `  const renderInlineCommentThread = (sectionKey: string) => {
    if (!canComment) return null;
    const sectionComments = comments.filter(c => c.sectionId === sectionKey);`;
content = content.replace(target2, replacement2);

const badgeTarget = `      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        className={\`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 uppercase tracking-wider \${
          count > 0 
            ? "bg-amber-50 text-amber-600 border border-amber-100" 
            : isOpen
             ? "bg-blue-50 text-blue-600 border border-blue-100"
             : "bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-100/50"
        }\`}
        title={\`\${count} komentar aktif. Klik untuk buka/tutup komentar.\`}
      >
        <MessageSquare size={12} className={count > 0 ? "fill-amber-500/10" : ""} />
        <span>{count > 0 ? \`\${count} Masukan\` : "Beri Komen"}</span>
      </button>`;

const badgeReplacement = `      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        className={\`ml-auto inline-flex justify-center items-center gap-1 p-2 rounded-lg transition-all duration-200 \${
          count > 0 
            ? "bg-amber-500/10 text-amber-600" 
            : isOpen
             ? "bg-blue-500/10 text-blue-600"
             : "bg-black/[0.03] text-gray-500 hover:bg-black/[0.06]"
        }\`}
        title={\`\${count} komentar aktif. Klik untuk buka/tutup komentar.\`}
      >
        <MessageSquare size={14} className={count > 0 ? "fill-amber-500/20" : ""} />
        {count > 0 && <span className="text-[11px] font-bold">{count}</span>}
      </button>`;

content = content.replace(badgeTarget, badgeReplacement);

fs.writeFileSync('src/PublicBriefView.tsx', content);

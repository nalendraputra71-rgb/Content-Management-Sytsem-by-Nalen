const fs = require('fs');

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const oldStripHtml = `const stripHtml = (html: string) => (html || "").replace(/<[^>]*>?/gm, '');`;

const newStripHtml = `const stripHtml = (html: string) => {
        let text = html || "";
        text = text.replace(/<p[^>]*>/gi, '\\n');
        text = text.replace(/<br\\s*\\/?>/gi, '\\n');
        text = text.replace(/<\\/p>/gi, '');
        text = text.replace(/<[^>]*>?/gm, '');
        return text.trim();
      };`;

content = content.replace(oldStripHtml, newStripHtml);
fs.writeFileSync('src/layouts/MainLayout.tsx', content);
console.log("Updated stripHtml in MainLayout");

const fs = require('fs');
let code = fs.readFileSync('src/RichTextEditor.tsx', 'utf8');

code = code.replace(/<button\s+tabIndex={-1}\s+title="([^"]+)"([\s\S]*?)<\/button>/g, (match, title, inner) => {
  return `<Tooltip text="${title}" position="top">\n        <button \n          tabIndex={-1} \n          ${inner}</button>\n      </Tooltip>`;
});

fs.writeFileSync('src/RichTextEditor.tsx', code);

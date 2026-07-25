const fs = require('fs');
let code = fs.readFileSync('src/PublicBriefView.tsx', 'utf8');

// 1. Remove order classes from LEFT COLUMN
code = code.replace(/<div className="w-full lg:w-\[380px\] shrink-0 flex flex-col gap-6 order-2 lg:order-1">/, '<div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">');

// 2. Remove order classes from MIDDLE COLUMN
code = code.replace(/<div className="flex-1 w-full flex flex-col gap-6 min-w-0 order-1 lg:order-2">/, '<div className="flex-1 w-full flex flex-col gap-6 min-w-0">');

// 3. Remove the toggle button for mobile props
// Look for the <button> inside the <h2>...</h2> block
code = code.replace(
  /<div className="flex items-center justify-between">\s*<h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">\s*<Zap size=\{14\} className="text-blue-500" \/>\s*Detail & Jadwal Konten\s*<\/h2>\s*<button[\s\S]*?<\/button>\s*<\/div>/,
  `<div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-blue-500" />
                Detail & Jadwal Konten
              </h2>
            </div>`
);

// 4. Remove the dynamic showMobileProps class
code = code.replace(
  /<div className=\{\`flex flex-col gap-4 border-t border-gray-50 pt-4 lg:flex \$\{showMobileProps \? "flex" : "hidden lg:flex"\}\`\}>/,
  '<div className="flex flex-col gap-4 border-t border-gray-50 pt-4">'
);

// 5. Add document.title update
// Let's insert the useEffect right after the useEffect for fetching data
code = code.replace(
  /(useEffect\(\(\) => \{\s*if \(brief\) \{\s*setLayoutFields\(getInitialLayoutFields\(\)\);\s*\}\s*\}, \[brief, workspace\]\);)/,
  `$1\n\n  useEffect(() => {\n    if (brief?.title) {\n      document.title = \`\${brief.title} - Hubify Social\`;\n    } else {\n      document.title = "Public Content Brief - Hubify Social";\n    }\n  }, [brief?.title]);`
);

fs.writeFileSync('src/PublicBriefView.tsx', code);

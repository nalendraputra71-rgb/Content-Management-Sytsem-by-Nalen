const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

// I need to clean up the ctx object.
const badVars = ['data', 'days', 'posts', 'caption', 'media', 'input', 'p', 'target', 'ref', 'option', 'ctx'];
const start = code.indexOf('const ctx = {');
if (start !== -1) {
    const end = code.indexOf('};', start) + 2;
    let block = code.substring(start, end);
    badVars.forEach(v => {
        const regex = new RegExp(`\\b${v}\\s*,?`, 'g');
        block = block.replace(regex, '');
    });
    code = code.substring(0, start) + block + code.substring(end);
}

fs.writeFileSync('src/SocialStudioView.tsx', code);

const tabs = ['ContentTab.tsx', 'CalendarTab.tsx', 'CompetitorTab.tsx', 'InboxTab.tsx'];
tabs.forEach(tab => {
    let tabCode = fs.readFileSync('src/' + tab, 'utf8');
    // Remove the duplicate 'ctx' from destructuring, which causes error TS2300
    tabCode = tabCode.replace(/,\s*ctx\b/g, '');
    
    // Some tabs need `lang`. Let's just add `lang` to the destructuring for all of them just in case.
    if (!tabCode.includes('lang,')) {
        tabCode = tabCode.replace('} = ctx;', '  lang\n  } = ctx;');
    }
    
    fs.writeFileSync('src/' + tab, tabCode);
});


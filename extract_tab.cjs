const fs = require('fs');

function fixAndSave(outputFile) {
    let content = fs.readFileSync(outputFile, 'utf8');
    
    // Replace the first occurrence of {tab === ... && (
    content = content.replace(/\{tab === "[^"]+" && \(/, '');
    
    // Remove the very last )} right before 
    //   );
    // }
    const match = content.match(/\)\}\s*\{?\/\*.*?\*\/\s*\}\s*\)\s*;\s*\}/) || content.match(/\)\}\s*\)\s*;\s*\}/);
    if (match) {
        // do something? Actually it's easier to just split by lines
    }
    
    let lines = content.split('\n');
    let idx = lines.length - 1;
    while(idx >= 0) {
        if (lines[idx].includes(')}')) {
            lines[idx] = lines[idx].replace(/\)\}/, '');
            break;
        }
        idx--;
    }
    
    fs.writeFileSync(outputFile, lines.join('\n'));
}

fixAndSave('src/DashboardTab.tsx');

const fs = require('fs');

function fixIcons(tabFile, icons) {
    let code = fs.readFileSync(tabFile, 'utf8');
    const match = code.match(/import \{([\s\S]*?)\} from "lucide-react";/);
    if (match) {
        let imported = match[1];
        imported += ', ' + icons.join(', ');
        code = code.replace(match[1], imported);
    }
    fs.writeFileSync(tabFile, code);
}

fixIcons('src/ContentTab.tsx', ['Edit', 'ArrowDown', 'Info', 'ArrowUpDown']);
fixIcons('src/CalendarTab.tsx', ['ChevronLeft']);
fixIcons('src/InboxTab.tsx', ['List']);


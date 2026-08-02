const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

if (!code.includes('id="admin-search-email"')) {
    code = code.replace(
        '<input placeholder="Cari email user..."',
        '<input id="admin-search-email" placeholder="Cari email user..."'
    );
}

fs.writeFileSync('src/AdminPanel.tsx', code, 'utf8');

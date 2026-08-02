const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

if (!code.includes('id="admin-search"')) {
    code = code.replace(
        '<input type="text" placeholder="Cari pengguna berdasarkan nama, email, atau ID..."',
        '<input id="admin-search" type="text" placeholder="Cari pengguna berdasarkan nama, email, atau ID..."'
    );
}

if (!code.includes('id="global-announcement"')) {
    code = code.replace(
        '<textarea placeholder="Ketik pengumuman global Anda di sini..."',
        '<textarea id="global-announcement" placeholder="Ketik pengumuman global Anda di sini..."'
    );
}

fs.writeFileSync('src/AdminPanel.tsx', code, 'utf8');

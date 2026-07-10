const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const target = `  useEffect(() => {
    if (!workspaceId) return;`;

const replacement = `  useEffect(() => {
    if (!workspaceId) return;
    
    // Auto-sync backend secrets to this workspace
    fetch('/api/meta/sync-secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    }).catch(console.error);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/SocialStudioView.tsx', code);

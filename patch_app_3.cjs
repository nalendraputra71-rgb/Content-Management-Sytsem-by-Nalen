const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const { user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding } = useAuth();',
  'const { user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding, setUser, setProfile } = useAuth();'
);

fs.writeFileSync('src/App.tsx', content);

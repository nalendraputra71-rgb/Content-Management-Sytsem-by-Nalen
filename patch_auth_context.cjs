const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

content = content.replace(
  'showOnboarding: boolean;\n  setShowOnboarding: (val: boolean) => void;\n}',
  'showOnboarding: boolean;\n  setShowOnboarding: (val: boolean) => void;\n  setUser: (val: any) => void;\n  setProfile: (val: any) => void;\n}'
);

content = content.replace(
  'setShowOnboarding: () => {},\n});',
  'setShowOnboarding: () => {},\n  setUser: () => {},\n  setProfile: () => {},\n});'
);

content = content.replace(
  'value={{ user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding }}',
  'value={{ user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding, setUser, setProfile }}'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);

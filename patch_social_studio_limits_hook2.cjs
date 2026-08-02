const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const targetStr = `  const toggleConnection = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setDisconnectPrompt({ open: true, platform: id });
    } else {
      const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();`;

const newStr = `  const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();
  
  const toggleConnection = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setDisconnectPrompt({ open: true, platform: id });
    } else {`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');

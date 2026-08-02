const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldHandle = `    const handleConnectPlatform = async (platformId: string) => {
      const maxSocialAccounts = planDetails?.maxSocialAccounts || 10;
      if (
        maxSocialAccounts !== -1 && connectedPlatforms.length >= maxSocialAccounts
      ) {`;

const newHandle = `    const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();

    const handleConnectPlatform = async (platformId: string) => {
      if (!checkCanAddSocialAccount(connectedPlatforms.length)) {`;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');

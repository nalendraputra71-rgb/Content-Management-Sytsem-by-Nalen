const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  `{metaApiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">`,
  `<div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold text-blue-800 text-sm">Debug Info</span>
      <span className="text-blue-600 text-sm leading-relaxed">
        Connected Platforms: {JSON.stringify(connectedPlatforms)} <br/>
        Workspace ID: {workspaceId || 'undefined'} <br/>
        Accounts Data Keys: {JSON.stringify(Object.keys(connectedAccountsData))} <br/>
        Real Posts Count: {realPosts.length} <br/>
        Real Comments Count: {realComments.length}
      </span>
    </div>
  </div>
  {metaApiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);

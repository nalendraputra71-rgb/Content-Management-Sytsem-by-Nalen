const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const targetStr = `  const handleCreateWorkspace = async (name: string, copyFromId: string | null = null) => {
    if (!user) return;

    const ownedWorkspaces = workspaces.filter((w: any) => w.ownerId === user.uid || w.createdBy === user.uid);
    const { checkCanAddWorkspace, maxWorkspaces } = usePlanLimits();`;

const replacementStr = `  const { checkCanAddWorkspace, maxWorkspaces } = usePlanLimits();
  
  const handleCreateWorkspace = async (name: string, copyFromId: string | null = null) => {
    if (!user) return;

    const ownedWorkspaces = workspaces.filter((w: any) => w.ownerId === user.uid || w.createdBy === user.uid);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/layouts/MainLayout.tsx', code, 'utf8');

const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

const bulletReplacement = `export const generateBulletPoints = (plan: any, lang: 'id'|'en') => {
  if (plan?.features && plan.features.length > 0) {
    // If the plan has hardcoded features array (from the seeder), prefer using it for the card bullets
    return plan.features;
  }

  const limits = plan?.limits || {};
  const caps = plan?.capabilities || {};
  const bullets: string[] = [];

  // Workspaces
  if (limits.workspaces === -1 || limits.workspaces === '-1') {
    bullets.push("Unlimited Workspaces");
  } else {
    bullets.push(\`\${limits.workspaces || 1} Workspace\${limits.workspaces > 1 ? 's' : ''}\`);
  }

  // Social Accounts
  if (limits.socialAccounts === -1 || limits.socialAccounts === '-1') {
    bullets.push(lang === 'id' ? "Unlimited Akun Sosmed" : "Unlimited Social Accounts");
  } else if (limits.socialAccounts) {
    bullets.push(\`\${limits.socialAccounts} \${lang === 'id' ? 'Akun Sosmed' : 'Social Accounts'}\`);
  }

  // AI Usage
  if (caps.aiModelText) {
    bullets.push(\`Hub.AI: \${caps.aiModelText}\`);
  } else if (limits.aiCreditsPerMonth) {
     bullets.push(\`Hub.AI: \${limits.aiCreditsPerMonth} Credits\`);
  }

  // Team Members
  if (limits.teamMembers === -1 || limits.teamMembers === '-1') {
    bullets.push(lang === 'id' ? "Anggota Tim Unlimited" : "Unlimited Team Members");
  } else if (limits.teamMembers > 1) {
    bullets.push(\`\${limits.teamMembers} \${lang === 'id' ? 'Anggota Tim' : 'Team Members'}\`);
  } else if (limits.teamMembers === 1) {
    bullets.push(lang === 'id' ? "1 Anggota (Solo)" : "1 Member (Solo)");
  }
  
  return bullets;
};`;

code = code.replace(/export const generateBulletPoints = \(plan: any, lang: 'id'\|'en'\) => \{(.|\n)*?return bullets;\n\};/m, bulletReplacement);
fs.writeFileSync('src/PricingPage.tsx', code);

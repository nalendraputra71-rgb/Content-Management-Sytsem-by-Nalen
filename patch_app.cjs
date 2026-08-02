const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode1 = `          if (snap.exists()) {
            setPlanDetails(snap.data());
          } else {`;
const newCode1 = `          if (snap.exists()) {
            const planData = snap.data();
            setPlanDetails({
              ...planData,
              maxWorkspaces: planData.limits?.workspaces ?? 1,
              maxSocialAccounts: planData.limits?.socialAccounts ?? 10,
              aiTokenLimit: planData.limits?.aiCreditsPerMonth ?? 50,
              maxTeamMembers: planData.limits?.teamMembers ?? 0,
            });
          } else {`;

const oldCode2 = `            if (matched) setPlanDetails(matched.data());
            else setPlanDetails(null);`;
const newCode2 = `            if (matched) {
               const planData = matched.data();
               setPlanDetails({
                 ...planData,
                 maxWorkspaces: planData.limits?.workspaces ?? 1,
                 maxSocialAccounts: planData.limits?.socialAccounts ?? 10,
                 aiTokenLimit: planData.limits?.aiCreditsPerMonth ?? 50,
                 maxTeamMembers: planData.limits?.teamMembers ?? 0,
               });
            }
            else setPlanDetails(null);`;

code = code.replace(oldCode1, newCode1);
code = code.replace(oldCode2, newCode2);

fs.writeFileSync('src/App.tsx', code, 'utf8');

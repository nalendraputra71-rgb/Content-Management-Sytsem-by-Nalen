const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const trialPlanOld = `      } else if (profile?.plan === "trial") {
         setPlanDetails({
           maxWorkspaces: 2,
           maxSocialAccounts: 15,
           aiTokenLimit: 100,
           maxTeamMembers: 3,
           features: []
         });`;
const trialPlanNew = `      } else if (profile?.plan === "trial") {
         setPlanDetails({
           maxWorkspaces: 2,
           maxSocialAccounts: 15,
           aiTokenLimit: 100,
           maxTeamMembers: 3,
           features: [],
           limits: { workspaces: 2, socialAccounts: 15, aiCreditsPerMonth: 100, teamMembers: 3, storageMB: 5000 },
           capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'basic', contentApproval: false, commentManagement: true, supportLevel: 'email' }
         });`;

const freeFallbackOld = `           } else {
             setPlanDetails({
               maxWorkspaces: 1,
               maxSocialAccounts: 3,
               aiTokenLimit: 10,
               maxTeamMembers: 0,
               features: []
             });
           }
         } catch (e) {
           setPlanDetails({
             maxWorkspaces: 1,
             maxSocialAccounts: 3,
             aiTokenLimit: 10,
             maxTeamMembers: 0,
             features: []
           });
         }`;
const freeFallbackNew = `           } else {
             setPlanDetails({
               maxWorkspaces: 1,
               maxSocialAccounts: 3,
               aiTokenLimit: 10,
               maxTeamMembers: 0,
               features: [],
               limits: { workspaces: 1, socialAccounts: 3, aiCreditsPerMonth: 10, teamMembers: 0, storageMB: 100 },
               capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
             });
           }
         } catch (e) {
           setPlanDetails({
             maxWorkspaces: 1,
             maxSocialAccounts: 3,
             aiTokenLimit: 10,
             maxTeamMembers: 0,
             features: [],
             limits: { workspaces: 1, socialAccounts: 3, aiCreditsPerMonth: 10, teamMembers: 0, storageMB: 100 },
             capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
           });
         }`;

code = code.replace(trialPlanOld, trialPlanNew);
code = code.replace(freeFallbackOld, freeFallbackNew);
fs.writeFileSync('src/App.tsx', code, 'utf8');

import { useAuth } from "../contexts/AuthContext";

export function usePlanLimits(passedPlanDetails?: any) {
  const { profile } = useAuth();
  
  // If planDetails is passed, use it, otherwise fallback (if needed).
  const planDetails = passedPlanDetails || (profile as any)?.planDetails;

  const isAdmin = profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" || profile?.role === "admin";

  const getLimit = (key: string, defaultValue: number) => {
    if (isAdmin) return -1; // -1 means unlimited
    if (planDetails && planDetails.limits && planDetails.limits[key] !== undefined) {
       return planDetails.limits[key];
    }
    // Fallback to old flat structure
    if (planDetails && planDetails[key] !== undefined) {
       return planDetails[key];
    }
    return defaultValue;
  };

  const maxWorkspaces = getLimit('workspaces', planDetails?.maxWorkspaces ?? 1);
  const maxSocialAccounts = getLimit('socialAccounts', planDetails?.maxSocialAccounts ?? 3);
  const aiTokenLimit = getLimit('aiCreditsPerMonth', planDetails?.aiTokenLimit ?? 10);
  const maxTeamMembers = getLimit('teamMembers', planDetails?.maxTeamMembers ?? 0);
  const storageMB = getLimit('storageMB', planDetails?.storageMB ?? 100);

  const checkCanAddWorkspace = (currentCount: number) => {
    return maxWorkspaces === -1 || currentCount < maxWorkspaces;
  };

  const checkCanAddSocialAccount = (currentCount: number) => {
    return maxSocialAccounts === -1 || currentCount < maxSocialAccounts;
  };
  
  const checkCanAddTeamMember = (currentCount: number) => {
    return maxTeamMembers === -1 || currentCount < maxTeamMembers;
  };


  const getCapability = (capKey: string, defaultValue: any = false) => {
    if (isAdmin) {
       // if it's a numeric cap, we should probably return -1 for unlimited, but for now let's just return the value if we can, or a generic unlimited
       if (capKey === 'sharedBriefs') return -1;
       if (capKey === 'historyDays') return -1;
       return true;
    }
    
    if (planDetails && planDetails.capabilities && planDetails.capabilities[capKey] !== undefined) {
      return planDetails.capabilities[capKey];
    }
    return defaultValue;
  };

  const hasCapability = (capKey: string) => {
    const val = getCapability(capKey);
    if (typeof val === 'number') return val !== 0;
    return !!val;
  };

  return {
    isAdmin,
    maxWorkspaces,
    maxSocialAccounts,
    aiTokenLimit,
    maxTeamMembers,
    storageMB,
    checkCanAddWorkspace,
    checkCanAddSocialAccount,
    checkCanAddTeamMember,
    hasCapability,
    getCapability
  };
}

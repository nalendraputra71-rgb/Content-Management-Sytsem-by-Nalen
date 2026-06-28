import React, { useState } from "react";
import { X, ChevronRight, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PlatformIntegrationModalProps {
  isOpen: boolean;
  platformId: string | null;
  onClose: () => void;
  onSuccess: (platformId: string) => void;
}

const PLATFORM_DETAILS: Record<string, any> = {
  meta: {
    name: "Facebook Pages",
    color: "#1877F2",
    description: "Connect your Facebook Page to publish posts and analyze engagement.",
    permissions: [
      "Access your profile information (name and email)",
      "Access and display your Facebook Pages information (Required)",
      "Create and schedule posts on your Facebook Pages (Required)",
      "Read insights and analytics for your Pages (Required)",
      "Read and manage comments on your Page posts (Required)"
    ],
    disclaimerPlatform: "Facebook",
    learnMoreUrl: "https://www.facebook.com/help/204306713029340",
    requirements: "Requires Admin access to the Facebook Page."
  },
  instagram: {
    name: "Instagram Professional",
    color: "#E4405F",
    description: "Connect your Instagram Business or Creator account.",
    permissions: [
      "Access your profile information (name and email)",
      "Access your Instagram Professional account profile (Required)",
      "Publish photos, videos, and Reels to your feed (Required)",
      "Read insights and metrics for your account and media (Required)",
      "Read and reply to comments on your media (Required)"
    ],
    disclaimerPlatform: "Instagram",
    learnMoreUrl: "https://help.instagram.com/515230437301944",
    requirements: "Must be an Instagram Professional account linked to a Facebook Page."
  },
  tiktok: {
    name: "TikTok",
    color: "#000000",
    description: "Connect your TikTok account to publish videos and track performance.",
    permissions: [
      "Read your TikTok profile information (Required)",
      "Read your public videos (Required)",
      "Upload and publish videos to your TikTok account (Required)",
      "Access your video and account analytics data (Required)"
    ],
    disclaimerPlatform: "TikTok",
    learnMoreUrl: "https://support.tiktok.com/en/account-and-privacy/account-privacy-settings/third-party-apps",
    requirements: "Supports Personal, Creator, and Business accounts."
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    description: "Connect your LinkedIn Personal Profile or Company Page.",
    permissions: [
      "Use your name and photo (Required)",
      "Access your basic profile or Company Page info (Required)",
      "Create, manage, and delete posts on your behalf (Required)",
      "Retrieve analytics for your posts and page (Required)",
      "Read and respond to comments on your posts (Required)"
    ],
    disclaimerPlatform: "LinkedIn",
    learnMoreUrl: "https://www.linkedin.com/help/linkedin/answer/a1339724",
    requirements: "Company Pages require Super Admin access."
  },
  threads: {
    name: "Threads",
    color: "#000000",
    description: "Connect your Threads account for text updates.",
    permissions: [
      "Read your profile information (Required)",
      "Access and display your Threads posts (Required)",
      "Create and share posts on your Threads profile (Required)",
      "Manage replies and quotes on Threads posts (Required)",
      "Manage insights of posts on Threads (Required)"
    ],
    disclaimerPlatform: "Threads",
    learnMoreUrl: "https://help.instagram.com/515230437301944",
    requirements: "Standard Threads account required."
  }
};

export const PlatformIntegrationModal: React.FC<PlatformIntegrationModalProps> = ({
  isOpen,
  platformId,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedAccount(null);
      setLoading(false);
    }
  }, [isOpen, platformId]);

  if (!isOpen || !platformId) return null;

  const platform = PLATFORM_DETAILS[platformId] || PLATFORM_DETAILS.meta;

  const handleContinue = () => {
    if (step === 1) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 1500); // Simulate OAuth redirect
    } else if (step === 2) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 1000);
    } else if (step === 3) {
      onSuccess(platformId);
      onClose();
      // Reset state after a short delay so the modal closes smoothly
      setTimeout(() => {
        setStep(1);
        setSelectedAccount(null);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FAFAFA] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[#111827]">
            {step === 1 ? `Connect ${platform.name}` : step === 2 ? "Select Account" : "Success"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#111827]/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 flex-1 min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <h3 className="text-lg font-bold text-[#111827] mb-6">
                  Hubify is requesting access to:
                </h3>
                
                <div className="space-y-4 flex-1">
                  <ul className="space-y-4 mb-8">
                    {platform.permissions.map((perm: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-[#111827]/80 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black/80 flex-shrink-0" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-xs text-[#111827]/50 text-center space-y-4 pt-4 border-t border-black/5">
                    <p>
                      By continuing, Hubify will receive ongoing access to your information and {platform.disclaimerPlatform} will record when Hubify accesses it. <a href={platform.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Learn more</a> about this sharing and the settings that you have.
                    </p>
                    <p>
                      Hubify's <a href="https://www.hubifysocial.com/#/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Privacy Policy</a> and <a href="https://www.hubifysocial.com/#/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Terms of Service</a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <h3 className="text-lg font-bold text-[#111827] mb-2">Choose an Account</h3>
                <p className="text-sm text-[#111827]/60 mb-6">
                  Select the {platform.name} account you want to connect to Hubify.
                </p>

                <div className="space-y-3 flex-1">
                  {["My Main Account", "Business Page", "Creator Profile"].map((acc, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAccount(acc)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        selectedAccount === acc 
                          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5" 
                          : "border-black/5 bg-white hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[#111827]/40">
                          {acc.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827] text-sm">{acc}</div>
                          <div className="text-xs text-[#111827]/50">@{acc.toLowerCase().replace(" ", "")}</div>
                        </div>
                      </div>
                      {selectedAccount === acc && <CheckCircle2 size={20} className="text-[var(--theme-primary)]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 text-center py-8"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Successfully Connected!</h3>
                <p className="text-sm text-[#111827]/60">
                  Your {platform.name} account <strong>{selectedAccount}</strong> is now connected to Hubify. You can now publish posts and view analytics.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 bg-white flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-[#111827]/70 hover:bg-black/5 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={loading || (step === 2 && !selectedAccount)}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 transition-colors text-sm flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : step === 1 ? (
              "Continue"
            ) : step === 2 ? (
              "Connect Account"
            ) : (
              "Done"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

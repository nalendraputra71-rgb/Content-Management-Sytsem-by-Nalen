import React from "react";
import { SettingsPanel } from "./SettingsPanel";

export function UserProfile({
  userProfile,
  activeWorkspace,
  onUpdate,
  planDetails,
}: {
  userProfile: any;
  activeWorkspace: any;
  onUpdate: (data: any) => void;
  planDetails?: any;
}) {
  return (
    <SettingsPanel
      profile={userProfile}
      onUpdateProfile={onUpdate}
      activeWorkspace={activeWorkspace}
      planDetails={planDetails}
      initialSettings={activeWorkspace?.settings || {}}
      onSave={async () => {}}
    />
  );
}

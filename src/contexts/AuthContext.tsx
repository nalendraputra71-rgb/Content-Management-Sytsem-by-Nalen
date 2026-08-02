import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db, doc, onSnapshot, getDoc, setDoc } from "../firebase";
import { UserProfile, SystemConfig } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  authLoading: boolean;
  systemConfig: SystemConfig | null;
  showOnboarding: boolean;
  setShowOnboarding: (val: boolean) => void;
  setUser: (val: any) => void;
  setProfile: (val: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  authLoading: true,
  systemConfig: null,
  showOnboarding: false,
  setShowOnboarding: () => {},
  setUser: () => {},
  setProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    getDoc(doc(db, "config", "system"))
      .then((snap) => {
        if (snap.exists()) setSystemConfig(snap.data() as SystemConfig);
      })
      .catch((error) => {
        console.warn("config/system getDoc warn:", error.message);
      });
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          try {
            const snap = await getDoc(doc(db, "users", u.uid));
            if (snap.exists()) {
              const data = snap.data();
              setProfile(data as UserProfile);
              setShowOnboarding(false);

              // Run checks and merge updates if necessary to avoid looping
              let needsUpdate = false;
              const updates: any = {};

              if (data.emailVerified !== u.emailVerified) {
                updates.emailVerified = u.emailVerified;
                needsUpdate = true;
              }
              if (u.email?.toLowerCase() === "nalendraputra71@gmail.com" && data.role !== "admin") {
                updates.role = "admin";
                needsUpdate = true;
              }

              if (needsUpdate) {
                try {
                  await setDoc(doc(db, "users", u.uid), updates, { merge: true });
                  setProfile((prev: any) => ({ ...prev, ...updates }));
                } catch (err) {
                  console.warn("Failed to auto-update user profile details on login:", err);
                }
              }
            } else {
              setShowOnboarding(false);
            }
          } catch (err) {
            console.error("User profile fetch error:", err);
          }
          setUser(u);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => {
      unsubAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding, setUser, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

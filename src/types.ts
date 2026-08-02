export interface UserProfile {
  uid?: string;
  email?: string;
  nickname?: string;
  role?: string;
  emailVerified?: boolean;
  avatar?: string;
  [key: string]: any;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members?: string[];
  [key: string]: any;
}

export interface SystemConfig {
  [key: string]: any;
}

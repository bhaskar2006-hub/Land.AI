import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export type UserRole = 'officer' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  officerId: string;
  department: string;
  jurisdiction: string;
  stateCode: string;
  districtCode: string;
  avatarUrl?: string;
  lastSignIn: string;
  authProvider: 'clerk' | 'local';
}

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isSignedIn: boolean;
  isOfficer: boolean;
  isAdmin: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  signOut: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_officer_8829',
  fullName: 'R. Srinivasan',
  email: 'r.srinivasan@revenue.gov.in',
  role: 'officer',
  officerId: 'REV-OFF-2026-NILGIRIS',
  department: 'Revenue & Cadastral Administration',
  jurisdiction: 'Nilgiris District / Kotagiri Mandal',
  stateCode: 'TN',
  districtCode: 'NILGIRIS',
  avatarUrl: '',
  lastSignIn: new Date().toISOString(),
  authProvider: 'local'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let clerkUser: any = null;
  let isClerkSignedIn = false;
  let clerkSignOut: any = null;

  try {
    const { user, isSignedIn } = useUser();
    const { signOut } = useClerkAuth();
    clerkUser = user;
    isClerkSignedIn = !!isSignedIn;
    clerkSignOut = signOut;
  } catch (e) {
    // Graceful fallback if Clerk instance is not initialized or offline
    clerkUser = null;
    isClerkSignedIn = false;
  }

  // Load initial role & user state from localStorage or defaults
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('landai_user_role');
    return (saved === 'admin' || saved === 'officer') ? saved : 'officer';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProf = localStorage.getItem('landai_user_profile');
    if (savedProf) {
      try {
        return JSON.parse(savedProf);
      } catch (err) {
        // fallback
      }
    }
    return DEFAULT_USER;
  });

  // Sync Clerk User details when Clerk sign in is active
  useEffect(() => {
    if (isClerkSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || DEFAULT_USER.email;
      const name = clerkUser.fullName || clerkUser.firstName ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() : DEFAULT_USER.fullName;
      const clerkRole: UserRole = (clerkUser.publicMetadata?.role as UserRole) || role;

      const updated: UserProfile = {
        ...userProfile,
        id: clerkUser.id,
        fullName: name,
        email: email,
        avatarUrl: clerkUser.imageUrl,
        role: clerkRole,
        authProvider: 'clerk',
        lastSignIn: new Date().toISOString()
      };

      setUserProfile(updated);
      localStorage.setItem('landai_user_profile', JSON.stringify(updated));
    }
  }, [isClerkSignedIn, clerkUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('landai_user_role', newRole);
    setUserProfile(prev => {
      const next = { ...prev, role: newRole };
      localStorage.setItem('landai_user_profile', JSON.stringify(next));
      return next;
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('landai_user_profile', JSON.stringify(next));
      return next;
    });
  };

  const signOut = () => {
    if (clerkSignOut) {
      clerkSignOut();
    }
    localStorage.removeItem('landai_user_profile');
    setUserProfile(DEFAULT_USER);
  };

  const isSignedIn = isClerkSignedIn || true; // standard dev fallback
  const isOfficer = role === 'officer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        role,
        setRole,
        isSignedIn,
        isOfficer,
        isAdmin,
        updateProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Context pour gérer l'état du profil utilisateur dans toute l'application
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseServiceFactory } from '../services/DatabaseServiceFactory';
import { UserProfile } from '../types';

interface ProfileContextType {
  profile: UserProfile | null;
  hasProfile: boolean;
  isLoading: boolean;
  reloadProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const db = await DatabaseServiceFactory.getInstance();
      const userProfile = await db.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const reloadProfile = async () => {
    await loadProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: !!profile,
        isLoading,
        reloadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
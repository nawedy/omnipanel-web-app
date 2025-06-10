import React, { createContext, useContext, useEffect, useState } from 'react';
import { neonAuth, type AuthUser, type AuthSession, type SignInCredentials, type SignUpCredentials } from '@/services/neon-auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthSession>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = neonAuth.onAuthStateChange((newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    // Get initial session
    const initialSession = neonAuth.getSession();
    setSession(initialSession);
    setUser(initialSession?.user || null);
    setLoading(false);

    return unsubscribe;
  }, []);

  const signIn = async (credentials: SignInCredentials): Promise<AuthSession> => {
    setLoading(true);
    try {
      const session = await neonAuth.signIn(credentials);
      return session;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<AuthSession> => {
    setLoading(true);
    try {
      const session = await neonAuth.signUp(credentials);
      return session;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await neonAuth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await neonAuth.resetPassword(email);
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>): Promise<void> => {
    try {
      await neonAuth.updateProfile(updates);
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider; 
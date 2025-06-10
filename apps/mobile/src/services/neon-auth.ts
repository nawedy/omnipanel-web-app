// omnipanel-core/apps/mobile/src/services/neon-auth.ts
// NeonDB + Stack Auth service for React Native

import { StackClientApp } from '@stackframe/stack/dist/lib/stack-app';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Stack Auth configuration
const stackConfig = {
  baseUrl: process.env.EXPO_PUBLIC_STACK_BASE_URL || 'https://api.stack-auth.com',
  projectId: process.env.EXPO_PUBLIC_STACK_PROJECT_ID || '',
  publishableClientKey: process.env.EXPO_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '',
};

// Create Stack client for React Native
export const stackAuth = new StackClientApp({
  baseUrl: stackConfig.baseUrl,
  projectId: stackConfig.projectId,
  publishableClientKey: stackConfig.publishableClientKey,
  tokenStore: AsyncStorage, // Use AsyncStorage for React Native
});

// NeonDB connection configuration
const neonConfig = {
  connectionString: process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '',
  projectId: process.env.EXPO_PUBLIC_NEON_PROJECT_ID || '',
};

// Auth service interface
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// Auth service implementation
export class NeonAuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Check for existing session
      const storedSession = await AsyncStorage.getItem('auth_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        // Validate session with Stack Auth
        const user = await stackAuth.getUser();
        if (user) {
          this.currentSession = {
            user: {
              id: user.id,
              email: user.primaryEmail || '',
              displayName: user.displayName || undefined,
              avatarUrl: user.profileImageUrl || undefined,
            },
            accessToken: user.accessToken || '',
          };
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  // Get current session
  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  // Get current user
  public getUser(): AuthUser | null {
    return this.currentSession?.user || null;
  }

  // Sign in with email and password
  public async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    try {
      const result = await stackAuth.signInWithEmailAndPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (result.user) {
        const session: AuthSession = {
          user: {
            id: result.user.id,
            email: result.user.primaryEmail || credentials.email,
            displayName: result.user.displayName || undefined,
            avatarUrl: result.user.profileImageUrl || undefined,
          },
          accessToken: result.user.accessToken || '',
        };

        this.currentSession = session;
        await AsyncStorage.setItem('auth_session', JSON.stringify(session));
        this.notifyListeners();

        return session;
      }

      throw new Error('Sign in failed');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign up with email and password
  public async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    try {
      const result = await stackAuth.signUpWithEmailAndPassword({
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.displayName,
      });

      if (result.user) {
        const session: AuthSession = {
          user: {
            id: result.user.id,
            email: result.user.primaryEmail || credentials.email,
            displayName: result.user.displayName || credentials.displayName,
            avatarUrl: result.user.profileImageUrl || undefined,
          },
          accessToken: result.user.accessToken || '',
        };

        this.currentSession = session;
        await AsyncStorage.setItem('auth_session', JSON.stringify(session));
        this.notifyListeners();

        return session;
      }

      throw new Error('Sign up failed');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      await stackAuth.signOut();
      this.currentSession = null;
      await AsyncStorage.removeItem('auth_session');
      this.notifyListeners();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Reset password
  public async resetPassword(email: string): Promise<void> {
    try {
      await stackAuth.sendPasswordResetEmail({ email });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  public onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentSession);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Update user profile
  public async updateProfile(updates: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>): Promise<void> {
    try {
      const user = await stackAuth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Update user profile through Stack Auth
      if (updates.displayName !== undefined) {
        await user.update({ displayName: updates.displayName });
      }

      // Update current session
      if (this.currentSession) {
        this.currentSession.user = {
          ...this.currentSession.user,
          ...updates,
        };
        await AsyncStorage.setItem('auth_session', JSON.stringify(this.currentSession));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get authentication headers for API requests
  public getAuthHeaders(): Record<string, string> {
    if (!this.currentSession?.accessToken) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.currentSession.accessToken}`,
      'X-Stack-Project-Id': stackConfig.projectId,
    };
  }
}

// Export singleton instance
export const neonAuth = new NeonAuthService();

// Export default
export default neonAuth; 
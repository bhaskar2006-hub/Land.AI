import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'REVENUE_OFFICER' | 'REVIEWER' | 'VIEWER';

export interface UserProfile {
  id: string; // References auth.users(id)
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  district: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  error?: string | null;
}

class AuthService {
  private state: AuthState = {
    user: null,
    profile: null,
    role: null,
    loading: true,
    isAuthenticated: false,
    error: null
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.initSession();
  }

  /**
   * Subscribe to auth state changes
   */
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately inform the listener of current state
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Initialize and restore session on application startup.
   * Restores session only if user has an authorized profile in the database.
   */
  public async initSession(): Promise<AuthState> {
    try {
      this.state.loading = true;
      this.notify();

      if (!isSupabaseConfigured()) {
        console.warn('Supabase credentials not configured in environment.');
        this.state = {
          user: null,
          profile: null,
          role: null,
          loading: false,
          isAuthenticated: false,
          error: null
        };
        this.notify();
        return this.getState();
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session || !session.user) {
        this.state = {
          user: null,
          profile: null,
          role: null,
          loading: false,
          isAuthenticated: false,
          error: null
        };
      } else {
        const profile = await this.fetchUserProfile(session.user.id);
        if (!profile) {
          // Profile not configured: clear session and refuse access
          await supabase.auth.signOut();
          this.state = {
            user: null,
            profile: null,
            role: null,
            loading: false,
            isAuthenticated: false,
            error: 'User profile is not configured. Please contact an administrator.'
          };
        } else {
          this.state = {
            user: session.user,
            profile,
            role: profile.role,
            loading: false,
            isAuthenticated: true,
            error: null
          };
        }
      }
    } catch (err) {
      console.error('Session restoration error:', err);
      this.state = {
        user: null,
        profile: null,
        role: null,
        loading: false,
        isAuthenticated: false,
        error: null
      };
    } finally {
      this.state.loading = false;
      this.notify();
    }

    // Register active Supabase auth listener
    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || !session || !session.user) {
        this.state = {
          user: null,
          profile: null,
          role: null,
          loading: false,
          isAuthenticated: false,
          error: null
        };
        this.notify();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const profile = await this.fetchUserProfile(session.user.id);
        if (!profile) {
          await supabase.auth.signOut();
          this.state = {
            user: null,
            profile: null,
            role: null,
            loading: false,
            isAuthenticated: false,
            error: 'User profile is not configured. Please contact an administrator.'
          };
        } else {
          this.state = {
            user: session.user,
            profile,
            role: profile.role,
            loading: false,
            isAuthenticated: true,
            error: null
          };
        }
        this.notify();
      }
    });

    return this.getState();
  }

  /**
   * Retrieve the user's LAND•AI profile strictly from the database profiles table.
   * Returns null if the user does not exist in profiles or has an invalid role.
   * Never assigns a mock or default fallback role.
   */
  public async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !userId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, district, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const validRoles: UserRole[] = ['ADMIN', 'REVENUE_OFFICER', 'REVIEWER', 'VIEWER'];
      if (!validRoles.includes(data.role as UserRole)) {
        return null;
      }

      return {
        id: data.id,
        full_name: data.full_name || '',
        email: data.email || '',
        role: data.role as UserRole,
        department: data.department || 'Revenue Department',
        district: data.district || 'Guntur',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }

  /**
   * Sign In with email and password via Supabase Auth.
   * Queries the database profiles table using the authenticated user.id.
   * If profile is missing, denies access and signs out.
   */
  public async signIn(email: string, password: string): Promise<AuthResponse<UserProfile>> {
    if (!email || !email.trim() || !password) {
      return {
        success: false,
        error: 'Please enter both email and password.'
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    }

    try {
      this.state.loading = true;
      this.notify();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error || !data.user) {
        return {
          success: false,
          error: 'Invalid email or password.'
        };
      }

      // Step: Query profiles table using authenticated user's ID
      const profile = await this.fetchUserProfile(data.user.id);
      if (!profile) {
        // Authenticated with Supabase, but profile does not exist in profiles table
        await supabase.auth.signOut();
        this.state = {
          user: null,
          profile: null,
          role: null,
          loading: false,
          isAuthenticated: false,
          error: 'User profile is not configured. Please contact an administrator.'
        };
        this.notify();
        return {
          success: false,
          error: 'User profile is not configured. Please contact an administrator.'
        };
      }

      this.state = {
        user: data.user,
        profile,
        role: profile.role,
        loading: false,
        isAuthenticated: true,
        error: null
      };
      this.notify();

      return {
        success: true,
        data: profile
      };
    } catch (err) {
      console.error('Authentication request failure:', err);
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  /**
   * Sign Out current user
   */
  public async signOut(): Promise<AuthResponse> {
    try {
      this.state.loading = true;
      this.notify();

      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }

      this.state = {
        user: null,
        profile: null,
        role: null,
        loading: false,
        isAuthenticated: false,
        error: null
      };
      this.notify();

      return { success: true };
    } catch (err) {
      console.error('Error during signOut:', err);
      this.state = {
        user: null,
        profile: null,
        role: null,
        loading: false,
        isAuthenticated: false,
        error: null
      };
      this.notify();
      return { success: true };
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    if (this.state.user) return this.state.user;
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Get current session
   */
  public async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  public onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();

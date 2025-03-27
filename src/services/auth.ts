import { API_BASE_URL } from './api';

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  created_at: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthResponse {
  session: Session;
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  private constructor() {
    // Load session from localStorage
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      this.currentSession = JSON.parse(savedSession);
      this.loadUser(); // Attempt to load user data
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async loadUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        this.logout(); // Clear invalid session
        return;
      }

      const { user } = await response.json();
      this.currentUser = user;
    } catch (error) {
      console.error('Error loading user:', error);
      this.logout();
    }
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.currentSession?.access_token}`
    };
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Login failed');
      }

      const { user, session }: AuthResponse = await response.json();
      
      // Store session
      this.currentSession = session;
      localStorage.setItem('session', JSON.stringify(session));
      
      // Store user
      this.currentUser = user;

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of server response
      this.currentUser = null;
      this.currentSession = null;
      localStorage.removeItem('session');
    }
  }

  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    
    // Check if session is expired
    const now = Date.now() / 1000; // Convert to seconds
    return this.currentSession.expires_at > now;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getAccessToken(): string | null {
    return this.currentSession?.access_token || null;
  }
}

export const authService = AuthService.getInstance(); 
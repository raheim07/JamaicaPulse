import { createClient } from '@supabase/supabase-js';

// Check if Supabase credentials are available in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use Supabase if credentials are available, otherwise use mock service
const useSupabase = supabaseUrl && supabaseAnonKey;

// Define the shape of our auth service
interface AuthService {
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  isAdmin: () => Promise<boolean>;
}

// Create a mock auth service for development when Supabase is not configured
const createMockAuthService = (): AuthService => ({
  login: async () => ({ user: null, session: null }),
  logout: async () => {},
  getCurrentUser: async () => null,
  isAdmin: async () => false,
});

// Export the appropriate service based on availability of Supabase credentials
export const authService: AuthService = useSupabase 
  ? (() => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      return {
        login: async (email: string, password: string) => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          return data;
        },

        logout: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        },

        getCurrentUser: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          return user;
        },

        isAdmin: async () => {
          const user = await authService.getCurrentUser();
          return user?.email === 'pulseofthenation@yueniq.com';
        },
      };
    })()
  : createMockAuthService();
// 🔐 Supabase Authentication Service
// Simple email auth implementation

import { supabase } from '../supabase/client.js';

class SupabaseAuthService {
  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('✅ User signed in:', data.user?.email);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error.message);
      return { user: null, error: error.message };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('✅ User signed up:', data.user?.email);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error.message);
      return { user: null, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log('✅ User signed out');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error.message);
      return { error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Get user error:', error.message);
      return null;
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('❌ Get session error:', error.message);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      callback(event, session);
    });
    
    return subscription;
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();
export default authService;
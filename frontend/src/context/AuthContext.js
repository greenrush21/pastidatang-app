import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_KEY
  );

  // Fetch user profile data from users table
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching user profile:', error.message);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Get the initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          
          // Fetch user profile after login
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error.message);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
            
            // Fetch user profile after login
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserProfile(null);
          } else if (event === 'USER_UPDATED') {
            setUser(session?.user ?? null);
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            }
          }
          
          setLoading(false);
        }
      );

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    };

    initAuth();
  }, []);

  // Login with email and password
  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Add user metadata like role, division, etc.
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  // Update user profile in the users table
  const updateProfile = async (updates) => {
    setAuthError(null);
    try {
      if (!user || !userProfile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (password) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    user,
    userProfile,
    loading,
    authError,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
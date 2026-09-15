import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@supabase/supabase-js";

import { authErrorKey } from "../lib/authErrors";
import { supabase } from "../lib/supabaseClient";

import { PRIVACY_VERSION, TERMS_VERSION } from "../lib/legalVersions";

type AuthContextType = {
  user: User | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<string | null>;

  signUp: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<string | null>;

  signOut: () => Promise<void>;

  updateEmail: (email: string) => Promise<string | null>;

  updatePassword: (password: string) => Promise<string | null>;

  resetPassword: (
    email: string,
    captchaToken: string,
  ) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the existing Supabase session when the app starts
    // so authenticated users remain signed in after refreshing.
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    // Keep the application user state synchronized with Supabase
    // whenever the authentication session changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Remove the authentication listener when the provider
    // is unmounted to avoid unnecessary subscriptions.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authenticates an existing user with email and password.
  // The Turnstile token is forwarded to Supabase for CAPTCHA verification.
  const signIn = async (
    email: string,
    password: string,
    captchaToken: string,
  ) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,

        options: {
          captchaToken,
        },
      });

      return error ? authErrorKey(error, "loginFailed") : null;
    } catch (error) {
      return authErrorKey(error, "loginFailed");
    }
  };

  // Creates a new user account after CAPTCHA verification.
  // The active legal-document versions and acceptance timestamp
  // are stored in the user's authentication metadata.
  const signUp = async (
    email: string,
    password: string,
    captchaToken: string,
  ) => {
    try {
      const acceptedAt = new Date().toISOString();

      const { error } = await supabase.auth.signUp({
        email,
        password,

        options: {
          captchaToken,

          data: {
            terms_accepted_at: acceptedAt,

            terms_version: TERMS_VERSION,

            privacy_acknowledged_at: acceptedAt,

            privacy_version: PRIVACY_VERSION,

            age_confirmed_18_plus: true,
          },
        },
      });

      return error ? authErrorKey(error, "registrationFailed") : null;
    } catch (error) {
      return authErrorKey(error, "registrationFailed");
    }
  };

  // Requests a password-reset email after CAPTCHA verification.
  // Supabase redirects the user back to Ratteb's reset-password page.
  const resetPassword = async (email: string, captchaToken: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });

      return error ? error.message : null;
    } catch (error) {
      return error instanceof Error ? error.message : "Password reset failed";
    }
  };

  // Updates the email address of the currently authenticated user.
  const updateEmail = async (email: string) => {
    const { error } = await supabase.auth.updateUser({
      email,
    });

    return error ? error.message : null;
  };

  // Updates the password of the currently authenticated user.
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    return error ? error.message : null;
  };

  // Ends the current Supabase authentication session.
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        resetPassword,
        signOut,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Provides access to the authentication context and prevents
// accidental usage outside the AuthProvider tree.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

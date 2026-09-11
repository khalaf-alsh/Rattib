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
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateEmail: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? authErrorKey(error, "loginFailed") : null;
    } catch (error) {
      return authErrorKey(error, "loginFailed");
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const acceptedAt = new Date().toISOString();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
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

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return error ? error.message : null;
  };

  const updateEmail = async (email: string) => {
    const { error } = await supabase.auth.updateUser({
      email,
    });

    return error ? error.message : null;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    return error ? error.message : null;
  };

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

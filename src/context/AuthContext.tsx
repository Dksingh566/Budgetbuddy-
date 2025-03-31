
import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Currency } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export type User = {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  currency?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, currency?: string) => Promise<void>;
  signInWithGoogle: (currency?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, currency?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserCurrency: (currency: string) => Promise<void>;
  session: Session | null;
};

// List of supported currencies
export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our User type
const formatUser = (user: SupabaseUser | null, currencyPref?: string): User | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    photoURL: user.user_metadata?.avatar_url,
    currency: currencyPref || user.user_metadata?.currency || "USD",
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initial session check and auth state change listener
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(formatUser(currentSession?.user || null));
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(formatUser(currentSession?.user || null));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string, currency: string = "USD") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Currency preference will be updated via the auth state change listener
      if (currency !== "USD") {
        await updateUserCurrency(currency);
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (currency: string = "USD") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Note: Currency will be updated after the redirect back from Google
      localStorage.setItem("preferred_currency", currency);
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, currency: string = "USD") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            currency,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to BudgetBuddy!",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with a different email.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password-confirmation`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "Please check the email address and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserCurrency = async (currency: string) => {
    try {
      if (!user) return;

      const { error } = await supabase.auth.updateUser({
        data: { currency }
      });
      
      if (error) {
        throw error;
      }
      
      // Update the local user state immediately for better UX
      setUser(prev => prev ? { ...prev, currency } : null);
      
      toast({
        title: "Currency updated",
        description: `Your default currency is now ${currency}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update currency preference.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        updateUserCurrency,
        session,
      }}
    >
      {loading && !user ? (
        <div className="flex justify-center items-center h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Loader2 className="h-10 w-10 text-primary mx-auto mb-4" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground font-medium"
            >
              Loading your account...
            </motion.p>
          </motion.div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

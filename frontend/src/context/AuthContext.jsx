import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { supabase } from "../lib/supabase";
import {
  syncCustomer,
  fetchCustomerBySupabaseId,
} from "../lib/customerService";
import toast from "react-hot-toast";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      setCustomer(null);
      return null;
    }

    try {
      const result = await syncCustomer(supabaseUser);

      if (result) {
        setCustomer(result);
        return result;
      }

      setCustomer(null);
      return null;
    } catch (err) {
      console.error(err);
      setCustomer(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialResolved = false;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const existingCustomer =
            await fetchCustomerBySupabaseId(
              currentSession.user.id
            );

          if (mounted) {
            setCustomer(existingCustomer);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
          initialResolved = true;
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Only re-fetch customer after the initial load is done
          // to avoid a duplicate fetch on the SIGNED_IN event that fires on startup
          if (
            (event === 'SIGNED_IN' || event === 'USER_UPDATED') &&
            initialResolved
          ) {
            await loadCustomer(newSession.user);
          }
        } else {
          setCustomer(null);
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadCustomer]);

  const signUp = async ({
    name,
    email,
    password,
  }) => {
    try {
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const signIn = async ({
    email,
    password,
  }) => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    setCustomer(null);
    toast.success("Logged out");
  };

  const resetPassword = async (email) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    return { error };
  };

  const value = {
    user,
    session,
    customer,
    setCustomer,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ADD THIS PART */
export const useAuth = () => {
  return useContext(AuthContext);
};
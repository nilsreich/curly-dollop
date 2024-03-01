import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { Login } from "@/components/Login";

// Create a context for the auth state
export const AuthContext = createContext<User | null>(null);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Don't render anything if loading
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={user}>
      {user ? children : <Login />}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth state
export const useAuth = () => useContext(AuthContext);

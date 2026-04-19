import * as React from "react";
import type { User } from "@/lib/types";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  refresh: () => void;
  loginAs: (userId: string) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);

  const refresh = React.useCallback(() => {
    setUser(authService.current());
  }, []);

  React.useEffect(() => {
    userService.seedIfEmpty();
    setUser(authService.current());
    setReady(true);
  }, []);

  const loginAs = React.useCallback((userId: string) => {
    authService.loginAs(userId);
    setUser(authService.current());
  }, []);

  const logout = React.useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, ready, refresh, loginAs, logout }),
    [user, ready, refresh, loginAs, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

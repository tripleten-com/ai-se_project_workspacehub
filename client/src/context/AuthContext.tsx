import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
} from "../services/authService";
import { setAuthToken } from "../services/api";
import type {
  FeatureFlags,
  Organization,
  User,
  UserRole,
} from "../types/models";
import { AuthContext, type AuthContextValue } from "./authContextDefinition";

const STORAGE_KEY = "workspacehub_token";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(
    window.localStorage.getItem(STORAGE_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (
    nextToken: string,
    nextUser: User,
    nextOrganization: Organization,
  ) => {
    window.localStorage.setItem(STORAGE_KEY, nextToken);
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setOrganization(nextOrganization);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  const refreshSession = async () => {
    if (!token) {
      logout();
      return;
    }

    setAuthToken(token);
    const session = await authService.me();
    setUser(session.user);
    setOrganization(session.organization);
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshSession();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    void hydrate();
  }, []);

  const login = async (payload: LoginPayload) => {
    const session = await authService.login(payload);
    applySession(session.token, session.user, session.organization);
  };

  const register = async (payload: RegisterPayload) => {
    const session = await authService.register(payload);
    applySession(session.token, session.user, session.organization);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      organization,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshSession,
      setOrganizationState: setOrganization,
      hasRole: (...roles: UserRole[]) => {
        return Boolean(user && roles.includes(user.role));
      },
      isFeatureEnabled: (featureKey: keyof FeatureFlags) => {
        return Boolean(organization?.featureFlags[featureKey]);
      },
    }),
    [token, user, organization, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

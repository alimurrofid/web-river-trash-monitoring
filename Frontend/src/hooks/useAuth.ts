import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authservices";

interface User {
  id: number;
  email: string;
  created_at?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      // First check if authenticated
      const authCheck = await authService.checkAuth();

      if (authCheck.isAuthenticated && authCheck.userId) {
        // If authenticated, get full profile
        const profileResponse = await authService.getProfile();
        if (profileResponse.user) {
          setUser(profileResponse.user);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      return authCheck.isAuthenticated;
    } catch (err) {
      console.error("Auth status check failed:", err);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Note: Your backend doesn't use rememberMe, but we keep it for future use
      const response = await authService.login({ email, password, rememberMe });

      if (response.success && response.user) {
        console.log("Login successful, user:", response.user);

        // After successful login, get full profile
        const profileResponse = await authService.getProfile();
        if (profileResponse.user) {
          setUser(profileResponse.user);
          setIsAuthenticated(true);
        }

        // Navigate after successful login
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login hook error:", err);
      setIsAuthenticated(false);
      setUser(null);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Logout failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  };
};
import axios from "axios";

// Create axios instance with default settings
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Always include credentials (cookies)
  headers: {
    "Content-Type": "application/json",
  },
});

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
  };
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    created_at: string;
  };
}

interface CheckAuthResponse {
  success: boolean;
  isAuthenticated: boolean;
  userId?: number;
  email?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log("Attempting login with:", { email: credentials.email });
      const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      console.log("Login response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw new Error("Network error, please try again later");
    }
  },

  logout: async (): Promise<void> => {
    try {
      const response = await api.post("/auth/logout");
      if (!response.data.success) {
        throw new Error(response.data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      throw new Error("Logout failed");
    }
  },

  checkAuth: async (): Promise<CheckAuthResponse> => {
    try {
      const response = await api.get("/auth/check");
      console.log("Auth check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Check auth error:", error);
      throw new Error("Auth check failed");
    }
  },

  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get("/auth/profile");
      console.log("Profile response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get profile");
      }
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error("Failed to get profile");
    }
  },
};
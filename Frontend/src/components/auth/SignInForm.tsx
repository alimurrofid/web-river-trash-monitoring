import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../hooks/useAuth";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from a protected route
  const from = location.state?.from?.pathname || "/dashboard";

  // If user is already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password, rememberMe);
      // Navigation is handled in the login function
    } catch (error) {
      console.error("Login error:", error);
      // Error is already handled in useAuth hook
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {(error || formError) && (
                  <div className="p-3 text-sm text-white bg-red-500 rounded">
                    {error || formError}
                    <button
                      className="float-right font-bold"
                      onClick={() => {
                        clearError();
                        setFormError("");
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div>
                  <Label htmlFor="email">
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@gmail.com"
                    
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={rememberMe}
                      onChange={(checked) => setRememberMe(checked)}
                      id="remember-me"
                    />
                    <label
                      htmlFor="remember-me"
                      className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400"
                    >
                      Keep me logged in
                    </label>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}

                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
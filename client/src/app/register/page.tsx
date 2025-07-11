"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  access_token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

const RegisterScreen = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = (): boolean => {
    const { email, username, password } = formData;

    if (!email.trim() || !username.trim() || !password) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://techtest.youapp.ai/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Registration failed with status ${response.status}`
        );
      }

      setSuccess(data.message || "User has been registered successfully!");

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      setFormData({
        email: "",
        username: "",
        password: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${
        isVisible ? "scale-110" : "scale-100"
      }`}
    >
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        className="transition-colors duration-200"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        className="transition-colors duration-200"
      />
      {!isVisible && (
        <path
          d="M1 1l22 22"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
          className="animate-pulse"
        />
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-1/3 w-50 h-50 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm mx-auto text-white z-10 animate-slideUp">
        <h1 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent animate-fadeIn">
          Register
        </h1>

        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          {/* Email Input */}
          <div className="relative group animate-slideIn delay-100">
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-5 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:bg-white/12 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-white/25"
              required
              disabled={isLoading}
              autoComplete="email"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Username Input */}
          <div className="relative group animate-slideIn delay-200">
            <input
              type="text"
              name="username"
              placeholder="Create Username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-5 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:bg-white/12 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-white/25"
              required
              disabled={isLoading}
              autoComplete="username"
              minLength={3}
              maxLength={20}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Password Input */}
          <div className="relative group animate-slideIn delay-300">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-5 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:bg-white/12 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-white/25"
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              tabIndex={-1}
            >
              <EyeIcon isVisible={showPassword} />
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-center animate-shake">
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="15"
                    y1="9"
                    x2="9"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="9"
                    y1="9"
                    x2="15"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-400 text-sm p-4 bg-green-400/10 border border-green-400/30 rounded-lg text-center animate-slideIn">
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Redirecting to login...
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 rounded-xl text-white font-semibold mt-6 shadow-lg shadow-cyan-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-slideIn delay-500 relative overflow-hidden"
          >
            <div
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              Register
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-white/70 text-sm mt-8 animate-fadeIn delay-700">
          <span>Have an account? </span>
          <Link
            href="/login"
            className="text-cyan-400 underline font-medium hover:text-cyan-300 transition-all duration-200 hover:scale-105 inline-block"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

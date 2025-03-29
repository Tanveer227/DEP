"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    if (!username || !password) {
      setErrorMessage("Both username and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5328/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful! Redirecting...");
        document.cookie = `token=${data.token}; path=/; SameSite=Lax`; // Store token securely
        router.push("/dashboard");
      } else {
        setErrorMessage(data.error || "Invalid credentials.");
      }
    } catch (error) {
      setErrorMessage("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white">
      <div className="absolute top-5 w-full text-center">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">MedNet</h1>
      </div>
      <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-sm text-center">{errorMessage}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Development Skip Button */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => {
              localStorage.setItem("skipAuth", "true");
              router.push("/dashboard");
            }}
            className="mt-4 block mx-auto text-sm text-gray-300 underline hover:text-gray-100"
          >
            Skip Login (Dev Mode)
          </button>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up here.
          </a>
        </p>
      </div>
    </div>
  );
}

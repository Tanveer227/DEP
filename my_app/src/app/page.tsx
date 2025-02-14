// pages/index.tsx
"use client"
import Head from "next/head";
import { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/navigation"; // For redirection

const Home: NextPage = () => {
  // State to toggle between Login and Signup forms
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <>
      <Head>
        <title>Login / Signup</title>
        <meta name="description" content="Login or Signup to get started" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded px-8 py-6 w-full max-w-md">
          {/* Toggle Buttons */}
          <div className="mb-6 flex justify-center space-x-4">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded font-medium focus:outline-none ${isLogin
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded font-medium focus:outline-none ${!isLogin
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Signup
            </button>
          </div>

          {/* Render the selected form */}
          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </>
  );
};

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        // Redirect to dashboard (or another page)
        router.push("/dashboard");
      } else {
        console.error("Login error:", data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="login-username"
          className="block text-gray-700 text-sm font-bold mb-1"
        >
          Username
        </label>
        <input
          id="login-username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="block text-gray-700 text-sm font-bold mb-1"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};

const SignupForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
        // Redirect to dashboard (or login page)
        router.push("/dashboard");
      } else {
        console.error("Signup error:", data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="signup-username"
          className="block text-gray-700 text-sm font-bold mb-1"
        >
          Username
        </label>
        <input
          id="signup-username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div>
        <label
          htmlFor="signup-email"
          className="block text-gray-700 text-sm font-bold mb-1"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div>
        <label
          htmlFor="signup-password"
          className="block text-gray-700 text-sm font-bold mb-1"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default Home;

// pages/index.tsx
"use client"
import Head from 'next/head';
import { NextPage } from 'next';
import { useState } from 'react';

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
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded font-medium focus:outline-none ${!isLogin
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-gray-700 text-sm font-bold mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-gray-700 text-sm font-bold mb-1">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
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
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="signup-name" className="block text-gray-700 text-sm font-bold mb-1">
          Name
        </label>
        <input
          id="signup-name"
          type="text"
          placeholder="Enter your name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-gray-700 text-sm font-bold mb-1">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-gray-700 text-sm font-bold mb-1">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Button as ShadButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5328/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear error message on successful login
        setErrorMessage('');

        // Store token in localStorage or sessionStorage
        localStorage.setItem('token', data.token);

        // Show success message
        toast.success('Login successful! Redirecting to dashboard...');

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Set error message if login fails
        setErrorMessage(data.error || 'Invalid CVAT credentials. Please try again.');
      }
    } catch (error) {
      console.error("Error during login:", error); // Debugging log
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white bg-[url('https://c7.alamy.com/comp/2HFJKKP/medical-background-with-mri-scan-image-of-human-head-2HFJKKP.jpg')] bg-cover bg-center">
      <div className="absolute top-5 w-full text-center">
        <h1 className="text-8xl font-extrabold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>MedNet</h1>
      </div>
      <Card className="w-full max-w-md shadow-lg rounded-2xl bg-gray-800 backdrop-blur-md bg-opacity-90 mt-24">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-2 rounded-xl border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 rounded-xl border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Display error message if credentials are invalid */}
            {errorMessage && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <ShadButton type="submit" className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition">
              Login
            </ShadButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

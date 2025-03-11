'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5328/auth/user', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!data.authenticated) {
          toast.error('Please log in first.');
          router.push('/');
        }
      } catch (error) {
        toast.error('Error checking authentication.');
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to MedNet Dashboard</h1>
    </div>
  );
}

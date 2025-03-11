// src/app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  // 1. Attempt to read a cookie named "token" (or whatever you use).
  const token = cookies().get('token');

  // 2. If no token, redirect to the login page.
  if (!token) {
    redirect('/login');
  }

  // 3. Otherwise, redirect to the dashboard (or another protected page).
  redirect('/dashboard');
}

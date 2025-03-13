import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  // 1. Attempt to read a cookie named "token" (or whatever you use).
  const token = (await cookies()).get('token');

  // 2. If no token, redirect to the login page.
  if (!token) {
    redirect('/login');
  }

  // 3. If token exists, render the home page.
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>You are authenticated!</p>
    </div>
  );
}
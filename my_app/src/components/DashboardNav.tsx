"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  // Helper to determine if the current path is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-black shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className={`px-4 py-2 text-lg font-medium ${
              isActive("/dashboard")
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-white hover:text-blue-200"
            }`}
          >
            History
          </Link>
          <Link
            href="/newupload"
            className={`px-4 py-2 text-lg font-medium ${
              isActive("/newupload")
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-white hover:text-blue-200"
            }`}
          >
            New Upload
          </Link>
          <Link
            href="/yourupload"
            className={`px-4 py-2 text-lg font-medium ${
              isActive("/yourupload")
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-white hover:text-blue-200"
            }`}
          >
            Your Upload
          </Link>
          <Link
            href="/corrected"
            className={`px-4 py-2 text-lg font-medium ${
              isActive("/corrected")
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-white hover:text-blue-200"
            }`}
          >
            Corrected
          </Link>
        </div>
      </div>
    </nav>
  );
}

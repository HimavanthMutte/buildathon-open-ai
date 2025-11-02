"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, LogIn, UserPlus } from "lucide-react";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          aria-label="User menu"
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline max-w-[120px] truncate">
            {user.name}
          </span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base font-medium"
      >
        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
      <Link
        href="/signup"
        className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
      >
        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Sign Up</span>
      </Link>
    </div>
  );
}





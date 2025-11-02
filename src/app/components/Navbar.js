"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import UserProfile from "./UserProfile";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ isAuthenticated }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800/70 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-gray-900 dark:after:bg-white after:transition-all after:duration-200"
            >
              Home
            </Link>
            <Link
              href="/#schemes"
              className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-gray-900 dark:after:bg-white after:transition-all after:duration-200"
            >
              Schemes
            </Link>
            <Link
              href="/#categories"
              className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-gray-900 dark:after:bg-white after:transition-all after:duration-200"
            >
              Categories
            </Link>
          </div>

          {/* Right Side - Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <>
                <ThemeToggle />
                <UserProfile />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/signup"
                  className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm hover:shadow transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-800 dark:text-gray-200 ml-auto rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <Link
              href="/"
              className="block text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#schemes"
              className="block text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Schemes
            </Link>
            <Link
              href="/#categories"
              className="block text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>

            {/* Mobile Auth Buttons */}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <ThemeToggle />
                <div className="mt-2">
                  <UserProfile />
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <ThemeToggle />
                <Link
                  href="/signup"
                  className="block w-full text-center px-4 py-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm hover:shadow transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


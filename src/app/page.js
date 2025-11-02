"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/Navbar";
import SchemeCard from "./components/SchemeCard";
import AIAssistant from "./components/AIAssistant";
import { GraduationCap, Wheat, Heart, Users, Home, Briefcase, Rocket, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);

  // Check authentication status
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch schemes
  useEffect(() => {
    fetchSchemes();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        setIsAuthenticated(true);
        // If authenticated, redirect to dashboard
        router.push("/dashboard");
        return;
      } else {
        // If not authenticated, show home page
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Not authenticated, show home page
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const response = await fetch("/api/schemes");
      if (response.ok) {
        const data = await response.json();
        setSchemes(data);
        // Get 4 featured schemes
        setFeaturedSchemes(data.slice(0, 4));
      } else {
        // Fallback to local data
        const localData = await import("../../data/schemes.json");
        setSchemes(localData.default);
        setFeaturedSchemes(localData.default.slice(0, 4));
      }
    } catch (err) {
      try {
        const localData = await import("../../data/schemes.json");
        setSchemes(localData.default);
        setFeaturedSchemes(localData.default.slice(0, 4));
      } catch (localErr) {
        console.error("Error loading schemes:", localErr);
      }
    }
  };

  const categories = [
    { icon: GraduationCap, label: "Education", description: "Access educational schemes", emoji: "🎓" },
    { icon: Wheat, label: "Agriculture", description: "Agriculture", emoji: "🌾" },
    { icon: Heart, label: "Health", description: "Health", emoji: "❤️" },
    { icon: Users, label: "Women Empowerment", description: "Women Empowerment", emoji: "👩" },
    { icon: Home, label: "Housing", description: "Housing", emoji: "🏠" },
    { icon: Briefcase, label: "Employment", description: "Employment", emoji: "💼" },
    { icon: Rocket, label: "Entrepreneurship", description: "Entrepreneurship", emoji: "🚀" },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  };

  const handleAskAssistant = () => {
    // Scroll to AI assistant or open it
    if (isAuthenticated) {
      const aiButton = document.querySelector('[aria-label*="AI"]');
      if (aiButton) {
        aiButton.click();
      }
    } else {
      router.push("/login");
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Loading...</p>
        </div>
      </div>
    );
  }

  // Show home page for unauthenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar */}
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background image (India themed) */}
        <div
          className="absolute inset-0 bg-center bg-cover opacity-20 dark:opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=60')",
          }}
          aria-hidden="true"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/0 dark:from-gray-900/70 dark:via-gray-900/50 dark:to-gray-900/0" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Yojana Sahayak AI
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-200">
            Empowering Citizens with Smart Access to Government Schemes
          </p>
          {!isAuthenticated && (
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-[colors,shadow,transform] duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-[colors,shadow,transform] duration-200 font-semibold text-lg shadow hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          )}
        </div>
      </section>

      {/* Popular Scheme Categories */}
      <section id="categories" className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 transition-colors duration-200">
            Popular Scheme Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {category.emoji}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-1 transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {category.label}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center transition-colors duration-200 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Government Schemes */}
      <section id="schemes" className="py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 transition-colors duration-200">
            Featured Government Schemes
          </h2>
          {featuredSchemes.length > 0 ? (
            <div className="relative overflow-hidden scroll-mask">
              <div className="flex gap-6 animate-scroll-x will-change-transform">
                {[...featuredSchemes, ...featuredSchemes].map((scheme, idx) => (
                  <div
                    key={`${scheme.id}-${idx}`}
                    className="min-w-[260px] sm:min-w-[300px] lg:min-w-[340px] bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-6 shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                        {scheme.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                      {scheme.schemeName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 transition-colors duration-200">
                      {scheme.description}
                    </p>
                    <Link
                      href={isAuthenticated ? "/dashboard" : "/signup"}
                      className="inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 underline underline-offset-4 decoration-transparent hover:decoration-current"
                    >
                      Learn More <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No schemes available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Need Help Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Need Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg transition-colors duration-200">
            Ask about schemes for farmers, students, women, entrepreneurs, and more...
          </p>
          <button
            onClick={handleAskAssistant}
            className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Ask Assistant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
            © 2025 Yojana Sahayak AI - Empowering citizens with government schemes
          </p>
        </div>
      </footer>

      {/* Floating AI Assistant Button - Only show if authenticated */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          <AIAssistant schemes={schemes} />
        </div>
      )}
    </div>
  );
}

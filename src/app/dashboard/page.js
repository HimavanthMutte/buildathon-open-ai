"use client";

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import SchemeList from "../components/SchemeList";
import AIAssistant from "../components/AIAssistant";
import { AlertCircle } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import UserProfile from "../components/UserProfile";
import ThemeToggle from "../components/ThemeToggle";
import SchemeCardSkeleton from "../components/SchemeCardSkeleton";
import SearchBarSkeleton from "../components/SearchBarSkeleton";

export default function DashboardPage() {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("en");

  // Fetch schemes on mount
  useEffect(() => {
    fetchSchemes();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [schemes, searchQuery, category, state]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      // For now, load from local JSON file
      const response = await fetch("/api/schemes");
      if (!response.ok) {
        // Fallback to local data
        const localData = await import("../../../data/schemes.json");
        setSchemes(localData.default);
      } else {
        const data = await response.json();
        setSchemes(data);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching schemes:", err);
      // Fallback to local data
      try {
        const localData = await import("../../../data/schemes.json");
        setSchemes(localData.default);
      } catch (localErr) {
        setError("Failed to load schemes. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schemes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (scheme) =>
          scheme.schemeName.toLowerCase().includes(query) ||
          scheme.description.toLowerCase().includes(query) ||
          scheme.benefits.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter((scheme) => scheme.category === category);
    }

    // State filter
    if (state) {
      filtered = filtered.filter((scheme) => scheme.state === state);
    }

    setFilteredSchemes(filtered);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-md border-b border-gray-200/70 dark:border-gray-800/70 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* User Profile and Theme Toggle - Top Right */}
            <div className="flex justify-end items-center gap-3 mb-4">
              <ThemeToggle />
              <UserProfile />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                Yojana Sahayak AI
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg transition-colors duration-200">
                Discover government schemes tailored for you
              </p>
            </div>

          {/* Search & Filters Section */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              {loading ? (
                <SearchBarSkeleton />
              ) : (
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
            </div>

            {/* Filter Bar */}
            {!loading && (
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <FilterBar
                  category={category}
                  setCategory={setCategory}
                  state={state}
                  setState={setState}
                  language={language}
                  setLanguage={setLanguage}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-200">
            Available Schemes
            <span className="ml-2 sm:ml-3 text-base sm:text-lg font-normal text-gray-600 dark:text-gray-400 transition-colors duration-200">
              ({filteredSchemes.length} found)
            </span>
          </h2>
          
          {(searchQuery || category || state || language !== "en") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCategory("");
                setState("");
                setLanguage("en");
              }}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold text-sm self-start sm:self-auto transition-colors duration-200 underline underline-offset-4 decoration-transparent hover:decoration-current"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading State - Skeleton Loaders */}
        {loading && (
          <>
            {/* Results Count Skeleton */}
            <div className="mb-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
            {/* Schemes Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SchemeCardSkeleton key={index} />
              ))}
            </div>
          </>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 transition-colors duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1 transition-colors duration-200">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm transition-colors duration-200">{error}</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredSchemes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-200">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
              No schemes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategory("");
                setState("");
                setLanguage("en");
              }}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold transition-colors duration-200 underline underline-offset-4 decoration-transparent hover:decoration-current"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Schemes Grid with Translation */}
        {!loading && !error && filteredSchemes.length > 0 && (
          <SchemeList schemes={filteredSchemes} language={language} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
            © 2025 Yojana Sahayak AI - Empowering citizens with government schemes
          </p>
        </div>
      </footer>

      {/* Floating AI Assistant Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <AIAssistant schemes={schemes} />
      </div>
      </div>
    </ProtectedRoute>
  );
}


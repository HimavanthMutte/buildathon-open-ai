"use client";

import { useState, useEffect } from "react";
import { ExternalLink, MapPin, Building2, Users, FileText, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";

export default function SchemeCard({ scheme }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if scheme is saved on mount
  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const response = await fetch("/api/auth/saved-schemes");
      if (response.ok) {
        const data = await response.json();
        // Check using savedSchemeIds first (faster), fallback to schemes array
        if (data.savedSchemeIds && Array.isArray(data.savedSchemeIds)) {
          setIsSaved(data.savedSchemeIds.includes(scheme.id));
        } else if (data.schemes && Array.isArray(data.schemes)) {
          setIsSaved(data.schemes.some(s => s.id === scheme.id));
        }
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      const endpoint = isSaved ? "/api/auth/unsave-scheme" : "/api/auth/save-scheme";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schemeId: scheme.id }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save scheme");
      }
    } catch (error) {
      console.error("Save/unsave error:", error);
      alert("Failed to save scheme. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5 flex flex-col h-full">
      {/* Content wrapper - grows to fill space */}
      <div className="flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 transition-colors duration-200">
              {scheme.schemeName}
            </h3>
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium transition-colors duration-200">
              {scheme.category}
            </span>
          </div>
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={loading}
            className={`ml-2 p-2 rounded-lg transition-colors flex-shrink-0 ${
              isSaved
                ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={isSaved ? "Remove from saved" : "Save scheme"}
            title={isSaved ? "Remove from saved" : "Save scheme"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 transition-colors duration-200">
          {scheme.description}
        </p>

        {/* Details Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0 transition-colors duration-200" />
            <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 transition-colors duration-200">{scheme.ministry}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0 transition-colors duration-200" />
            <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{scheme.state}</span>
          </div>

          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0 transition-colors duration-200" />
            <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 transition-colors duration-200">
              {scheme.targetGroups.join(", ")}
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4 transition-colors duration-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0 transition-colors duration-200" />
            <p className="text-sm text-green-800 dark:text-green-300 font-medium line-clamp-3 transition-colors duration-200">{scheme.benefits}</p>
          </div>
        </div>

        {/* Documents Required */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">Documents Required:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scheme.documentsRequired.map((doc, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs transition-colors duration-200"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Button - Always at bottom */}
      <a
        href={scheme.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-[colors,shadow,transform] duration-200 mt-4 shadow-sm hover:shadow"
      >
        Apply Now
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

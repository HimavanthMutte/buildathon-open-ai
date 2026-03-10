"use client";

import { useState, useMemo, useEffect } from "react";
import SchemeCard from "./SchemeCard";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function SchemeList({ schemes, language, itemsPerPage = 6 }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when schemes change (e.g. on new search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [schemes]);

  // Memoize the translated schemes
  const translatedSchemes = useMemo(() => {
    if (!schemes) return [];

    // If English, return as is
    if (language === "en") return schemes;

    // Otherwise, try to use the pre-translated strings from the database
    return schemes.map(scheme => {
      // Check if we have translations for this language
      const langTranslations = scheme.translations?.[language];

      if (langTranslations) {
        return {
          ...scheme,
          schemeName: langTranslations.schemeName || scheme.schemeName,
          description: langTranslations.description || scheme.description,
          benefits: langTranslations.benefits || scheme.benefits,
          eligibility: langTranslations.eligibility || scheme.eligibility,
        };
      }

      // Fallback to original if translation is missing
      return scheme;
    });
  }, [schemes, language]);

  // Pagination logic
  const totalPages = Math.ceil(translatedSchemes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchemes = translatedSchemes.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (translatedSchemes.length === 0) {
    return null;
  }

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(indexOfLastItem, translatedSchemes.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{translatedSchemes.length}</span> schemes
          </div>

          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Show page numbers for desktop, or a simplified view for mobile */}
            <div className="hidden sm:flex">
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => goToPage(number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${currentPage === number
                      ? 'z-10 bg-blue-50 dark:bg-blue-900/40 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* Mobile page indicator */}
            <div className="sm:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

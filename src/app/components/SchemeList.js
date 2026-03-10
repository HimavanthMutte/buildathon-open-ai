"use client";

import { useMemo } from "react";
import SchemeCard from "./SchemeCard";
import { AlertCircle } from "lucide-react";

export default function SchemeList({ schemes, language }) {
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

  if (translatedSchemes.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {translatedSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}


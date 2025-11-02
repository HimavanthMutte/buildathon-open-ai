"use client";

import { useState, useEffect } from "react";
import SchemeCard from "./SchemeCard";
import { Loader2, Languages as LanguagesIcon } from "lucide-react";

export default function SchemeList({ schemes, language }) {
  const [translatedSchemes, setTranslatedSchemes] = useState([]);
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    console.log("SchemeList language changed:", language, "schemes count:", schemes.length);
    
    if (language === "en") {
      setTranslatedSchemes(schemes);
      return;
    }

    if (schemes.length > 0) {
      translateSchemes();
    }
  }, [schemes, language]);

  const translateSchemes = async () => {
    console.log("Starting translation for", schemes.length, "schemes to", language);
    setIsTranslating(true);

    try {
      const translated = await Promise.all(
        schemes.map(async (scheme, index) => {
          // Check cache first
          const cacheKey = `${scheme.id}-${language}`;
          if (translationCache[cacheKey]) {
            console.log(`Using cached translation for ${scheme.id}`);
            return translationCache[cacheKey];
          }

          try {
            console.log(`Translating scheme ${index + 1}/${schemes.length}: ${scheme.schemeName}`);
            
            // Translate scheme name, description, and benefits
            const [nameRes, descRes, benefitsRes] = await Promise.all([
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: scheme.schemeName,
                  targetLang: language,
                }),
              }),
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: scheme.description,
                  targetLang: language,
                }),
              }),
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: scheme.benefits,
                  targetLang: language,
                }),
              }),
            ]);

            // Check response status before parsing
            if (!nameRes.ok || !descRes.ok || !benefitsRes.ok) {
              console.error(`Translation API error for ${scheme.id}:`, {
                name: nameRes.status,
                desc: descRes.status,
                benefits: benefitsRes.status,
              });
              return scheme; // Return original if translation fails
            }

            const nameData = await nameRes.json();
            const descData = await descRes.json();
            const benefitsData = await benefitsRes.json();

            // Extract translated text safely
            const translatedName = nameData?.translatedText || nameData?.text || scheme.schemeName;
            const translatedDesc = descData?.translatedText || descData?.text || scheme.description;
            const translatedBenefits = benefitsData?.translatedText || benefitsData?.text || scheme.benefits;

            // Verify translation actually happened (not same as original)
            const nameIsTranslated = translatedName.toLowerCase() !== scheme.schemeName.toLowerCase();
            const descIsTranslated = translatedDesc.toLowerCase() !== scheme.description.toLowerCase();

            if (nameIsTranslated || descIsTranslated) {
              console.log(`✅ Translation successful for ${scheme.id}:`, {
                original: scheme.schemeName.substring(0, 30),
                translated: translatedName.substring(0, 30),
              });
            } else {
              console.warn(`⚠️ Translation may have failed for ${scheme.id} - text unchanged`);
            }

            const translatedScheme = {
              ...scheme,
              schemeName: translatedName,
              description: translatedDesc,
              benefits: translatedBenefits,
            };

            // Cache the translation
            setTranslationCache((prev) => ({
              ...prev,
              [cacheKey]: translatedScheme,
            }));

            return translatedScheme;
          } catch (error) {
            console.error(`❌ Translation error for scheme ${scheme.id}:`, error.message || error);
            // Return original scheme if translation fails
            return scheme;
          }
        })
      );

      console.log("Translation complete, setting", translated.length, "schemes");
      setTranslatedSchemes(translated);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedSchemes(schemes);
    } finally {
      setIsTranslating(false);
    }
  };

  // Show schemes immediately, even while translating (they'll update as translation completes)
  const schemesToDisplay = translatedSchemes.length > 0 ? translatedSchemes : schemes;

  if (schemesToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Translation Loading Banner - Highly Visible */}
      {isTranslating && (
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white rounded-xl shadow-lg p-4 sm:p-5 flex items-center justify-center gap-3 animate-pulse transition-colors duration-200">
          <div className="relative">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
            <LanguagesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-base sm:text-lg font-semibold">Translating schemes to your language...</span>
            <span className="text-sm sm:text-base text-purple-100">This may take a few moments</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemesToDisplay.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}


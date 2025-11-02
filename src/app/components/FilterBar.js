"use client";

import { Filter, Languages } from "lucide-react";

export default function FilterBar({
  category,
  setCategory,
  state,
  setState,
  language,
  setLanguage,
}) {
  const categories = [
    "All Categories",
    "Agriculture",
    "Health",
    "Education",
    "Housing",
    "Employment",
    "Women & Child",
    "Skill Development",
    "Entrepreneurship",
    "Microfinance",
    "Financial Inclusion",
    "Energy",
    "Pension",
    "Insurance",
    "Livelihood",
    "Food Security",
    "Infrastructure",
    "Sanitation",
    "Social Security",
  ];

  const states = [
    "All States",
    "All India",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "bn", name: "বাংলা (Bengali)" },
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center w-full">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base transition-colors duration-200">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Filters:</span>
      </div>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="flex-1 sm:flex-initial min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base transition-colors duration-200"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* State */}
      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="flex-1 sm:flex-initial min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base transition-colors duration-200"
      >
        {states.map((st) => (
          <option key={st} value={st === "All States" ? "" : st}>
            {st}
          </option>
        ))}
      </select>

      {/* Language Selector */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 transition-colors duration-200" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="flex-1 sm:flex-initial min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer transition-all hover:border-purple-400 dark:hover:border-purple-500 text-sm sm:text-base duration-200"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

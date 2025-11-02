"use client";

import { useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";

export default function AIAssistant({ schemes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Yojana Sahayak AI. I can help you find the perfect government scheme based on your needs. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Simple AI logic - match keywords to schemes
      const lowerQuery = userMessage.toLowerCase();
      let response = "";

      // Check for specific categories
      if (lowerQuery.includes("farm") || lowerQuery.includes("agriculture") || lowerQuery.includes("crop")) {
        const agriSchemes = schemes.filter((s) => s.category === "Agriculture");
        response = `I found ${agriSchemes.length} agriculture schemes for you:\n\n${agriSchemes
          .slice(0, 3)
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("health") || lowerQuery.includes("medical") || lowerQuery.includes("hospital")) {
        const healthSchemes = schemes.filter((s) => s.category === "Health");
        response = `I found ${healthSchemes.length} health schemes:\n\n${healthSchemes
          .slice(0, 3)
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("education") || lowerQuery.includes("student") || lowerQuery.includes("scholarship")) {
        const eduSchemes = schemes.filter((s) => s.category === "Education");
        response = `I found ${eduSchemes.length} education schemes:\n\n${eduSchemes
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("house") || lowerQuery.includes("housing") || lowerQuery.includes("home")) {
        const houseSchemes = schemes.filter((s) => s.category === "Housing");
        response = `I found housing schemes for you:\n\n${houseSchemes
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("woman") || lowerQuery.includes("women") || lowerQuery.includes("girl")) {
        const womenSchemes = schemes.filter((s) => 
          s.category.includes("Women") || s.targetGroups.some(t => t.toLowerCase().includes("women") || t.toLowerCase().includes("girl"))
        );
        response = `I found ${womenSchemes.length} schemes for women:\n\n${womenSchemes
          .slice(0, 3)
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("job") || lowerQuery.includes("employment") || lowerQuery.includes("work")) {
        const jobSchemes = schemes.filter((s) => s.category === "Employment" || s.category === "Skill Development");
        response = `I found ${jobSchemes.length} employment & skill development schemes:\n\n${jobSchemes
          .slice(0, 3)
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("business") || lowerQuery.includes("entrepreneur") || lowerQuery.includes("loan")) {
        const bizSchemes = schemes.filter((s) => 
          s.category === "Entrepreneurship" || s.category === "Microfinance"
        );
        response = `I found ${bizSchemes.length} schemes for entrepreneurs:\n\n${bizSchemes
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else if (lowerQuery.includes("pension") || lowerQuery.includes("retirement") || lowerQuery.includes("elderly")) {
        const pensionSchemes = schemes.filter((s) => s.category === "Pension");
        response = `I found pension schemes:\n\n${pensionSchemes
          .map((s) => `• ${s.schemeName}: ${s.description}`)
          .join("\n\n")}`;
      } else {
        response = `I can help you find schemes related to:\n\n• Agriculture & Farming\n• Health & Medical\n• Education & Scholarships\n• Housing\n• Employment & Skills\n• Women & Child Welfare\n• Business & Entrepreneurship\n• Pension & Social Security\n\nWhat are you looking for?`;
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
        setLoading(false);
      }, 500);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      >
        <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden sm:inline">AI Assistant 🤖</span>
        <span className="sm:hidden">AI 🤖</span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/70 dark:border-gray-700/70 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col transition-colors duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">Yojana Sahayak AI</h3>
                  <p className="text-xs text-purple-100">Your scheme finding assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none shadow"
                        : "bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                    } transition-colors duration-200`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 p-3 rounded-lg rounded-bl-none transition-colors duration-200">
                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex gap-2 items-center rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me about government schemes..."
                  className="flex-1 px-2 py-2 bg-transparent border-0 focus:outline-none focus-visible:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-[colors,shadow,transform] duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

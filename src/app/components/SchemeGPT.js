"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Bot, AlertCircle } from "lucide-react";
import SchemeCard from "./SchemeCard";

export default function SchemeGPT({ language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! 👋 I'm SchemeGPT, your specialized AI assistant for Indian government schemes.\n\nI'm here to help you discover and understand various government welfare programs. Feel free to ask me anything - whether you're looking for schemes in a specific category, want to know about eligibility, or just have questions about how these programs work. What would you like to know?",
      schemes: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Persist language preference
  useEffect(() => {
    if (typeof window !== "undefined" && language) {
      localStorage.setItem("preferredLanguage", language);
    }
  }, [language]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => ({ role: msg.role, content: msg.content }))
        .slice(-10); // Last 10 messages for context

      const response = await fetch("/api/scheme-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          language,
          conversationHistory 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Translate schemes if needed
      let displaySchemes = data.schemes || [];
      if (language !== "en" && displaySchemes.length > 0) {
        displaySchemes = await translateSchemes(displaySchemes, language);
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          schemes: displaySchemes,
          isRelevant: data.isRelevant,
        },
      ]);
    } catch (err) {
      console.error("SchemeGPT error:", err);
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question. If the issue persists, you can browse schemes using the filters above.",
          schemes: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const translateSchemes = async (schemes, targetLang) => {
    if (targetLang === "en" || schemes.length === 0) return schemes;

    try {
      const translated = await Promise.all(
        schemes.map(async (scheme) => {
          try {
            const [nameRes, descRes] = await Promise.all([
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: scheme.schemeName,
                  targetLang,
                }),
              }),
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: scheme.description,
                  targetLang,
                }),
              }),
            ]);

            if (nameRes.ok && descRes.ok) {
              const nameData = await nameRes.json();
              const descData = await descRes.json();

              return {
                ...scheme,
                schemeName: nameData.translatedText || scheme.schemeName,
                description: descData.translatedText || scheme.description,
              };
            }
            return scheme;
          } catch (error) {
            console.error(`Translation error for ${scheme.id}:`, error);
            return scheme;
          }
        })
      );
      return translated;
    } catch (error) {
      console.error("Translation error:", error);
      return schemes;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! 👋 I'm SchemeGPT, your specialized AI assistant for Indian government schemes.\n\nI'm here to help you discover and understand various government welfare programs. Feel free to ask me anything - whether you're looking for schemes in a specific category, want to know about eligibility, or just have questions about how these programs work. What would you like to know?",
        schemes: [],
      },
    ]);
    setError(null);
  };

  return (
    <>
      {/* SchemeGPT Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center gap-3 group animate-pulse"
          aria-label="Open SchemeGPT"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <span className="hidden md:inline-block font-bold text-lg whitespace-nowrap">
            SchemeGPT
          </span>
        </button>
      )}

      {/* SchemeGPT Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[95vw] sm:w-[500px] h-[700px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-indigo-200 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-8 h-8" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">SchemeGPT</h3>
                <p className="text-xs text-indigo-100">Specialized in Indian Government Schemes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="hover:bg-white/20 p-2 rounded-full transition-colors text-sm"
                title="Clear chat"
              >
                ↻
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Close SchemeGPT"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {/* Text Message */}
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg"
                        : "bg-white border-2 border-indigo-100 text-gray-800 rounded-bl-none shadow-md"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      <p className="font-medium">{msg.content}</p>
                    </div>
                  </div>
                </div>

                {/* Scheme Cards - Only show if schemes are provided */}
                {msg.schemes && msg.schemes.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold text-indigo-600 px-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Here are {msg.schemes.length} relevant scheme{msg.schemes.length > 1 ? "s" : ""}:
                    </p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {msg.schemes.slice(0, 5).map((scheme) => (
                        <div key={scheme.id} className="transform hover:scale-[1.01] transition-transform">
                          <SchemeCard scheme={scheme} />
                        </div>
                      ))}
                    </div>
                    {msg.schemes.length > 5 && (
                      <p className="text-xs text-gray-500 text-center mt-2 italic">
                        ...and {msg.schemes.length - 5} more scheme{msg.schemes.length - 5 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* Not Relevant Warning */}
                {msg.isRelevant === false && (
                  <div className="mt-2 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      This question is outside my scope. I can only help with Indian government schemes.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-indigo-100 p-4 rounded-2xl rounded-bl-none shadow-md flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">SchemeGPT is thinking...</span>
                    <span className="text-xs text-gray-500">Analyzing your question and searching schemes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-[85%]">
                  <p className="text-xs text-red-800 font-medium">Error: {error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-2 border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about government schemes..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
              <Bot className="w-3 h-3" />
              Powered by GPT • Specialized in Indian Government Schemes
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}


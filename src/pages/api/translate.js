// Translation API with multiple fallback options
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang" });
    }

    // If target language is English, no translation needed
    if (targetLang === "en") {
      return res.status(200).json({ translatedText: text });
    }

    console.log("🌐 Translation request:", { 
      text: text.substring(0, 50), 
      targetLang 
    });

    // Method 1: Try MyMemory Translation API
    const encodedText = encodeURIComponent(text);
    const langMap = {
      hi: "hi",  // Hindi
      te: "te",  // Telugu
      ta: "ta",  // Tamil
      bn: "bn",  // Bengali
    };
    
    const langCode = langMap[targetLang] || targetLang;
    
    // Try MyMemory API
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${langCode}`;
      const response = await fetch(myMemoryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        let translatedText = data.responseData.translatedText.trim();
        translatedText = translatedText.replace(/\s+/g, " ").trim();
        
        // Verify translation actually happened
        if (translatedText.toLowerCase() !== text.toLowerCase() && translatedText.length > 0) {
          console.log("✅ MyMemory translation successful:", {
            original: text.substring(0, 30),
            translated: translatedText.substring(0, 30),
          });
          return res.status(200).json({ translatedText });
        }
      }
    } catch (myMemoryError) {
      console.log("⚠️ MyMemory failed:", myMemoryError.message);
    }

    // Method 2: Try Google Translate via translate.googleapis.com (free, no key needed)
    try {
      const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodedText}`;
      const googleResponse = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      });
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        
        if (googleData && googleData[0] && Array.isArray(googleData[0])) {
          let translatedText = googleData[0]
            .map(item => item[0])
            .filter(Boolean)
            .join('');
          
          translatedText = translatedText.trim();
          
          if (translatedText && translatedText.toLowerCase() !== text.toLowerCase()) {
            console.log("✅ Google Translate successful:", {
              original: text.substring(0, 30),
              translated: translatedText.substring(0, 30),
            });
            return res.status(200).json({ translatedText });
          }
        }
      }
    } catch (googleError) {
      console.log("⚠️ Google Translate failed:", googleError.message);
    }

    // Method 3: Try LibreTranslate with proper error handling
    try {
      const libreUrl = "https://libretranslate.com/translate";
      const libreResponse = await fetch(libreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          q: text.substring(0, 500), // Limit length
          source: "en",
          target: langCode,
          format: "text",
        }),
      });

      if (libreResponse.ok) {
        const contentType = libreResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const libreData = await libreResponse.json();
          if (libreData.translatedText) {
            console.log("✅ LibreTranslate successful:", {
              original: text.substring(0, 30),
              translated: libreData.translatedText.substring(0, 30),
            });
            return res.status(200).json({ translatedText: libreData.translatedText });
          }
        } else {
          console.log("⚠️ LibreTranslate returned non-JSON response");
        }
      }
    } catch (libreError) {
      console.log("⚠️ LibreTranslate failed:", libreError.message);
    }

    // If all methods fail, return original with note
    console.warn("⚠️ All translation methods failed, returning original text");
    return res.status(200).json({ 
      translatedText: text,
      note: "Translation service temporarily unavailable"
    });

  } catch (error) {
    console.error("❌ Translation error:", error.message);
    // Fallback: return original text
    res.status(200).json({ 
      translatedText: req.body.text || "",
      error: "Translation unavailable"
    });
  }
}

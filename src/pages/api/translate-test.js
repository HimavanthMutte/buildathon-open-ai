// Test translation endpoint to verify the setup works
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, targetLang } = req.body;

  console.log("TEST Translation request:", { text, targetLang });

  // Mock translation for testing
  const mockTranslations = {
    hi: (text) => `[HI] ${text}`,
    te: (text) => `[TE] ${text}`,
    ta: (text) => `[TA] ${text}`,
    bn: (text) => `[BN] ${text}`,
  };

  const translatedText = targetLang === "en" 
    ? text 
    : mockTranslations[targetLang] 
    ? mockTranslations[targetLang](text)
    : text;

  res.status(200).json({ translatedText });
}



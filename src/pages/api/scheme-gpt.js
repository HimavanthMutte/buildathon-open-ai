import { connectDB } from "../../../lib/db";
import Scheme from "../../../models/Scheme";
import OpenAI from "openai";

let openai;

// Initialize OpenAI if API key is available
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here") {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Load schemes from JSON as fallback
async function loadSchemesFromJSON() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "data", "schemes.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    return jsonData;
  } catch (error) {
    console.error("❌ Error loading JSON:", error);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, language = "en", conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("🤖 SchemeGPT request:", { message: message.substring(0, 100), language });

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(200).json({
        answer: "SchemeGPT requires OpenAI API key to be configured. Please add your OPENAI_API_KEY to the .env.local file. For now, you can browse schemes using the filters above.",
        schemes: [],
        error: "OPENAI_API_KEY not configured",
      });
    }

    const lowerMessage = message.toLowerCase().trim();

    // Handle greetings naturally
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste", "namaskar"];
    const isGreeting = greetings.some(g => lowerMessage.startsWith(g) && (lowerMessage.length < 20 || lowerMessage.split(" ").length < 5));

    if (isGreeting) {
      return res.status(200).json({
        answer: `Hello! 👋 I'm SchemeGPT, your specialized AI assistant for Indian government schemes. I'm here to help you discover and understand various government welfare programs available across India.\n\nYou can ask me things like:\n• "What schemes are available for farmers?"\n• "Tell me about health schemes in Tamil Nadu"\n• "How do I apply for education scholarships?"\n• "What documents do I need for PM-KISAN?"\n\nWhat would you like to know about government schemes today?`,
        schemes: [],
        isRelevant: true,
        isConversational: true,
      });
    }

    // Load all schemes for context
    let allSchemes = [];
    try {
      await connectDB();
      allSchemes = await Scheme.find({}).lean();
      console.log(`✅ Loaded ${allSchemes.length} schemes from MongoDB`);
    } catch (dbError) {
      console.log("⚠️ MongoDB not available, loading from JSON");
      allSchemes = await loadSchemesFromJSON();
    }

    // Build conversation context
    const conversationContext = conversationHistory.slice(-6).map(msg => 
      `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    ).join("\n");

    // Step 1: Determine intent (simplified - don't rely on GPT for this)
    let needsSchemes = false;
    let searchKeywords = [];
    let mentionedCategory = null;
    let mentionedState = null;

    // Detect if user wants schemes
    if (lowerMessage.includes("scheme") || 
        lowerMessage.includes("show") || 
        lowerMessage.includes("find") || 
        lowerMessage.includes("list") ||
        lowerMessage.includes("available") ||
        lowerMessage.includes("what") && (lowerMessage.includes("for") || lowerMessage.includes("in"))) {
      needsSchemes = true;
    }

    // Extract category
    const categories = {
      "agriculture": "Agriculture",
      "farmer": "Agriculture",
      "farming": "Agriculture",
      "crop": "Agriculture",
      "health": "Health",
      "medical": "Health",
      "hospital": "Health",
      "insurance": "Health",
      "education": "Education",
      "student": "Education",
      "scholarship": "Education",
      "housing": "Housing",
      "house": "Housing",
      "home": "Housing",
      "employment": "Employment",
      "job": "Employment",
      "work": "Employment",
      "skill": "Skill Development",
      "training": "Skill Development",
      "women": "Women & Child",
      "woman": "Women & Child",
      "girl": "Women & Child",
      "pension": "Pension",
      "retirement": "Pension",
    };

    for (const [keyword, category] of Object.entries(categories)) {
      if (lowerMessage.includes(keyword)) {
        mentionedCategory = category;
        searchKeywords.push(keyword);
        needsSchemes = true;
        break;
      }
    }

    // Extract state
    const states = [
      "andhra pradesh", "telangana", "tamil nadu", "karnataka", "kerala", 
      "maharashtra", "gujarat", "rajasthan", "uttar pradesh", "west bengal",
      "madhya pradesh", "bihar", "punjab", "odisha", "assam"
    ];

    for (const state of states) {
      if (lowerMessage.includes(state)) {
        mentionedState = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        needsSchemes = true;
        break;
      }
    }

    // Extract other keywords
    if (!searchKeywords.length) {
      const words = lowerMessage.split(" ").filter(w => w.length > 3);
      searchKeywords = words.slice(0, 3);
    }

    // Step 2: Find relevant schemes if needed
    let relevantSchemes = [];
    
    if (needsSchemes) {
      const query = {};
      
      if (mentionedCategory) {
        query.category = { $regex: mentionedCategory, $options: "i" };
      }
      
      if (mentionedState) {
        query.state = { $regex: mentionedState, $options: "i" };
      }
      
      try {
        await connectDB();
        if (Object.keys(query).length > 0) {
          relevantSchemes = await Scheme.find(query).limit(10).lean();
        } else if (searchKeywords.length > 0) {
          const searchRegex = new RegExp(searchKeywords.join("|"), "i");
          relevantSchemes = await Scheme.find({
            $or: [
              { schemeName: searchRegex },
              { description: searchRegex },
              { benefits: searchRegex },
              { category: searchRegex }
            ]
          }).limit(10).lean();
        } else {
          // General query - return some popular schemes
          relevantSchemes = allSchemes.slice(0, 8);
        }
      } catch (dbError) {
        // Fallback to JSON filtering
        if (mentionedCategory) {
          relevantSchemes = allSchemes.filter(s => 
            s.category.toLowerCase().includes(mentionedCategory.toLowerCase())
          );
        } else if (searchKeywords.length > 0) {
          const searchRegex = new RegExp(searchKeywords.join("|"), "i");
          relevantSchemes = allSchemes.filter(s => 
            searchRegex.test(s.schemeName + " " + s.description)
          );
        } else {
          relevantSchemes = allSchemes.slice(0, 8);
        }
      }
    }

    // Step 3: Generate natural GPT response
    const schemesContext = relevantSchemes.length > 0 
      ? relevantSchemes.map((s, idx) => `
${idx + 1}. ${s.schemeName} (${s.category}, ${s.state})
   Description: ${s.description}
   Eligibility: ${s.eligibility || "See official website"}
   Benefits: ${s.benefits}
   Documents: ${s.documentsRequired?.join(", ") || "Not specified"}
   Apply: ${s.applyLink || "Not available"}
`).join("\n")
      : "";

    const systemPrompt = `You are SchemeGPT, a friendly and knowledgeable AI assistant specialized in Indian government schemes. You have a natural, conversational style like ChatGPT.

PERSONALITY:
- Friendly, warm, and helpful
- Conversational and natural (not robotic)
- Enthusiastic about helping people find schemes
- Clear and easy to understand
- Encouraging and supportive

RULES:
1. Answer in a natural, conversational way (like talking to a friend)
2. Use 4-8 sentences for most responses
3. Be specific and helpful
4. If scheme data is provided, reference it naturally in your response
5. Only mention schemes when they're directly relevant to the question
6. Never use bullet points or numbered lists in the main response (unless listing documents)
7. Flow naturally from topic to topic
8. Be enthusiastic and helpful

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ""}
${schemesContext ? `Available scheme data:\n${schemesContext}\n` : ""}`;

    const userPrompt = `User question: "${message}"

${schemesContext ? `You have ${relevantSchemes.length} relevant scheme(s) available. Reference these naturally in your response if they directly answer the question.` : "Answer the user's question about Indian government schemes naturally and helpfully."}

Provide a natural, conversational response (4-8 sentences) that directly addresses what the user is asking. Be friendly and engaging.`;

    let answer;
    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 700,
      });

      answer = gptResponse.choices[0].message.content.trim();
      console.log("✅ GPT Response generated:", answer.substring(0, 100));

      // Validate GPT response - if it's too generic or error-like, regenerate
      if (answer.length < 50 || answer.toLowerCase().includes("i'd be happy to help") && relevantSchemes.length > 0) {
        console.log("⚠️ GPT response too generic, regenerating...");
        const retryResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt + "\n\nIMPORTANT: Provide a specific, detailed answer. Do not ask generic follow-up questions if you have scheme data." },
            { role: "user", content: userPrompt + "\n\nBe specific and directly answer the question using the scheme data provided." }
          ],
          temperature: 0.8,
          max_tokens: 700,
        });
        answer = retryResponse.choices[0].message.content.trim();
      }

    } catch (gptError) {
      console.error("❌ GPT API Error:", gptError.message, gptError);
      
      // Better fallback based on what we have
      if (relevantSchemes.length > 0) {
        const schemeNames = relevantSchemes.slice(0, 3).map(s => s.schemeName).join(", ");
        answer = `I found ${relevantSchemes.length} government scheme${relevantSchemes.length > 1 ? "s" : ""} that relate to your question. ${schemeNames} ${relevantSchemes.length > 3 ? "and more" : ""} are available. Each scheme has specific details about eligibility, benefits, and application processes. Let me show you the scheme cards below so you can review which ones might work best for your situation.`;
      } else {
        answer = `I'd be happy to help you find information about government schemes! Could you tell me more specifically what you're looking for? For example, are you interested in schemes related to agriculture, health, education, housing, employment, or something else? You can also mention a specific state if you're looking for state-specific programs.`;
      }
    }

    // Determine if we should show schemes
    const shouldShowSchemes = relevantSchemes.length > 0 && (
      needsSchemes || 
      lowerMessage.includes("show") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("list") ||
      lowerMessage.includes("available") ||
      lowerMessage.includes("what") && (lowerMessage.includes("scheme") || lowerMessage.includes("for"))
    );

    return res.status(200).json({
      answer,
      schemes: shouldShowSchemes ? relevantSchemes.map(s => ({
        id: s.id,
        schemeName: s.schemeName,
        category: s.category,
        ministry: s.ministry,
        state: s.state,
        targetGroups: s.targetGroups,
        eligibility: s.eligibility,
        benefits: s.benefits,
        documentsRequired: s.documentsRequired,
        applyLink: s.applyLink,
        description: s.description,
      })) : [],
      isRelevant: true,
    });

  } catch (error) {
    console.error("❌ SchemeGPT API error:", error);
    return res.status(200).json({
      answer: "I apologize, but I'm having some technical difficulties right now. Could you try rephrasing your question? I'm here to help you find information about government schemes in India, so feel free to ask me anything related to that!",
      schemes: [],
      isRelevant: true,
      error: error.message,
    });
  }
}

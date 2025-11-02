import { connectDB } from "../../../lib/db";
import Scheme from "../../../models/Scheme";
import OpenAI from "openai";

let openai;

// Initialize OpenAI only if API key is available
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

// Fallback query handler when GPT is unavailable
async function handleFallbackQuery(message, res) {
  const lowerMessage = message.toLowerCase();
  const filters = {};

  // Simple keyword matching
  if (lowerMessage.includes("farmer") || lowerMessage.includes("agriculture")) {
    filters.category = "Agriculture";
  } else if (lowerMessage.includes("health") || lowerMessage.includes("medical")) {
    filters.category = "Health";
  } else if (lowerMessage.includes("education") || lowerMessage.includes("scholarship") || lowerMessage.includes("student")) {
    filters.category = "Education";
  } else if (lowerMessage.includes("house") || lowerMessage.includes("housing")) {
    filters.category = "Housing";
  } else if (lowerMessage.includes("women") || lowerMessage.includes("woman") || lowerMessage.includes("girl")) {
    filters.targetGroups = ["Women", "Girl Child"];
  }

  // State detection
  const states = ["andhra pradesh", "telangana", "tamil nadu", "karnataka", "kerala", "maharashtra"];
  for (const state of states) {
    if (lowerMessage.includes(state)) {
      filters.state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  try {
    let schemes = [];
    
    try {
      await connectDB();
      const mongoQuery = {};
      if (filters.category) {
        mongoQuery.category = { $regex: filters.category, $options: "i" };
      }
      if (filters.state) {
        mongoQuery.state = { $regex: filters.state, $options: "i" };
      }
      schemes = await Scheme.find(mongoQuery).limit(10).lean();
    } catch (dbError) {
      console.error("❌ MongoDB error:", dbError.message);
    }

    // Fallback to JSON if MongoDB fails
    if (schemes.length === 0) {
      const jsonData = await loadSchemesFromJSON();
      schemes = jsonData.filter(s => {
        if (filters.category && !s.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
        if (filters.state && !s.state.toLowerCase().includes(filters.state.toLowerCase())) return false;
        return true;
      }).slice(0, 10);
    }

    const answer = schemes.length > 0
      ? `I found ${schemes.length} government scheme${schemes.length > 1 ? "s" : ""} matching your query. Here are the details:`
      : `I couldn't find any schemes matching your criteria. Try asking about specific categories like "agriculture", "health", or "education" schemes.`;

    return res.status(200).json({
      answer,
      schemes: schemes.map(s => ({
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
      })),
      isRelevant: true,
      intent: "search schemes",
    });
  } catch (error) {
    console.error("❌ Fallback error:", error);
    return res.status(200).json({
      answer: "I'm having trouble processing your request right now. Please try using the search filters above to search for schemes, or check back later.",
      schemes: [],
      isRelevant: true,
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, language = "en" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("📝 Chat request:", { message: message.substring(0, 100), language });

    // Load all schemes for context
    let allSchemes = [];
    try {
      await connectDB();
      allSchemes = await Scheme.find({}).lean();
    } catch (dbError) {
      console.log("⚠️ MongoDB not available, using JSON");
      allSchemes = await loadSchemesFromJSON();
    }

    // Check if OpenAI is configured
    if (!openai) {
      console.log("⚠️ OpenAI not configured, using fallback");
      return await handleFallbackQuery(message, res);
    }

    // Determine if this is a follow-up question about a specific scheme
    const lowerMessage = message.toLowerCase();
    const isQuestionAboutScheme = allSchemes.some(scheme => 
      lowerMessage.includes(scheme.schemeName.toLowerCase().substring(0, 10)) ||
      lowerMessage.includes(scheme.id.toLowerCase())
    );

    let schemes = [];
    let answer = "";

    if (isQuestionAboutScheme || lowerMessage.includes("eligibility") || lowerMessage.includes("documents") || 
        lowerMessage.includes("benefits") || lowerMessage.includes("how to apply") || lowerMessage.includes("apply")) {
      
      // This is a detailed question about schemes
      // Find relevant schemes first
      let relevantSchemes = [];
      
      // Try to identify specific scheme mentioned
      const mentionedScheme = allSchemes.find(scheme => 
        lowerMessage.includes(scheme.schemeName.toLowerCase().substring(0, 15)) ||
        lowerMessage.includes(scheme.id.toLowerCase())
      );

      if (mentionedScheme) {
        relevantSchemes = [mentionedScheme];
      } else {
        // Extract filters from message
        const systemPrompt = `Extract filters from this message: "${message}"
Return JSON only: {"category": "...", "state": "...", "targetGroups": ["..."]}
Only include if explicitly mentioned.`;

        try {
          const filterResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.1,
            max_tokens: 150,
          });

          const filters = JSON.parse(filterResponse.choices[0].message.content.trim());
          const mongoQuery = {};
          
          if (filters.category) {
            mongoQuery.category = { $regex: filters.category, $options: "i" };
          }
          if (filters.state) {
            mongoQuery.state = { $regex: filters.state, $options: "i" };
          }

          if (Object.keys(mongoQuery).length > 0) {
            try {
              await connectDB();
              relevantSchemes = await Scheme.find(mongoQuery).limit(5).lean();
            } catch (e) {
              // Use JSON fallback
              const jsonData = await loadSchemesFromJSON();
              relevantSchemes = jsonData.filter(s => {
                if (filters.category && !s.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
                if (filters.state && !s.state.toLowerCase().includes(filters.state.toLowerCase())) return false;
                return true;
              }).slice(0, 5);
            }
          } else {
            relevantSchemes = allSchemes.slice(0, 3);
          }
        } catch (e) {
          relevantSchemes = allSchemes.slice(0, 3);
        }
      }

      schemes = relevantSchemes;

      // Generate detailed answer using GPT with full scheme context
      const schemeDetails = relevantSchemes.map(s => `
Scheme: ${s.schemeName}
Category: ${s.category}
State: ${s.state}
Description: ${s.description}
Eligibility: ${s.eligibility}
Benefits: ${s.benefits}
Documents Required: ${s.documentsRequired?.join(", ") || "Not specified"}
Apply Link: ${s.applyLink}
`).join("\n---\n");

      const detailedPrompt = `You are a helpful government schemes assistant in India. The user asked: "${message}"

Here are the relevant scheme details:
${schemeDetails}

Provide a comprehensive, conversational answer that:
1. Directly addresses the user's question
2. Explains eligibility criteria in detail
3. Lists all required documents clearly
4. Describes benefits thoroughly
5. Explains how to apply with the application link
6. Is friendly, helpful, and easy to understand
7. Uses natural, conversational language (not bullet points unless listing documents)
8. If multiple schemes, compare them briefly

Write 4-6 detailed sentences. Be specific and helpful.`;

      try {
        const detailedResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a knowledgeable and friendly government schemes expert in India. You provide detailed, helpful information." },
            { role: "user", content: detailedPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        answer = detailedResponse.choices[0].message.content.trim();
      } catch (error) {
        console.error("❌ Detailed answer error:", error);
        answer = generateFallbackAnswer(relevantSchemes[0] || relevantSchemes, message);
      }

    } else {
      // This is a search/query request - extract filters and find schemes
      const systemPrompt = `You are a helpful assistant for a government schemes portal in India. 
Your job is to:
1. Determine if the user's question is about government schemes in India
2. Extract filters like category, state, targetGroups from their query
3. If the query is not about government schemes, respond with: {"isRelevant": false}
4. If it is relevant, respond with JSON only: {"isRelevant": true, "filters": {"category": "...", "state": "...", "targetGroups": ["..."]}, "intent": "brief description"}

Available categories: Agriculture, Health, Education, Housing, Employment, Women & Child, Skill Development, Entrepreneurship, Microfinance, Financial Inclusion, Energy, Pension, Insurance, Livelihood, Food Security, Infrastructure, Sanitation, Social Security

Return JSON only, no explanation.`;

      let parsedResponse;
      try {
        const gptResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.3,
          max_tokens: 300,
        });

        const gptContent = gptResponse.choices[0].message.content.trim();
        parsedResponse = JSON.parse(gptContent);
      } catch (gptError) {
        console.error("❌ GPT API Error:", gptError.message);
        return await handleFallbackQuery(message, res);
      }

      // Handle irrelevant queries
      if (!parsedResponse.isRelevant) {
        return res.status(200).json({
          answer: "I can only answer questions about government schemes in India. Please ask me about schemes for farmers, women, students, health, housing, or other government welfare programs. For example, you could ask: 'What schemes are available for farmers?' or 'Show me health schemes in Telangana.'",
          schemes: [],
          isRelevant: false,
        });
      }

      // Query with filters
      const filters = parsedResponse.filters || {};
      const mongoQuery = {};

      if (filters.category) {
        mongoQuery.category = { $regex: filters.category, $options: "i" };
      }
      if (filters.state) {
        mongoQuery.state = { $regex: filters.state, $options: "i" };
      }
      if (filters.targetGroups && filters.targetGroups.length > 0) {
        mongoQuery.targetGroups = { 
          $in: filters.targetGroups.map(tg => new RegExp(tg, "i")) 
        };
      }

      try {
        await connectDB();
        schemes = await Scheme.find(mongoQuery).limit(10).lean();
      } catch (dbError) {
        const jsonData = await loadSchemesFromJSON();
        schemes = jsonData.filter(s => {
          if (filters.category && !s.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
          if (filters.state && !s.state.toLowerCase().includes(filters.state.toLowerCase())) return false;
          return true;
        }).slice(0, 10);
      }

      if (schemes.length === 0) {
        return res.status(200).json({
          answer: `I couldn't find any schemes matching your criteria. Try searching with different filters. For example, ask about "agriculture schemes", "health schemes", "education schemes", or mention a specific state like "schemes in Tamil Nadu". You can also use the filters above to browse all available schemes.`,
          schemes: [],
          isRelevant: true,
        });
      }

      // Generate comprehensive answer
      const schemesSummary = schemes.slice(0, 8).map(s => 
        `- **${s.schemeName}**: ${s.description} (Category: ${s.category}, State: ${s.state})`
      ).join("\n");

      const summaryPrompt = `The user asked: "${message}"

I found ${schemes.length} government scheme${schemes.length > 1 ? "s" : ""}:
${schemesSummary}

Write a comprehensive, conversational response (5-8 sentences) that:
1. Enthusiastically introduces the schemes found
2. Briefly explains what each scheme is about
3. Mentions key benefits or purposes
4. Encourages the user to explore more details or ask specific questions
5. Is warm, helpful, and conversational (not robotic)
6. Uses natural language flow (avoid numbered lists)

Write as if you're a knowledgeable friend explaining these schemes.`;

      try {
        const summaryResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a friendly and knowledgeable government schemes expert in India. You provide detailed, conversational explanations." },
            { role: "user", content: summaryPrompt }
          ],
          temperature: 0.7,
          max_tokens: 600,
        });

        answer = summaryResponse.choices[0].message.content.trim();
      } catch (summaryError) {
        console.error("❌ Summary error, using fallback");
        answer = `Great news! I found ${schemes.length} government scheme${schemes.length > 1 ? "s" : ""} that match your query. These schemes are designed to help citizens like you access various government benefits and support. Each scheme has specific eligibility criteria, benefits, and application processes. I've listed them below with their details, so you can review which ones might be relevant for you. Feel free to ask me specific questions about any scheme's eligibility, required documents, benefits, or application process!`;
      }
    }

    return res.status(200).json({
      answer,
      schemes: schemes.map(s => ({
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
      })),
      isRelevant: true,
    });

  } catch (error) {
    console.error("❌ Chat API error:", error);
    return res.status(200).json({ 
      answer: "I apologize, but I'm experiencing technical difficulties right now. Please try using the search filters above to find schemes, or rephrase your question. If the issue persists, feel free to browse all available schemes using the category and state filters.",
      schemes: [],
      isRelevant: true,
      error: error.message,
    });
  }
}

function generateFallbackAnswer(scheme, message) {
  if (!scheme) {
    return "I couldn't find the specific information you're looking for. Please try asking about a specific scheme or use the filters above to browse available schemes.";
  }

  let answer = `The ${scheme.schemeName} is a ${scheme.category} scheme available in ${scheme.state}. `;
  answer += `${scheme.description} `;
  
  if (scheme.eligibility) {
    answer += `To be eligible for this scheme, you need to meet the following criteria: ${scheme.eligibility}. `;
  }
  
  if (scheme.benefits) {
    answer += `The scheme offers the following benefits: ${scheme.benefits}. `;
  }
  
  if (scheme.documentsRequired && scheme.documentsRequired.length > 0) {
    answer += `You'll need to provide the following documents: ${scheme.documentsRequired.join(", ")}. `;
  }
  
  if (scheme.applyLink) {
    answer += `You can apply for this scheme by visiting: ${scheme.applyLink}`;
  }

  return answer;
}

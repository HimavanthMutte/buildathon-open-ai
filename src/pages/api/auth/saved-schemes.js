import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Scheme from "../../../../models/Scheme";
import { getTokenFromCookie, verifyToken } from "../../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get token from cookie
    const token = getTokenFromCookie(req);
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get saved scheme IDs
    const savedSchemeIds = user.savedSchemes || [];

    if (savedSchemeIds.length === 0) {
      return res.status(200).json({
        success: true,
        schemes: [],
        savedSchemeIds: [],
        count: 0,
      });
    }

    // Fetch scheme details from database or fallback to JSON
    let schemes = [];
    try {
      schemes = await Scheme.find({ id: { $in: savedSchemeIds } }).lean();
      // If no schemes found in DB or schemes array is empty, try JSON
      if (!schemes || schemes.length === 0) {
        throw new Error("No schemes in database");
      }
    } catch (dbError) {
      // Fallback to JSON file
      try {
        const fs = await import("fs");
        const path = await import("path");
        const jsonPath = path.join(process.cwd(), "data", "schemes.json");
        const allSchemes = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        schemes = allSchemes.filter(s => savedSchemeIds.includes(s.id));
      } catch (jsonError) {
        console.error("Error loading from JSON:", jsonError);
        schemes = [];
      }
    }

    res.status(200).json({
      success: true,
      schemes: schemes,
      savedSchemeIds: savedSchemeIds, // Also return IDs for quick checking
      count: schemes.length,
    });
  } catch (error) {
    console.error("Get saved schemes error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}


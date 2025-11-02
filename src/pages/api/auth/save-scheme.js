import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { getTokenFromCookie, verifyToken } from "../../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { schemeId } = req.body;

    // Validation
    if (!schemeId) {
      return res.status(400).json({ error: "Scheme ID is required" });
    }

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

    // Find user and add scheme to savedSchemes if not already saved
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize savedSchemes if undefined (for users created before this field was added)
    if (!user.savedSchemes || !Array.isArray(user.savedSchemes)) {
      user.savedSchemes = [];
    }

    // Check if scheme is already saved
    if (user.savedSchemes.includes(schemeId)) {
      return res.status(400).json({ error: "Scheme already saved" });
    }

    // Add scheme to savedSchemes
    user.savedSchemes.push(schemeId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Scheme saved successfully",
      savedSchemes: user.savedSchemes,
    });
  } catch (error) {
    console.error("Save scheme error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}




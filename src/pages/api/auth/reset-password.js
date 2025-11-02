import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, password } = req.body;

    // Validation
    if (!token || !password) {
      return res.status(400).json({ error: "Please provide token and new password" });
    }

    // Clean and validate token
    const cleanToken = String(token).trim();
    if (cleanToken.length < 10) {
      console.error("Token too short:", cleanToken.length);
      return res.status(400).json({ error: "Invalid token format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Connect to database
    await connectDB();

    // Hash the token to compare with stored token
    // Make sure we hash the exact token string (no encoding issues)
    const hashedToken = crypto.createHash("sha256").update(cleanToken, "utf8").digest("hex");
    
    console.log("=== RESET PASSWORD DEBUG ===");
    console.log("Received raw token:", cleanToken);
    console.log("Received token length:", cleanToken.length);
    console.log("Received token (first 20 chars):", cleanToken.substring(0, 20));
    console.log("Received token (last 20 chars):", cleanToken.substring(cleanToken.length - 20));
    console.log("Hashed token (first 20 chars):", hashedToken.substring(0, 20));
    console.log("Full hashed token length:", hashedToken.length);
    
    const now = new Date();
    console.log("Current time:", now.toISOString());

    // Use native MongoDB collection to bypass Mongoose select limitations
    const mongoose = await import("mongoose");
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    
    // First, try to find any user with this token (without expiry check) to see if token exists
    const userWithToken = await usersCollection.findOne({
      resetPasswordToken: hashedToken,
    });
    
    if (!userWithToken) {
      console.log("❌ No user found with this token");
      
      // Debug: Let's check if there are ANY users with reset tokens using native driver
      const allUsersWithTokens = await usersCollection.find({
        resetPasswordToken: { $exists: true, $ne: null }
      }).limit(5).toArray();
      
      console.log("Users with reset tokens in DB:", allUsersWithTokens.length);
      if (allUsersWithTokens.length > 0) {
        console.log("Sample token (first 10 chars):", allUsersWithTokens[0].resetPasswordToken?.substring(0, 10));
        console.log("Sample email:", allUsersWithTokens[0].email);
        console.log("Our searched hash (first 10 chars):", hashedToken.substring(0, 10));
      } else {
        console.log("No users have reset tokens stored in the database!");
      }
      
      return res.status(400).json({ 
        error: "Invalid reset token. Please request a new password reset." 
      });
    }
    
    console.log("✅ User found with token");
    console.log("User email:", userWithToken.email);
    console.log("Token expiry:", userWithToken.resetPasswordExpiry);
    console.log("Token expiry timestamp:", userWithToken.resetPasswordExpiry?.getTime ? userWithToken.resetPasswordExpiry.getTime() : new Date(userWithToken.resetPasswordExpiry).getTime());
    console.log("Current timestamp:", now.getTime());
    
    // Check if token is expired (handle both Date objects and timestamps)
    const expiryTime = userWithToken.resetPasswordExpiry instanceof Date 
      ? userWithToken.resetPasswordExpiry.getTime() 
      : new Date(userWithToken.resetPasswordExpiry).getTime();
    
    console.log("Is expired?", expiryTime < now.getTime());
    
    if (expiryTime < now.getTime()) {
      console.log("❌ Token has expired");
      return res.status(400).json({ 
        error: "Reset token has expired. Please request a new password reset." 
      });
    }
    
    console.log("✅ Token is valid and not expired");
    
    // Get the user document for saving (using Mongoose model)
    const user = await User.findById(userWithToken._id);

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}


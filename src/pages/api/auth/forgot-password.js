import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/auth";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Please provide an email address" });
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Return success message even if user doesn't exist (prevents email enumeration)
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set reset token and expiry (1 hour from now)
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    console.log("=== FORGOT PASSWORD DEBUG ===");
    console.log("User ID:", user._id);
    console.log("User email:", user.email);
    console.log("Setting token (first 10 chars):", hashedToken.substring(0, 10));
    console.log("Setting expiry:", expiryDate.toISOString());
    
    // Use native MongoDB collection to bypass Mongoose schema limitations
    const mongoose = await import("mongoose");
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    
    // Update using native MongoDB driver
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: expiryDate
        }
      }
    );
    
    console.log("Update result:", updateResult);
    
    // Verify using native MongoDB query
    const savedUser = await usersCollection.findOne({ _id: user._id });
    
    if (!savedUser) {
      console.error("❌ Failed to find user after save!");
      return res.status(500).json({ error: "Failed to save reset token" });
    }
    
    console.log("✅ Token saved successfully");
    console.log("Saved token (first 10 chars):", savedUser.resetPasswordToken?.substring(0, 10));
    console.log("Saved expiry:", savedUser.resetPasswordExpiry?.toISOString());
    console.log("Tokens match:", savedUser.resetPasswordToken === hashedToken);
    
    // Additional check - query without select limitations using native driver
    const verifyUser = await usersCollection.findOne({ 
      _id: user._id, 
      resetPasswordToken: hashedToken 
    });
    console.log("Verification query result:", verifyUser ? "Found" : "Not found");

    // In production, send email with reset link
    // For now, return the token (remove this in production and send via email)
    // URL encode the token to ensure special characters are handled correctly
    const encodedToken = encodeURIComponent(resetToken);
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${encodedToken}`;

    // TODO: Send email with resetUrl
    // await sendResetEmail(user.email, resetUrl);

    // For development: return the reset token
    // WARNING: Remove this in production and only send via email
    console.log("=== RESET TOKEN GENERATED ===");
    console.log("Raw Reset Token:", resetToken);
    console.log("Token Length:", resetToken.length);
    console.log("Hashed Token (first 20 chars):", hashedToken.substring(0, 20));
    console.log("Reset URL:", resetUrl);
    console.log("To verify: Hash the raw token with SHA256 and compare with:", hashedToken.substring(0, 20) + "...");

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      // Remove this in production:
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}


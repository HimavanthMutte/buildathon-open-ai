import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_NAME = "auth-token";

/**
 * Generate JWT token for user
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  
  res.setHeader("Set-Cookie", cookie);
}

/**
 * Remove authentication cookie
 */
export function removeAuthCookie(res) {
  const cookie = serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  
  res.setHeader("Set-Cookie", cookie);
}

/**
 * Get token from request cookies
 */
export function getTokenFromCookie(req) {
  const cookies = parse(req.headers.cookie || "");
  return cookies[COOKIE_NAME] || null;
}

/**
 * Middleware to protect routes - use in API routes
 */
export async function requireAuth(req, res) {
  const token = getTokenFromCookie(req);
  
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }
  
  return { userId: decoded.userId };
}





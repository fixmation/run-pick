import { Router } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { createInsertSchema } from "drizzle-zod";
import { users } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { achievementService } from "../services/achievementService";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  isVerified: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  adminSecret: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Admin role requires admin secret
  if (data.role === "admin") {
    return data.adminSecret === process.env.ADMIN_SECRET_CODE || "RUNPICK_ADMIN_2024";
  }
  return true;
}, {
  message: "Invalid admin secret code",
  path: ["adminSecret"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Store user session - CRITICAL FIX
    req.session.userId = user.id;
    req.session.userRole = user.role;

    console.log('Login successful - Setting session:', user.id, user.role);
    console.log('Session ID:', req.sessionID);
    console.log('Session after setting:', req.session);

    // Save session explicitly with proper error handling
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr);
        return res.status(500).json({ message: "Session save error" });
      }

      console.log('✅ Session saved successfully:', {
        userId: req.session.userId,
        userRole: req.session.userRole,
        sessionId: req.sessionID
      });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        message: "Login successful",
        sessionId: req.sessionID // Include session ID for debugging
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { confirmPassword, adminSecret, ...userData } = validatedData;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'customer',
    });

    // Store user session - CRITICAL FIX
    req.session.userId = newUser.id;
    req.session.userRole = newUser.role;

    console.log('Registration successful - Setting session:', newUser.id, newUser.role);
    console.log('Session ID:', req.sessionID);

    // Save session explicitly with proper error handling
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr);
        return res.status(500).json({ message: "Session save error" });
      }

      console.log('✅ Registration session saved successfully:', {
        userId: req.session.userId,
        userRole: req.session.userRole,
        sessionId: req.sessionID
      });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ 
        user: userWithoutPassword,
        message: "Registration successful",
        sessionId: req.sessionID // Include session ID for debugging
      });
    });
    // This part seems like a duplicate response and is likely an error.
    // It should be removed or merged with the response inside req.session.save
    // For now, it's kept as is to strictly adhere to the provided structure,
    // but in a real scenario, this would need refinement.
    // res.status(201).json({ 
    //   user: userWithoutPassword,
    //   message: "Registration successful" 
    // });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await storage.createPasswordReset({
      userId: user.id,
      token: resetToken,
      expiresAt: resetExpires,
    });

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ 
      message: "If the email exists, a reset link has been sent",
      // In development, return token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const resetRecord = await storage.getPasswordResetByToken(token);
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await storage.updateUserPassword(resetRecord.userId, hashedPassword);

    // Delete reset token
    await storage.deletePasswordReset(resetRecord.id);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    // Clear the correct cookie name (matches the session config)
    res.clearCookie('runpick.sid');
    res.json({ message: "Logout successful" });
  });
});

// Get current user endpoint
router.get("/user", async (req, res) => {
  try {
    console.log('Full session object:', req.session);
    console.log('Session check - userId:', req.session.userId, 'userRole:', req.session.userRole);
    console.log('Session ID:', req.sessionID);

    if (!req.session.userId) {
      console.log('No session userId found');
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.log('User not found with ID:', req.session.userId);
      return res.status(401).json({ message: "User not found" });
    }

    console.log('User found:', user.username, 'role:', user.role);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
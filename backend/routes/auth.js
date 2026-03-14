import express from "express";
import User from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authMiddleware,
} from "../middleware/auth.js";
import { loginSchema, registerSchema } from "../config/schemas.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: parsed.error.errors[0]?.message || "Données invalides" });
    }

    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const valid = await comparePassword(parsed.data.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = generateToken(user._id.toString(), user.role);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    const safeUser = user.toJSON();
    delete safeUser.password;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }
    const hashed = await hashPassword(newPassword);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { password: hashed, mustChangePassword: false },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { nom, prenom, telephone } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie" });
});

export default router;

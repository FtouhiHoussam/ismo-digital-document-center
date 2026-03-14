import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import Demande from "../models/Demande.js";
import Message from "../models/Message.js";
import Announcement from "../models/Announcement.js";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
const justificatifsDir = path.join(uploadDir, "justificatifs");

[uploadDir, justificatifsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const justificatifsUpload = multer({
  storage: multer.diskStorage({
    destination: justificatifsDir,
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = express.Router();


router.get("/", authMiddleware, async (req, res) => {
  try {
    const demandes = await Demande.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(demandes.map((d) => d.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post(
  "/",
  authMiddleware,
  justificatifsUpload.array("fichiers", 10),
  async (req, res) => {
    try {
      const type = req.body.type;
      if (!type) return res.status(400).json({ message: "Le type de demande est requis" });

      const files = req.files || [];
      const fichiersJustificatifs = files.map((f) => ({
        nom: f.originalname,
        chemin: `/uploads/justificatifs/${f.filename}`,
        type: f.mimetype,
      }));

      let champsDynamiques = {};
      try {
        champsDynamiques = req.body.champsDynamiques
          ? JSON.parse(req.body.champsDynamiques)
          : {};
      } catch {
        champsDynamiques = {};
      }

      const demande = await Demande.create({
        userId: req.userId,
        type,
        fichiersJustificatifs,
        champsDynamiques,
        commentaireEtudiant: req.body.commentaireEtudiant || null,
      });

      res.json(demande.toJSON());
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

    if (
      demande.userId.toString() !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.json(demande.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/announcements/active", authMiddleware, async (_req, res) => {
  try {
    const announcements = await Announcement.find({ active: true })
      .sort({ createdAt: -1 })
      .populate("authorId", "nom prenom");
    res.json(announcements.map((a) => a.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });
    if (demande.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const messages = await Message.find({ demandeId: req.params.id })
      .sort({ createdAt: 1 })
      .populate("senderId", "nom prenom role");
    res.json(messages.map((m) => m.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Le texte est requis" });

    const demande = await Demande.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });
    if (demande.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const message = await Message.create({
      demandeId: req.params.id,
      senderId: req.userId,
      text,
      isFromAdmin: false,
    });

    res.json(message.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

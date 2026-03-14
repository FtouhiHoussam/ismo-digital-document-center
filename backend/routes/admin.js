import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import Demande from "../models/Demande.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";
import Message from "../models/Message.js";
import Announcement from "../models/Announcement.js";
import { authMiddleware, adminMiddleware, hashPassword } from "../middleware/auth.js";
import { addStudentSchema } from "../config/schemas.js";
import { sendEmail } from "../config/mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
const documentsDir = path.join(uploadDir, "documents");

[uploadDir, documentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const documentUpload = multer({
  storage: multer.diskStorage({
    destination: documentsDir,
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/demandes  — all requests with user info
router.get("/demandes", async (_req, res) => {
  try {
    const demandes = await Demande.find()
      .sort({ createdAt: -1 })
      .populate("userId", "nom prenom matricule email");

    const result = demandes.map((d) => {
      const obj = d.toJSON();
      obj.user = obj.userId || undefined; // populated user lands here
      obj.userId = d.userId?._id?.toString() ?? d.userId?.toString();
      return obj;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/demandes/:id
router.get("/demandes/:id", async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id).populate(
      "userId",
      "nom prenom matricule email"
    );
    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

    const obj = demande.toJSON();
    obj.user = obj.userId || undefined;
    obj.userId = demande.userId?._id?.toString() ?? demande.userId?.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/demandes/:id  — update status / admin comment
router.put("/demandes/:id", async (req, res) => {
  try {
    const { statut, commentaireAdmin } = req.body;
    const updateData = {};

    if (statut) {
      updateData.statut = statut;
      if (statut === "traite" || statut === "rejete") {
        updateData.dateTraitement = new Date();
      }
    }
    if (commentaireAdmin !== undefined) {
      updateData.commentaireAdmin = commentaireAdmin;
    }

    const demande = await Demande.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

    if (statut) {
      const typeStr = statut === "traite" ? "success" : statut === "rejete" ? "warning" : "info";
      await Notification.create({
        userId: demande.userId,
        demandeId: demande._id,
        message: `Le statut de votre demande a été mis à jour: ${statut}`,
        type: typeStr,
      });

      await ActivityLog.create({
        adminId: req.userId,
        action: "update_demande",
        details: `Mise à jour de la demande ${demande._id} -> ${statut}`,
      });

      try {
        const student = await User.findById(demande.userId);
        if (student) {
          const emailSubject = `Mise à jour de votre demande ISMO - ${demande.type}`;
          const emailHtml = `
            <div style="font-family: sans-serif; color: #333;">
              <h2 style="color: #1a2744;">Mise à jour de votre demande ISMO</h2>
              <p>Bonjour ${student.prenom},</p>
              <p>Le statut de votre demande pour <strong>${demande.type}</strong> a été mis à jour.</p>
              <p>Nouveau statut : <span style="font-weight: bold; color: ${statut === 'accepte' ? 'green' : 'red'};">${statut}</span></p>
              <p>Veuillez consulter votre espace pour plus de détails et lire les commentaires éventuels de l'administration.</p>
              <br/>
              <p>Cordialement,<br/>L'équipe ISMO Digital</p>
            </div>
          `;
          await sendEmail(student.email, emailSubject, emailHtml);
        }
      } catch(e) {
        console.log("Email error:", e);
      }
    }

    res.json(demande.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/demandes/:id/document  — upload final document
router.post("/demandes/:id/document", documentUpload.single("document"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

    const demande = await Demande.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          documentFinal: {
            nom: file.originalname,
            chemin: `/uploads/documents/${file.filename}`,
          },
        },
      },
      { new: true }
    );

    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });
    res.json(demande.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/statistiques
router.get("/statistiques", async (_req, res) => {
  try {
    const allDemandes = await Demande.find();

    const byStatus = { en_attente: 0, en_cours: 0, traite: 0, rejete: 0 };
    const byType = {};
    let totalProcessingDays = 0;
    let processedCount = 0;

    // Time-series for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activityTrend = {};

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityTrend[d.toISOString().split("T")[0]] = 0;
    }

    for (const d of allDemandes) {
      byStatus[d.statut] = (byStatus[d.statut] || 0) + 1;
      byType[d.type] = (byType[d.type] || 0) + 1;

      if (d.dateTraitement && d.createdAt) {
        const diff =
          new Date(d.dateTraitement).getTime() - new Date(d.createdAt).getTime();
        totalProcessingDays += diff / (1000 * 60 * 60 * 24);
        processedCount++;
      }

      if (d.createdAt >= thirtyDaysAgo) {
        const dateStr = new Date(d.createdAt).toISOString().split("T")[0];
        if (activityTrend[dateStr] !== undefined) {
          activityTrend[dateStr]++;
        }
      }
    }

    const trendArray = Object.keys(activityTrend).map((date) => ({
      date,
      count: activityTrend[date],
    }));

    res.json({
      total: allDemandes.length,
      byStatus,
      byType,
      trend: trendArray,
      avgProcessingDays:
        processedCount > 0 ? totalProcessingDays / processedCount : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/activity
router.get("/activity", async (_req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("adminId", "nom prenom")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs.map(l => l.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/students
router.get("/students", async (_req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(students.map((s) => s.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/students  — admin creates student account
router.post("/students", async (req, res) => {
  try {
    const parsed = addStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: parsed.error.errors[0]?.message || "Données invalides" });
    }

    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    const user = await User.create({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      password: hashedPassword,
      role: "student",
      mustChangePassword: true,
    });

    const safeUser = user.toJSON();
    delete safeUser.password;

    await ActivityLog.create({
      adminId: req.userId,
      action: "create_student",
      details: `Création du compte étudiant: ${user.prenom} ${user.nom} (${user.matricule})`,
    });

    try {
      const currentPassword = parsed.data.password; // Plain password sent by admin
      const emailSubject = `Bienvenue sur ISMO Digital - Vos informations de connexion`;
      const emailHtml = `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #1a2744;">Bienvenue sur ISMO Digital</h2>
          <p>Bonjour ${user.prenom} ${user.nom},</p>
          <p>Votre compte étudiant a été créé par l'administration.</p>
          <p>Voici vos informations de connexion par défaut :</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Mot de passe:</strong> ${currentPassword}</li>
          </ul>
          <p><em>Note: Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe pour des raisons de sécurité.</em></p>
          <br/>
          <p>Cordialement,<br/>L'équipe ISMO Digital</p>
        </div>
      `;
      await sendEmail(user.email, emailSubject, emailHtml);
    } catch(e) {
      console.log("Email error:", e);
    }

    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
});

// DELETE /api/admin/students/:id
router.delete("/students/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Étudiant non trouvé" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Impossible de supprimer un administrateur" });
    }
    // Cascade: delete user's requests first
    await Demande.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      adminId: req.userId,
      action: "delete_student",
      details: `Suppression du compte étudiant: ${user.prenom} ${user.nom} (${user.matricule})`,
    });

    res.json({ message: "Étudiant supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MESSAGES (ADMIN)
router.get("/demandes/:id/messages", async (req, res) => {
  try {
    const messages = await Message.find({ demandeId: req.params.id })
      .sort({ createdAt: 1 })
      .populate("senderId", "nom prenom role");
    res.json(messages.map((m) => m.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/demandes/:id/messages", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Le texte est requis" });

    const message = await Message.create({
      demandeId: req.params.id,
      senderId: req.userId,
      text,
      isFromAdmin: true,
    });

    // Notify student about admin message
    const demande = await Demande.findById(req.params.id);
    if (demande) {
      await Notification.create({
        userId: demande.userId,
        demandeId: demande._id,
        type: "new_message",
        message: `Nouveau message administratif sur votre demande (${demande.type})`,
      });
    }

    res.json(message.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ANNOUNCEMENTS (ADMIN CRUD)
router.get("/announcements", async (_req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("authorId", "nom prenom role");
    res.json(announcements.map((a) => a.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const { title, content, active } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Titre et contenu requis" });

    const announcement = await Announcement.create({
      title,
      content,
      active: active !== undefined ? active : true,
      authorId: req.userId,
    });
    
    await ActivityLog.create({
      adminId: req.userId,
      action: "create_announcement",
      details: `Création de l'annonce: ${title}`,
    });

    res.json(announcement.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Annonce supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

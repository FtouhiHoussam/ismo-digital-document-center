import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import demandesRoutes from "./routes/demandes.js";
import adminRoutes from "./routes/admin.js";
import notificationsRoutes from "./routes/notifications.js";
import { verifyToken } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");


["uploads/justificatifs", "uploads/documents"].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http:
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} — ${ms}ms`);
    }
  });
  next();
});


app.use("/uploads", (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
});
app.use("/uploads", express.static(uploadDir));


app.use("/api/auth", authRoutes);
app.use("/api/demandes", demandesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);


app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  console.error("Server error:", err);
  res.status(status).json({ message: err.message || "Internal Server Error" });
});


const PORT = parseInt(process.env.PORT || "5000", 10);

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀  Backend running on http:
  });
});

export default app;

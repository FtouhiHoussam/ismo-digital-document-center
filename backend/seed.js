import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Demande from "./models/Demande.js";
import { hashPassword } from "./middleware/auth.js";

async function seedDatabase() {
  await connectDB();

  const count = await User.countDocuments();
  if (count > 0) {
    console.log("ℹ️  Database already seeded. Skipping.");
    await mongoose.disconnect();
    return;
  }

  console.log("🌱 Seeding database...");

 
  const admin = await User.create({
    email: "admin@ismo.ma",
    password: await hashPassword("admin123"),
    role: "admin",
    nom: "Benali",
    prenom: "Ahmed",
    telephone: "+212 661 000 001",
  });

 
  const studentPassword = await hashPassword("student123");

  const student1 = await User.create({
    email: "2001102300461@ofppt-edu.ma",
    password: studentPassword,
    role: "student",
    nom: "El Mansouri",
    prenom: "Fatima Zahra",
    matricule: "2001102300461",
    telephone: "+212 600 111 222",
  });

  const student2 = await User.create({
    email: "2001102300532@ofppt-edu.ma",
    password: studentPassword,
    role: "student",
    nom: "Amrani",
    prenom: "Youssef",
    matricule: "2001102300532",
    telephone: "+212 600 333 444",
  });

  const student3 = await User.create({
    email: "2001102300678@ofppt-edu.ma",
    password: studentPassword,
    role: "student",
    nom: "Idrissi",
    prenom: "Sara",
    matricule: "2001102300678",
    telephone: "+212 600 555 666",
  });

 
  await Demande.create({
    userId: student1._id,
    type: "certificat_scolarite",
    champsDynamiques: { annee_academique: "2024-2025", nombre_exemplaires: "2" },
    commentaireEtudiant: "J'ai besoin de ce certificat pour une demande de bourse.",
  });

  const d2 = await Demande.create({
    userId: student1._id,
    type: "modification_donnees",
    champsDynamiques: {
      champ_a_modifier: "Adresse",
      ancienne_valeur: "123 Rue Hassan II, Casablanca",
      nouvelle_valeur: "45 Avenue Mohammed V, Rabat",
    },
    commentaireEtudiant: "Suite à mon déménagement.",
  });
  await Demande.findByIdAndUpdate(d2._id, {
    statut: "en_cours",
    commentaireAdmin: "Demande en cours de vérification.",
  });

  const d3 = await Demande.create({
    userId: student2._id,
    type: "justification_absence",
    champsDynamiques: {
      date_debut: "15/01/2025",
      date_fin: "20/01/2025",
      motif: "Maladie - Grippe",
    },
    commentaireEtudiant: "Certificat médical joint en pièce jointe.",
  });
  await Demande.findByIdAndUpdate(d3._id, {
    statut: "traite",
    commentaireAdmin: "Absence justifiée. Document traité.",
    dateTraitement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  await Demande.create({
    userId: student2._id,
    type: "resultats_scolaires",
    champsDynamiques: { type_document: "Relevé de notes", semestre: "S1 2024-2025" },
    commentaireEtudiant: "Relevé de notes du premier semestre pour dossier de stage.",
  });

  const d5 = await Demande.create({
    userId: student3._id,
    type: "demande_speciale",
    champsDynamiques: { objet: "Autorisation exceptionnelle pour stage à l'étranger" },
    commentaireEtudiant:
      "Je souhaite effectuer un stage de 3 mois en France. Merci de bien vouloir m'accorder une autorisation.",
  });
  await Demande.findByIdAndUpdate(d5._id, {
    statut: "rejete",
    commentaireAdmin:
      "La demande ne peut être acceptée à cette période. Veuillez soumettre à nouveau en début de semestre.",
    dateTraitement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  await Demande.create({
    userId: student3._id,
    type: "certificat_scolarite",
    champsDynamiques: { annee_academique: "2024-2025", nombre_exemplaires: "1" },
    commentaireEtudiant: "Pour dossier de visa.",
  });

  console.log("✅  Database seeded successfully!");
  console.log("   Admin     : admin@ismo.ma / admin123");
  console.log("   Student   : 2001102300461@ofppt-edu.ma / student123");

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

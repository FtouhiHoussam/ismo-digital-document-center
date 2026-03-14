// Shared constants used by the frontend.
// Keep in sync with backend/config/schemas.js

import { z } from "zod";

export const REQUEST_TYPES = [
  "modification_donnees",
  "certificat_scolarite",
  "justification_absence",
  "demande_speciale",
  "resultats_scolaires",
];

export const STATUTS = ["en_attente", "en_cours", "traite", "rejete"];

export const REQUEST_TYPE_LABELS = {
  modification_donnees: "Modification des données personnelles",
  certificat_scolarite: "Certificat de scolarité",
  justification_absence: "Justification d'absence",
  demande_speciale: "Demande spéciale",
  resultats_scolaires: "Documents résultats scolaires",
};

export const STATUS_LABELS = {
  en_attente: "En attente",
  en_cours: "En cours",
  traite: "Traité",
  rejete: "Refusé",
};

// ── Zod schemas (form validation on the client side) ──────────────────────

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  matricule: z.string().min(1, "Le matricule est requis"),
  telephone: z.string().optional(),
});

export const addStudentSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .refine((email) => email.endsWith("@ofppt-edu.ma"), {
      message: "L'email doit être au format @ofppt-edu.ma",
    }),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  matricule: z.string().min(1, "Le matricule est requis"),
  telephone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const updateDemandeStatusSchema = z.object({
  statut: z.enum(["en_attente", "en_cours", "traite", "rejete"]),
  commentaireAdmin: z.string().optional(),
});

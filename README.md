# ISMO Digital — Centre de Documents Administratifs 🎓📄

Plateforme digitale de gestion et de suivi des documents administratifs pour les stagiaires et les administrateurs de l'Institut Spécialisé dans les Métiers de l'Offshoring (ISMO) Tétouan - OFPPT.

Ce projet a été développé de A à Z avec la stack **MERN** (MongoDB, Express, React, Node.js) pour répondre aux besoins de digitalisation de l'administration.

---

## 🚀 Fonctionnalités Principales

### Pour les Stagiaires 👨‍🎓
- **Tableau de bord interactif** : Suivi en temps réel de l'état des demandes.
- **Demande de documents en ligne** : Attestations de scolarité, relevés de notes, etc.
- **Upload de Fichiers** : Possibilité de joindre plusieurs justificatifs (Images/PDF) à la demande.
- **Messagerie Intégrée** : Communication directe avec l'administration via un espace de chat par demande.
- **Notifications & Annonces** : Réception des annonces officielles de l'administration.

### Pour l'Administration 👨‍💼
- **Gestion des demandes** : Validation, rejet, et traitement des demandes avec commentaires.
- **Statistiques & Graphiques** : Visualisation de l'activité des 30 derniers jours via des graphiques interactifs.
- **Gestion des Stagiaires** : Ajout, modification, et suppression des comptes étudiants.
- **Exportation de Données** : Bouton d'exportation des listes (Demandes et Stagiaires) au format **CSV / Excel**.
- **Envoi d'Emails (Nodemailer)** : Envoi automatique d'emails lors de la création d'un compte ou du changement de statut d'une demande.
- **Tableau d'affichage (Annonces)** : Création et diffusion de notes d'information publiques.

---

## 🛠️ Stack Technique (Technologies Utilisées)

### Frontend (Interface Utilisateur)
- **React 18** avec **Vite** (Rapidité et performance)
- **Tailwind CSS** & **Shadcn UI** (Design moderne et épuré)
- **React Query** (Gestion d'état et mise en cache des APIs)
- **Recharts** (Visualisation de données)
- **Wouter** (Routing léger)

### Backend (Serveur & API)
- **Node.js** & **Express.js** (Architecture REST API)
- **MongoDB** & **Mongoose** (Base de données NoSQL)
- **JWT (JSON Web Tokens)** & **Bcryptjs** (Authentification et sécurité)
- **Multer** (Gestion des uploads de fichiers)
- **Nodemailer** (Intégration d'emails SMTP)

---

## ⚙️ Installation Globale (Local)

### Prérequis
- Node.js (v18+)
- MongoDB (installé localement ou via Atlas)

### 1️⃣ Lancement du Serveur (Backend)

```bash
cd backend
npm install
npm run dev
```
> **Note :** Le serveur API se lance sur `http://localhost:5000`. Assurez-vous de paramétrer le fichier `.env` avec `MONGO_URI` et `JWT_SECRET`.

### 2️⃣ Lancement de l'Application (Frontend)

```bash
cd frontend
npm install
npm run dev
```
> **Note :** L'interface sera accessible sur `http://localhost:5173`.

---

## 🔐 Identifiants par défaut (Admin)

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| Administrateur | `admin@ismo.ma` | `adminpassword` |

---

> Projet réalisé dans le cadre de la digitalisation des processus administratifs de l'ISMO OFPPT.

import mongoose from "mongoose";

const REQUEST_TYPES = [
  "modification_donnees",
  "certificat_scolarite",
  "justification_absence",
  "demande_speciale",
  "resultats_scolaires",
];

const STATUTS = ["en_attente", "en_cours", "traite", "rejete"];

const fichierSchema = new mongoose.Schema(
  {
    nom: String,
    chemin: String,
    type: String,
  },
  { _id: false }
);

const documentFinalSchema = new mongoose.Schema(
  {
    nom: String,
    chemin: String,
  },
  { _id: false }
);

const demandeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: REQUEST_TYPES,
      required: true,
    },
    statut: {
      type: String,
      enum: STATUTS,
      default: "en_attente",
    },
    fichiersJustificatifs: {
      type: [fichierSchema],
      default: [],
    },
    documentFinal: {
      type: documentFinalSchema,
      default: null,
    },
    champsDynamiques: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    commentaireEtudiant: {
      type: String,
      default: null,
    },
    commentaireAdmin: {
      type: String,
      default: null,
    },
    dateTraitement: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString?.() ?? ret.userId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Demande = mongoose.model("Demande", demandeSchema);
export default Demande;

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { REQUEST_TYPE_LABELS } from "@/lib/schema";
import { FilePlus, Upload, X, FileText } from "lucide-react";

const dynamicFieldsByType = {
  modification_donnees: [
    { key: "champ_a_modifier", label: "Champ à modifier", placeholder: "Ex: Adresse, Téléphone, Email..." },
    { key: "ancienne_valeur", label: "Ancienne valeur", placeholder: "Valeur actuelle" },
    { key: "nouvelle_valeur", label: "Nouvelle valeur", placeholder: "Nouvelle valeur souhaitée" },
  ],
  certificat_scolarite: [
    { key: "annee_academique", label: "Année académique", placeholder: "Ex: 2024-2025" },
    { key: "nombre_exemplaires", label: "Nombre d'exemplaires", placeholder: "Ex: 2" },
  ],
  justification_absence: [
    { key: "date_debut", label: "Date de début d'absence", placeholder: "JJ/MM/AAAA" },
    { key: "date_fin", label: "Date de fin d'absence", placeholder: "JJ/MM/AAAA" },
    { key: "motif", label: "Motif de l'absence", placeholder: "Maladie, Raison familiale..." },
  ],
  demande_speciale: [
    { key: "objet", label: "Objet de la demande", placeholder: "Décrivez votre demande spéciale" },
  ],
  resultats_scolaires: [
    { key: "type_document", label: "Type de document", placeholder: "Relevé de notes, Certificat académique..." },
    { key: "semestre", label: "Semestre / Année", placeholder: "Ex: S1 2024-2025" },
  ],
};

export default function NewRequestPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [dynamicFields, setDynamicFields] = useState({});
  const [files, setFiles] = useState([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("commentaireEtudiant", commentaire);
      formData.append("champsDynamiques", JSON.stringify(dynamicFields));
      files.forEach((f) => formData.append("fichiers", f));

      const res = await fetch("/api/demandes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la soumission");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demandes"] });
      toast({ title: "Demande soumise", description: "Votre demande a été envoyée avec succès" });
      setLocation("/my-requests");
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: `${f.name} dépasse 5MB`, variant: "destructive" });
        return false;
      }
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "jpg", "jpeg", "png"].includes(ext || "")) {
        toast({ title: "Format invalide", description: `${f.name}: seuls PDF, JPG, PNG sont acceptés`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const fields = type ? dynamicFieldsByType[type] || [] : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#FCCE2D] rounded-sm" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-new-request-title">Nouvelle demande</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Remplissez le formulaire pour soumettre une nouvelle demande de document</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <h2 className="font-semibold">Informations de la demande</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>Type de demande</Label>
              <Select value={type} onValueChange={(v) => { setType(v); setDynamicFields({}); }} data-testid="select-type">
                <SelectTrigger data-testid="select-type-trigger">
                  <SelectValue placeholder="Sélectionnez un type de demande" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value} data-testid={`select-type-${value}`}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  placeholder={field.placeholder}
                  value={dynamicFields[field.key] || ""}
                  onChange={(e) => setDynamicFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  data-testid={`input-${field.key}`}
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Observation / Commentaire</Label>
              <Textarea
                placeholder="Ajoutez des informations supplémentaires..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid="textarea-comment"
              />
            </div>

            <div className="space-y-2">
              <Label>Fichiers justificatifs</Label>
              <div className="border border-dashed rounded-md p-4">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Cliquez pour ajouter des fichiers</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG - Max 5MB par fichier</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-files"
                  />
                </label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeFile(i)} data-testid={`button-remove-file-${i}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setLocation("/my-requests")} data-testid="button-cancel">
                Annuler
              </Button>
              <Button type="submit" disabled={!type || mutation.isPending} data-testid="button-submit-request">
                <FilePlus className="w-4 h-4 mr-2" />
                {mutation.isPending ? "Envoi..." : "Soumettre la demande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

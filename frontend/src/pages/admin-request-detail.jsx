import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { RequestTypeBadge } from "@/components/request-type-badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, MessageSquare, Calendar, User, Upload, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { STATUS_LABELS } from "@/lib/schema";
import { ChatBox } from "@/components/chat-box";

export default function AdminRequestDetailPage() {
  const [, params] = useRoute("/admin/request/:id");
  const id = params?.id;
  const { toast } = useToast();

  const [newStatus, setNewStatus] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [finalFile, setFinalFile] = useState(null);

  const { data: demande, isLoading } = useQuery({
    queryKey: ["/api/admin/demandes", id],
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/admin/demandes/${id}`, {
        statut: newStatus || undefined,
        commentaireAdmin: adminComment || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demandes", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demandes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistiques"] });
      toast({ title: "Mise à jour réussie", description: "La demande a été mise à jour" });
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!finalFile) return;
      const formData = new FormData();
      formData.append("document", finalFile);
      const res = await fetch(`/api/admin/demandes/${id}/document`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demandes", id] });
      setFinalFile(null);
      toast({ title: "Document envoyé", description: "Le document final a été ajouté" });
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Demande non trouvée</p>
        <Link href="/admin/requests">
          <Button variant="outline" className="mt-4">Retour</Button>
        </Link>
      </div>
    );
  }

  const dynamicFields = demande.champsDynamiques || {};
  const files = demande.fichiersJustificatifs || [];
  const finalDoc = demande.documentFinal;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/requests">
          <Button size="icon" variant="ghost" data-testid="button-admin-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-detail-title">Traitement de la demande</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {demande.createdAt ? format(new Date(demande.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : ""}
          </p>
        </div>
      </div>

      {demande.user && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium" data-testid="text-student-name">{demande.user.prenom} {demande.user.nom}</p>
              <p className="text-xs text-muted-foreground">{demande.user.matricule} - {demande.user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 flex-wrap">
          <RequestTypeBadge type={demande.type} />
          <StatusBadge status={demande.statut} />
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.keys(dynamicFields).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informations</h3>
              <div className="grid gap-2">
                {Object.entries(dynamicFields).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-sm font-medium min-w-[160px] capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {demande.commentaireEtudiant && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaire de l'étudiant
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">{demande.commentaireEtudiant}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Suivi et Discussions
            </h3>
            <ChatBox demandeId={id} isAdmin={true} />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Fichiers justificatifs</h3>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{f.nom}</span>
                    <a href={f.chemin} download={f.nom} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" data-testid={`button-admin-download-${i}`}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finalDoc && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Document final</h3>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm flex-1 font-medium">{finalDoc.nom}</span>
                <a href={finalDoc.chemin} download={finalDoc.nom} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" data-testid="button-admin-download-final">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <h2 className="font-semibold">Actions</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Changer le statut</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger data-testid="select-admin-status">
                <SelectValue placeholder="Sélectionnez un nouveau statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={!newStatus || updateMutation.isPending}
            data-testid="button-admin-update"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Mise à jour..." : "Enregistrer le statut"}
          </Button>

          <div className="border-t pt-5 space-y-3">
            <Label>Envoyer le document final</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex-1">
                <div className="border border-dashed rounded-md p-3 text-center cursor-pointer hover-elevate">
                  <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {finalFile ? finalFile.name : "Cliquez pour sélectionner un fichier"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFinalFile(e.target.files?.[0] || null)}
                    className="hidden"
                    data-testid="input-final-document"
                  />
                </div>
              </label>
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!finalFile || uploadMutation.isPending}
                data-testid="button-upload-final"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

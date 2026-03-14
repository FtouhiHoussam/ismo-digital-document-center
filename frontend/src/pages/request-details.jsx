import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { RequestTypeBadge } from "@/components/request-type-badge";
import { ArrowLeft, Download, FileText, MessageSquare, Calendar, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChatBox } from "@/components/chat-box";

export default function RequestDetailsPage() {
  const [, params] = useRoute("/request/:id");
  const id = params?.id;

  const { data: demande, isLoading } = useQuery({
    queryKey: ["/api/demandes", id],
    enabled: !!id,
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
        <Link href="/my-requests">
          <Button variant="outline" className="mt-4" data-testid="button-back">Retour</Button>
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
        <Link href="/my-requests">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-request-detail-title">Détails de la demande</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Soumise le {demande.createdAt ? format(new Date(demande.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : ""}
          </p>
        </div>
        <div className="ml-auto print-hide">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 flex-wrap">
          <RequestTypeBadge type={demande.type} />
          <StatusBadge status={demande.statut} />
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.keys(dynamicFields).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informations</h3>
              <div className="grid gap-3">
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
                Détails de la demande
              </h3>
              <p className="text-sm bg-muted p-3 rounded-md">{demande.commentaireEtudiant}</p>
            </div>
          )}

          {demande.dateTraitement && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Traité le {format(new Date(demande.dateTraitement), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Suivi et Discussions
            </h3>
            <ChatBox demandeId={id} isAdmin={false} />
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
                      <Button size="icon" variant="ghost" data-testid={`button-download-file-${i}`}>
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
                  <Button size="sm" data-testid="button-download-final">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

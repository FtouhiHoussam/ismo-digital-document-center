import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { RequestTypeBadge } from "@/components/request-type-badge";
import { Link } from "wouter";
import { FilePlus, FolderOpen, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AnnouncementsFeed } from "@/components/announcements-feed";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: demandes, isLoading } = useQuery({
    queryKey: ["/api/demandes"],
  });

  const stats = {
    total: demandes?.length || 0,
    en_attente: demandes?.filter((d) => d.statut === "en_attente").length || 0,
    en_cours: demandes?.filter((d) => d.statut === "en_cours").length || 0,
    traite: demandes?.filter((d) => d.statut === "traite").length || 0,
    rejete: demandes?.filter((d) => d.statut === "rejete").length || 0,
  };

  const recentDemandes = demandes?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="rounded-md bg-[#1a2744] p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-dashboard-title">
              Bonjour, {user?.prenom}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Bienvenue sur votre espace de gestion des documents
            </p>
          </div>
          <Link href="/new-request">
            <Button className="bg-[#FCCE2D] text-[#1a2744] border-[#FCCE2D]" data-testid="button-new-request">
              <FilePlus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </div>

      <AnnouncementsFeed />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En attente" value={stats.en_attente} icon={Clock} color="text-amber-600 dark:text-amber-400" loading={isLoading} />
        <StatCard label="En cours" value={stats.en_cours} icon={Loader2} color="text-blue-600 dark:text-blue-400" loading={isLoading} />
        <StatCard label="Traite" value={stats.traite} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" loading={isLoading} />
        <StatCard label="Refuse" value={stats.rejete} icon={XCircle} color="text-red-600 dark:text-red-400" loading={isLoading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#FCCE2D] rounded-sm" />
            <h2 className="font-semibold">Demandes recentes</h2>
          </div>
          <Link href="/my-requests">
            <Button variant="ghost" size="sm" data-testid="link-view-all">
              <FolderOpen className="w-4 h-4 mr-2" />
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentDemandes.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aucune demande pour le moment</p>
              <Link href="/new-request">
                <Button variant="outline" size="sm" className="mt-3" data-testid="button-create-first">
                  <FilePlus className="w-4 h-4 mr-2" />
                  Creer ma premiere demande
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDemandes.map((d) => (
                <Link key={d.id} href={`/request/${d.id}`}>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-md hover-elevate cursor-pointer flex-wrap" data-testid={`card-request-${d.id}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <RequestTypeBadge type={d.type} />
                      <span className="text-xs text-muted-foreground">
                        {d.createdAt ? format(new Date(d.createdAt), "dd MMM yyyy", { locale: fr }) : ""}
                      </span>
                    </div>
                    <StatusBadge status={d.statut} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <p className="text-2xl font-bold" data-testid={`text-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

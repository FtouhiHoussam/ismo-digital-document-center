import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { RequestTypeBadge } from "@/components/request-type-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/pagination";
import { Link } from "wouter";
import { useState } from "react";
import { FilePlus, FolderOpen, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from "@/lib/schema";

export default function MyRequestsPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["/api/demandes"],
  });

  const filtered = (demandes || []).filter((d) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterStatus !== "all" && d.statut !== filterStatus) return false;
    return true;
  });

  const paginatedDemandes = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleTypeChange = (v) => { setFilterType(v); setCurrentPage(1); };
  const handleStatusChange = (v) => { setFilterStatus(v); setCurrentPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#FCCE2D] rounded-sm" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-my-requests-title">Mes demandes</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Historique et suivi de vos demandes</p>
        </div>
        <Link href="/new-request">
          <Button data-testid="button-new-request">
            <FilePlus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[220px]" data-testid="select-filter-type">
            <SelectValue placeholder="Type de demande" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(REQUEST_TYPE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedDemandes.map((d) => (
                <Link key={d.id} href={`/request/${d.id}`}>
                  <div className="flex items-center justify-between gap-3 p-4 hover-elevate cursor-pointer flex-wrap" data-testid={`card-request-${d.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-wrap">
                      <RequestTypeBadge type={d.type} />
                      <span className="text-xs text-muted-foreground">
                        {d.createdAt ? format(new Date(d.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr }) : ""}
                      </span>
                      {d.commentaireEtudiant && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{d.commentaireEtudiant}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.statut} />
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
        {filtered.length > 0 && (
          <div className="border-t">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

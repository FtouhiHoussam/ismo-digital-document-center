import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { RequestTypeBadge } from "@/components/request-type-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { Link } from "wouter";
import { useState } from "react";
import { ClipboardList, ChevronRight, User, Search, Download } from "lucide-react";
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from "@/lib/schema";
import { exportToCSV } from "@/lib/export";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminRequestsPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["/api/admin/demandes"],
  });

  const filtered = (demandes || []).filter((d) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterStatus !== "all" && d.statut !== filterStatus) return false;
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const nom = d.user?.nom?.toLowerCase() || "";
      const prenom = d.user?.prenom?.toLowerCase() || "";
      const matricule = d.user?.matricule?.toLowerCase() || "";
      if (!nom.includes(q) && !prenom.includes(q) && !matricule.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const paginatedDemandes = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleTypeChange = (v) => { setFilterType(v); setCurrentPage(1); };
  const handleStatusChange = (v) => { setFilterStatus(v); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };

  const handleExport = () => {
    const dataToExport = filtered.map(d => ({
      ID: d.id,
      Etudiant_Nom: d.user?.nom || "N/A",
      Etudiant_Prenom: d.user?.prenom || "N/A",
      Matricule: d.user?.matricule || "N/A",
      Type_Demande: REQUEST_TYPE_LABELS[d.type] || d.type,
      Statut: STATUS_LABELS[d.statut] || d.statut,
      Date_Creation: d.createdAt ? format(new Date(d.createdAt), "dd/MM/yyyy HH:mm") : "",
      Date_Traitement: d.dateTraitement ? format(new Date(d.dateTraitement), "dd/MM/yyyy HH:mm") : ""
    }));
    exportToCSV(`ISMO_Demandes_${format(new Date(), "yyyy-MM-dd")}`, dataToExport);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#FCCE2D] rounded-sm" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-requests-title">Gestion des demandes</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Traitez et gerez les demandes des etudiants</p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, matricule)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={filterType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-admin-filter-type">
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
          <SelectTrigger className="w-[150px]" data-testid="select-admin-filter-status">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedDemandes.map((d) => (
                <Link key={d.id} href={`/admin/request/${d.id}`}>
                  <div className="flex items-center justify-between gap-3 p-4 hover-elevate cursor-pointer flex-wrap" data-testid={`card-admin-request-${d.id}`}>
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <RequestTypeBadge type={d.type} />
                        <StatusBadge status={d.statut} />
                      </div>
                      {d.user && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{d.user.prenom} {d.user.nom}</span>
                          <span>({d.user.matricule})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {d.createdAt ? format(new Date(d.createdAt), "dd MMM yyyy", { locale: fr }) : ""}
                      </span>
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

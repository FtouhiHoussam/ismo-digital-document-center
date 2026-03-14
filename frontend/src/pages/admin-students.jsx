import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Users, Mail, Hash, Phone, Search, Download } from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { format } from "date-fns";

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    matricule: "",
    telephone: "",
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/admin/students"],
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/admin/students", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      toast({ title: "Etudiant ajoute avec succes" });
      setDialogOpen(false);
      setForm({ email: "", password: "", nom: "", prenom: "", matricule: "", telephone: "" });
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/admin/students/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      toast({ title: "Etudiant supprime avec succes" });
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  const filteredStudents = students?.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      s.nom.toLowerCase().includes(q) ||
      s.prenom.toLowerCase().includes(q) ||
      (s.matricule || "").toLowerCase().includes(q)
    );
  });

  const paginatedStudents = filteredStudents?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAutoFillEmail = (matricule) => {
    update("matricule", matricule);
    if (matricule && !form.email) {
      update("email", `${matricule}@ofppt-edu.ma`);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredStudents?.map(s => ({
      ID: s.id,
      Prenom: s.prenom,
      Nom: s.nom,
      Email: s.email,
      Matricule: s.matricule || "N/A",
      Telephone: s.telephone || "N/A",
      Mdp_A_Changer: s.mustChangePassword ? "Oui" : "Non",
      Date_Creation: s.createdAt ? format(new Date(s.createdAt), "dd/MM/yyyy HH:mm") : ""
    })) || [];
    exportToCSV(`ISMO_Etudiants_${format(new Date(), "yyyy-MM-dd")}`, dataToExport);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#FCCE2D] rounded-sm" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-students-title">Gestion des etudiants</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Ajoutez et gerez les comptes etudiants ISMO</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FCCE2D] hover:bg-[#FCCE2D]/90 text-[#1a2744] font-semibold" data-testid="button-add-student">
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un etudiant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un etudiant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prenom">Prenom</Label>
                  <Input
                    id="prenom"
                    value={form.prenom}
                    onChange={(e) => update("prenom", e.target.value)}
                    placeholder="Fatima Zahra"
                    required
                    data-testid="input-student-prenom"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={form.nom}
                    onChange={(e) => update("nom", e.target.value)}
                    placeholder="El Mansouri"
                    required
                    data-testid="input-student-nom"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matricule">Matricule (Code OFPPT)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="matricule"
                    value={form.matricule}
                    onChange={(e) => handleAutoFillEmail(e.target.value)}
                    placeholder="2001102300461"
                    className="pl-10"
                    required
                    data-testid="input-student-matricule"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email OFPPT</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="2001102300461@ofppt-edu.ma"
                    className="pl-10"
                    required
                    data-testid="input-student-email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Minimum 6 caracteres"
                  required
                  data-testid="input-student-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telephone">Telephone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telephone"
                    value={form.telephone}
                    onChange={(e) => update("telephone", e.target.value)}
                    placeholder="+212 600 000 000"
                    className="pl-10"
                    data-testid="input-student-telephone"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a2744] hover:bg-[#1a2744]/90 text-white"
                disabled={addMutation.isPending}
                data-testid="button-submit-student"
              >
                {addMutation.isPending ? "Ajout en cours..." : "Ajouter l'etudiant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou matricule..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10"
            data-testid="input-search-students"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          <Users className="w-3 h-3 mr-1" />
          {students?.length || 0} etudiants
        </Badge>
        <Button variant="outline" onClick={handleExport} disabled={!filteredStudents?.length}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredStudents?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search ? "Aucun etudiant trouve pour cette recherche" : "Aucun etudiant enregistre"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {paginatedStudents?.map((student) => (
              <Card key={student.id} data-testid={`card-student-${student.id}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-md bg-[#1a2744]/10 dark:bg-[#FCCE2D]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-[#1a2744] dark:text-[#FCCE2D]">
                        {(student.prenom?.[0] || "")}{(student.nom?.[0] || "")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`text-student-name-${student.id}`}>
                        {student.prenom} {student.nom}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" data-testid={`text-student-email-${student.id}`}>
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {student.matricule}
                    </Badge>
                    {student.telephone && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">{student.telephone}</span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Supprimer cet etudiant et toutes ses demandes ?")) {
                          deleteMutation.mutate(student.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-student-${student.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredStudents?.length > 0 && (
            <div className="border border-border rounded-md bg-card">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredStudents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

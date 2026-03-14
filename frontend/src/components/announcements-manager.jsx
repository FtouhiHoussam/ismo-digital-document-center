import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AnnouncementsManager() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/announcements", { title, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/demandes/announcements/active"] });
      setOpen(false);
      setTitle("");
      setContent("");
      toast({ title: "Annonce créée" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/demandes/announcements/active"] });
      toast({ title: "Annonce supprimée" });
    },
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#FCCE2D] rounded-sm" />
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            Annonces
          </h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Nouvelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une annonce globale</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Fermeture pendant les vacances..." />
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} placeholder="Détails de l'annonce visibe par tous les étudiants..." />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                Publier l'annonce
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : announcements?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune annonce active.</p>
        ) : (
          <div className="space-y-3">
            {announcements?.map((a) => (
              <div key={a.id} className="p-3 bg-muted rounded-md relative group">
                <p className="font-medium text-sm pr-6">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/70 font-medium">
                  Par {a.authorId?.prenom} {a.authorId?.nom} • {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: fr })}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="w-6 h-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => confirm("Supprimer cette annonce ?") && deleteMutation.mutate(a.id)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

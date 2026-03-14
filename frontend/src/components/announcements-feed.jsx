import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AnnouncementsFeed() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/demandes/announcements/active"],
  });

  if (isLoading) return <Skeleton className="h-32 w-full mb-6" />;
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {announcements.map((a) => (
        <Card key={a.id} className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-primary">{a.title}</h3>
                <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-foreground/70 font-medium">
                  {format(new Date(a.createdAt), "dd MMM yyyy", { locale: fr })}
                </span>
              </div>
              <p className="text-sm mt-1 text-muted-foreground leading-relaxed">{a.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

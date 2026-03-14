import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, User as UserIcon, Shield, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function ChatBox({ demandeId, isAdmin = false }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const endpointUrl = isAdmin
    ? `/api/admin/demandes/${demandeId}/messages`
    : `/api/demandes/${demandeId}/messages`;

  const { data: messages, isLoading } = useQuery({
    queryKey: [endpointUrl],
    enabled: !!demandeId,
    refetchInterval: 10000, // Poll every 10s for new messages
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", endpointUrl, { text });
      return res.json();
    },
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: [endpointUrl] });
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-md bg-card overflow-hidden">
      <div className="bg-muted/50 p-3 border-b flex items-center gap-2 flex-shrink-0">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Discussions</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-[80%] rounded-2xl rounded-tl-sm" />
            <Skeleton className="h-16 w-[80%] ml-auto rounded-2xl rounded-tr-sm" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Aucun message pour le moment.
          </div>
        ) : (
          messages?.map((msg) => {
            const isMine = msg.senderId?._id === user?.id || msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isFromAdmin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {msg.isFromAdmin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {isMine ? "Moi" : `${msg.senderId?.prenom || 'Utilisateur'} ${msg.senderId?.nom || ''}`}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(msg.createdAt), "dd MMM à HH:mm", { locale: fr })}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                      isMine
                        ? "bg-[#1a2744] text-white rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t bg-background flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un message..."
            className="min-h-[40px] h-[40px] max-h-[120px] resize-none py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim() || mutation.isPending}
            className="flex-shrink-0 bg-[#FCCE2D] hover:bg-[#FCCE2D]/90 text-[#1a2744]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

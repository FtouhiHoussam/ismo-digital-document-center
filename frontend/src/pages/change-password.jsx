import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, KeyRound, FileText, ShieldAlert } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ChangePasswordPage() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mots de passe différents",
        description: "Les deux mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");

      toast({
        title: "Mot de passe modifié ✅",
        description: "Vous allez être redirigé vers votre espace.",
      });

     
      await refreshUser();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#243b6e]" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCCE2D] rounded-md flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#1a2744]" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">ISMO Digital</h2>
              <p className="text-white/60 text-xs">Document Center</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="w-14 h-14 bg-[#FCCE2D]/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-[#FCCE2D]" />
            </div>
            <h1 className="text-3xl font-bold leading-tight">
              Sécurisez votre<br />compte
            </h1>
            <p className="text-white/70 text-sm">
              Pour des raisons de sécurité, vous devez définir un mot de passe
              personnel avant d'accéder à votre espace.
            </p>
          </div>

          <p className="text-white/40 text-xs">OFPPT - Institut ISMO Tetouan</p>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {}
          <div className="text-center space-y-2 lg:hidden">
            <div className="mx-auto w-12 h-12 bg-[#1a2744] rounded-md flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#FCCE2D]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ISMO Digital</h1>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Changement de mot de passe
            </h1>
            <p className="text-muted-foreground text-sm">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Au moins 6 caractères"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Répétez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-change-password"
                >
                  {loading ? (
                    <SpinIcon className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <KeyRound className="w-4 h-4 mr-2" />
                  )}
                  Confirmer le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Cette étape est obligatoire pour accéder à votre espace étudiant.
          </p>
        </div>
      </div>
    </div>
  );
}

function SpinIcon({ className }) {
  return (
    <svg className={className} xmlns="http:
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

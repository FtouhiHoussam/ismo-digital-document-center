import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, FileText, Shield, Clock, CheckCircle } from "lucide-react";


export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast({ title: "Erreur de connexion", description: err.message || "Identifiants incorrects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#243b6e]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744]/95 via-[#1e3a5f]/90 to-[#1a2744]/95" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FCCE2D] rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1a2744]" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">ISMO Digital</h2>
                <p className="text-white/60 text-xs">Document Center</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold leading-tight mb-3">
                Centre de gestion des<br />documents administratifs
              </h1>
              <p className="text-white/70 text-sm max-w-md">
                Plateforme digitale pour les demandes de documents et le suivi administratif de l'Institut ISMO Tetouan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <FeatureItem icon={FileText} title="Demandes en ligne" desc="Soumettez vos demandes facilement" />
              <FeatureItem icon={Clock} title="Suivi en temps reel" desc="Suivez l'etat de vos demandes" />
              <FeatureItem icon={Shield} title="Securise" desc="Vos donnees sont protegees" />
              <FeatureItem icon={CheckCircle} title="Rapide" desc="Traitement optimise" />
            </div>
          </div>

          <p className="text-white/40 text-xs">OFPPT - Institut ISMO Tetouan</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2 lg:hidden">
            <div className="mx-auto w-12 h-12 bg-[#1a2744] rounded-md flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#FCCE2D]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-login-title">ISMO Digital</h1>
            <p className="text-muted-foreground text-xs">Centre de gestion des documents administratifs</p>
          </div>

          <div className="hidden lg:block space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-login-title">Connexion</h1>
            <p className="text-muted-foreground text-sm">Connectez-vous a votre espace</p>
          </div>

          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="2001102300461@ofppt-edu.ma"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
                  {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                  Se connecter
                </Button>
              </form>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                Utilisez votre email OFPPT (@ofppt-edu.ma) pour vous connecter
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#FCCE2D]" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-white/50 text-xs">{desc}</p>
    </div>
  );
}

function Loader({ className }) {
  return (
    <svg className={className} xmlns="http:
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

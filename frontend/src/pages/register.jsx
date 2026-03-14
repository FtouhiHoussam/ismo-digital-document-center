import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Phone, Hash, UserPlus, FileText, Shield, Clock, CheckCircle } from "lucide-react";


export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    matricule: "",
    telephone: "",
  });

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);

    } catch (err) {
      toast({ title: "Erreur d'inscription", description: err.message || "Impossible de creer le compte", variant: "destructive" });
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
                Rejoignez la plateforme<br />ISMO Digital
              </h1>
              <p className="text-white/70 text-sm max-w-md">
                Creez votre compte etudiant pour acceder au centre de gestion des documents administratifs.
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
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-register-title">ISMO Digital</h1>
            <p className="text-muted-foreground text-xs">Creer votre compte etudiant</p>
          </div>

          <div className="hidden lg:block space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-register-title">Inscription</h1>
            <p className="text-muted-foreground text-sm">Creez votre compte etudiant</p>
          </div>

          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nom">Nom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="nom" placeholder="Nom" value={form.nom} onChange={(e) => update("nom", e.target.value)} className="pl-10" required data-testid="input-nom" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prenom">Prenom</Label>
                    <Input id="prenom" placeholder="Prenom" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required data-testid="input-prenom" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10" required data-testid="input-email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="matricule">Matricule etudiant</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="matricule" placeholder="EX: STU-2024-001" value={form.matricule} onChange={(e) => update("matricule", e.target.value)} className="pl-10" required data-testid="input-matricule" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telephone">Telephone (optionnel)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="telephone" placeholder="+212 600 000 000" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} className="pl-10" data-testid="input-telephone" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Minimum 6 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-10" required data-testid="input-password" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Deja un compte ?{" "}
                <Link href="/login" className="text-[#1a2744] dark:text-[#FCCE2D] font-medium hover:underline" data-testid="link-login">
                  Se connecter
                </Link>
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

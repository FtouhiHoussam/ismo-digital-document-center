import { Badge } from "@/components/ui/badge";
import { REQUEST_TYPE_LABELS } from "@/lib/schema";
import { UserCog, GraduationCap, Stethoscope, Star, FileText } from "lucide-react";

const typeConfig = {
  modification_donnees: { className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300", icon: UserCog },
  certificat_scolarite: { className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300", icon: GraduationCap },
  justification_absence: { className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", icon: Stethoscope },
  demande_speciale: { className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Star },
  resultats_scolaires: { className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300", icon: FileText },
};

export function RequestTypeBadge({ type }) {
  const config = typeConfig[type] || typeConfig.modification_donnees;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-transparent gap-1 no-default-hover-elevate no-default-active-elevate`}
      data-testid={`type-badge-${type}`}
    >
      <Icon className="w-3 h-3" />
      {REQUEST_TYPE_LABELS[type] || type}
    </Badge>
  );
}

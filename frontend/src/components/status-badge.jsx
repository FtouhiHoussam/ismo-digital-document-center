import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/schema";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

const statusConfig = {
  en_attente: { className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  en_cours: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Loader2 },
  traite: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2 },
  rejete: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.en_attente;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-transparent gap-1 no-default-hover-elevate no-default-active-elevate`}
      data-testid={`status-badge-${status}`}
    >
      <Icon className="w-3 h-3" />
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from "@/lib/schema";
import { TrendingUp, Clock, BarChart3 } from "lucide-react";

const STATUS_COLORS = {
  en_attente: "#f59e0b",
  en_cours: "#3b82f6",
  traite: "#10b981",
  rejete: "#ef4444",
};

const TYPE_COLORS = ["#1a2744", "#FCCE2D", "#3b82f6", "#10b981", "#f43f5e"];

export default function AdminStatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/statistiques"],
  });

  const pieData = stats
    ? Object.entries(stats.byStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || "#94a3b8",
      }))
    : [];

  const barData = stats
    ? Object.entries(stats.byType).map(([key, value]) => ({
        name: (REQUEST_TYPE_LABELS[key] || key),
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#FCCE2D] rounded-sm" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-stats-title">Statistiques</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Analyse detaillee des demandes</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#1a2744]/10 dark:bg-[#FCCE2D]/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-[#1a2744] dark:text-[#FCCE2D]" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-xl font-bold" data-testid="text-total-requests">{stats?.total || 0}</p>}
              <p className="text-xs text-muted-foreground">Total demandes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-xl font-bold" data-testid="text-processed">{(stats?.byStatus?.traite || 0) + (stats?.byStatus?.rejete || 0)}</p>}
              <p className="text-xs text-muted-foreground">Traitées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-xl font-bold" data-testid="text-avg-days">{stats?.avgProcessingDays?.toFixed(1) || "0"} j</p>}
              <p className="text-xs text-muted-foreground">Délai moyen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Répartition par statut</h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Demandes par type</h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

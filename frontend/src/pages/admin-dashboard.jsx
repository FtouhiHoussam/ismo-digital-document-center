import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ClipboardList, Clock, Loader2, CheckCircle2, XCircle, ArrowRight, Users, Activity, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from "@/lib/schema";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnnouncementsManager } from "@/components/announcements-manager";

const STATUS_COLORS = {
  en_attente: "#f59e0b",
  en_cours: "#3b82f6",
  traite: "#10b981",
  rejete: "#ef4444",
};

const TYPE_COLORS = ["#1a2744", "#FCCE2D", "#3b82f6", "#10b981", "#f43f5e"];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/statistiques"],
  });

  const { data: activityLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["/api/admin/activity"],
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
        name: (REQUEST_TYPE_LABELS[key] || key).split(" ").slice(0, 2).join(" "),
        fullName: REQUEST_TYPE_LABELS[key] || key,
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-md bg-[#1a2744] p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-admin-dashboard-title">Administration</h1>
            <p className="text-white/60 text-sm mt-1">Vue d'ensemble des demandes et statistiques</p>
          </div>
          <Link href="/admin/requests">
            <Button className="bg-[#FCCE2D] text-[#1a2744] border-[#FCCE2D]" data-testid="button-view-requests">
              <ClipboardList className="w-4 h-4 mr-2" />
              Voir les demandes
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard label="Total" value={stats?.total} icon={Users} color="text-[#1a2744] dark:text-[#FCCE2D]" loading={isLoading} />
        <AdminStatCard label="En attente" value={stats?.byStatus?.en_attente} icon={Clock} color="text-amber-600 dark:text-amber-400" loading={isLoading} />
        <AdminStatCard label="En cours" value={stats?.byStatus?.en_cours} icon={Loader2} color="text-blue-600 dark:text-blue-400" loading={isLoading} />
        <AdminStatCard label="Traite" value={stats?.byStatus?.traite} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" loading={isLoading} />
        <AdminStatCard label="Refuse" value={stats?.byStatus?.rejete} icon={XCircle} color="text-red-600 dark:text-red-400" loading={isLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#FCCE2D] rounded-sm" />
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Activité des 30 derniers jours
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !stats?.trend || stats.trend.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée récente</p>
              ) : (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a2744" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1a2744" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        tickFormatter={(val) => {
                          const [y, m, d] = val.split('-');
                          return `${d}/${m}`;
                        }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        labelFormatter={(lbl) => formatDistanceToNow(new Date(lbl), { addSuffix: true, locale: fr })}
                        formatter={(val) => [val, "Demandes"]}
                      />
                      <Area type="monotone" dataKey="count" stroke="#1a2744" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FCCE2D] rounded-sm" />
              <h3 className="font-semibold text-sm">Repartition par statut</h3>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucune donnee</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FCCE2D] rounded-sm" />
              <h3 className="font-semibold text-sm">Demandes par type</h3>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : barData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucune donnee</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, _, props) => [value, props.payload.fullName]}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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

          {stats && stats.avgProcessingDays >= 0 && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-medium">Delai moyen de traitement</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-processing">{stats.avgProcessingDays.toFixed(1)} jours</p>
                </div>
                <Link href="/admin/requests">
                  <Button variant="outline" size="sm" data-testid="button-manage">
                    Gerer les demandes
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="h-[300px]">
            <AnnouncementsManager />
          </div>

          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FCCE2D] rounded-sm" />
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Activité récente
                </h3>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {loadingLogs ? (
                <div className="space-y-4 pt-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activityLogs?.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Aucune activité récente
                </div>
              ) : (
                <div className="space-y-5 pt-2 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {activityLogs?.slice(0, 10).map((log) => (
                    <div key={log.id} className="relative flex items-start gap-4 z-10">
                      <div className="w-6 h-6 mt-0.5 rounded-full bg-background border-2 border-[#1a2744] dark:border-[#FCCE2D] flex items-center justify-center shrink-0 shadow-sm z-20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1a2744] dark:bg-[#FCCE2D]" />
                      </div>
                      <div className="space-y-1 bg-muted/30 p-3 rounded-md border text-sm flex-1">
                        <p className="font-semibold text-[#1a2744] dark:text-[#FCCE2D]">{log.adminId?.prenom} {log.adminId?.nom}</p>
                        <p className="text-muted-foreground leading-relaxed">{log.details}</p>
                        <p className="text-xs text-muted-foreground/80 font-medium">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <p className="text-2xl font-bold" data-testid={`text-admin-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { NotificationsProvider, useNotifications } from "@/lib/notifications";
import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import LoginPage from "@/pages/login";
import StudentDashboard from "@/pages/student-dashboard";
import NewRequestPage from "@/pages/new-request";
import MyRequestsPage from "@/pages/my-requests";
import RequestDetailsPage from "@/pages/request-details";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminRequestsPage from "@/pages/admin-requests";
import AdminRequestDetailPage from "@/pages/admin-request-detail";
import AdminStatsPage from "@/pages/admin-stats";
import AdminStudentsPage from "@/pages/admin-students";
import ChangePasswordPage from "@/pages/change-password";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative ml-auto">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
              <Check className="w-3 h-3 mr-1" /> Tout marquer
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 text-sm flex gap-3 transition-colors ${!n.read ? "bg-muted/50" : ""}`}
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.type === "success" ? "bg-emerald-500" : n.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}>{n.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.createdAt && formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="w-6 h-6 flex-shrink-0" onClick={() => markAsRead(n.id)}>
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function AppLayout({ children }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 p-3 border-b sticky top-0 bg-background z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">ISMO Digital</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Document Center</span>
            </div>
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function StudentRoutes() {
  return (
    <Switch>
      <Route path="/" component={StudentDashboard} />
      <Route path="/new-request" component={NewRequestPage} />
      <Route path="/my-requests" component={MyRequestsPage} />
      <Route path="/request/:id" component={RequestDetailsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={StudentDashboard} />
    </Switch>
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/requests" component={AdminRequestsPage} />
      <Route path="/admin/request/:id" component={AdminRequestDetailPage} />
      <Route path="/admin/stats" component={AdminStatsPage} />
      <Route path="/admin/students" component={AdminStudentsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={AdminDashboard} />
    </Switch>
  );
}

function AuthenticatedRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <NotificationsProvider>
      <AppLayout>
        {isAdmin ? <AdminRoutes /> : <StudentRoutes />}
      </AppLayout>
    </NotificationsProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    );
  }

  if (user.mustChangePassword) {
    return <ChangePasswordPage />;
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRouter />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

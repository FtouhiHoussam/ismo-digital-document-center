import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FilePlus,
  FolderOpen,
  BarChart3,
  ClipboardList,
  LogOut,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";

  const studentItems = [
    { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
    { title: "Nouvelle demande", url: "/new-request", icon: FilePlus },
    { title: "Mes demandes", url: "/my-requests", icon: FolderOpen },
  ];

  const adminItems = [
    { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
    { title: "Demandes", url: "/admin/requests", icon: ClipboardList },
    { title: "Etudiants", url: "/admin/students", icon: Users },
    { title: "Statistiques", url: "/admin/stats", icon: BarChart3 },
  ];

  const items = isAdmin ? adminItems : studentItems;

  const initials = user ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase() : "??";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="min-w-0">
            <h2 className="font-bold text-base leading-tight truncate" data-testid="text-app-title">ISMO Digital</h2>
            <p className="text-xs text-sidebar-foreground/50 truncate">Document Center</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Administration" : "Espace Etudiant"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && item.url !== "/admin" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-nav-${item.url.replace(/\
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Avatar className="h-9 w-9 flex-shrink-0 cursor-pointer hover:ring-2 ring-primary/50 transition-all">
              <AvatarFallback className="bg-[#FCCE2D]/20 text-[#FCCE2D] text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href="/profile" className="hover:underline">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">{user?.prenom} {user?.nom}</p>
            </Link>
            <p className="text-xs text-sidebar-foreground/50 truncate">{isAdmin ? "Administrateur" : user?.matricule}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
            title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

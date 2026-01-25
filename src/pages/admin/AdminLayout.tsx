import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  Flag,
  Tag,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuarios", path: "/admin/users" },
  { icon: ListOrdered, label: "Rankings", path: "/admin/rankings" },
  { icon: Flag, label: "Reportes", path: "/admin/reports" },
  { icon: Tag, label: "Categorías", path: "/admin/categories" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:inset-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Sidebar header */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xs font-semibold text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Back to app */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la app
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh-0px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

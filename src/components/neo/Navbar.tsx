import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";

export function Navbar() {
  const { user, profile } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="RunKing"
                className="h-14 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar rankings, usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full h-11 pl-11 pr-4",
                    "bg-white/5 backdrop-blur-sm",
                    "border border-white/10 rounded-full",
                    "text-white placeholder:text-white/40",
                    "focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search - Mobile */}
              <Link to="/search" className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white/70">
                  <Search className="w-5 h-5" />
                </Button>
              </Link>

              {user ? (
                <>
                  {/* Create Ranking Button */}
                  <Link to="/create" className="hidden sm:block">
                    <Button size="default" className="gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Crear</span>
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <Link to="/notifications" className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* Profile */}
                  <Link to="/profile">
                    <Avatar size="default" className="cursor-pointer">
                      {profile?.avatar_url && (
                        <AvatarImage
                          src={profile.avatar_url}
                          alt={profile.display_name || profile.username}
                        />
                      )}
                      <AvatarFallback>
                        {(profile?.display_name || profile?.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white/70">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button>Registrarse</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Bottom Navigation for Mobile
export function BottomNav() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: "home", label: "Inicio" },
    { path: "/search", icon: "search", label: "Buscar" },
    { path: "/create", icon: "plus", label: "Crear" },
    { path: "/notifications", icon: "bell", label: "Notificaciones" },
    {
      path: user ? "/profile" : "/login",
      icon: "user",
      label: "Perfil",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-white/5 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isCreate = item.icon === "plus";

            if (isCreate) {
              return (
                <Link key={item.path} to={item.path} className="-mt-6">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-solar-400 to-solar-600",
                      "shadow-glow-solar",
                      "transition-transform duration-200 active:scale-95"
                    )}
                  >
                    <Plus className="w-7 h-7 text-midnight-300" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3",
                  "transition-colors duration-200",
                  active ? "text-purple-400" : "text-white/50 hover:text-white/70"
                )}
              >
                {item.icon === "home" && (
                  <svg
                    className="w-6 h-6"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}
                {item.icon === "search" && <Search className="w-6 h-6" />}
                {item.icon === "bell" && <Bell className="w-6 h-6" />}
                {item.icon === "user" && <User className="w-6 h-6" />}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

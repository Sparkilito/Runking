import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Grid3x3, Heart, Bookmark, LogOut, Shield, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRankings } from "@/hooks/useRankings";
import { useUserStats, useLikedRankings, useSavedRankings } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Navbar, BottomNav } from "@/components/neo";
import { MiniPodium } from "@/components/neo/Podium";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: rankings, isLoading: rankingsLoading } = useUserRankings(user?.id);
  const { data: likedRankings, isLoading: likedLoading } = useLikedRankings(user?.id);
  const { data: savedRankings, isLoading: savedLoading } = useSavedRankings(user?.id);

  const [activeTab, setActiveTab] = useState<"rankings" | "liked" | "saved">("rankings");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(profile?.display_name || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Sesión cerrada");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: editDisplayName || null,
        bio: editBio || null,
      });

      if (error) {
        toast.error("Error al guardar");
        return;
      }

      toast.success("Perfil actualizado");
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "rankings" as const, label: "Rankings", icon: Grid3x3 },
    { id: "liked" as const, label: "Me gusta", icon: Heart },
    { id: "saved" as const, label: "Guardados", icon: Bookmark },
  ];

  const getCurrentRankings = () => {
    switch (activeTab) {
      case "rankings":
        return { data: rankings, loading: rankingsLoading };
      case "liked":
        return { data: likedRankings, loading: likedLoading };
      case "saved":
        return { data: savedRankings, loading: savedLoading };
    }
  };

  const { data: currentRankings, loading: currentLoading } = getCurrentRankings();

  return (
    <div className="min-h-screen bg-midnight pb-24">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-6 space-y-6">
        {/* Profile Card */}
        <Card variant="glass" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-3 border-purple/50">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-purple text-white text-2xl font-bold">
                  {(profile?.display_name || profile?.username || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-heading font-bold text-white">
                  {profile?.display_name || profile?.username}
                </h2>
                <p className="text-white/60">@{profile?.username}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="text-cyan">
                      <Shield className="w-4 h-4 mr-2" />
                      Panel de Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {profile?.bio && (
            <p className="text-white/70 text-sm mb-4">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex justify-around py-4 border-y border-white/10">
            {statsLoading ? (
              <>
                <Skeleton className="h-12 w-16 bg-white/10" />
                <Skeleton className="h-12 w-16 bg-white/10" />
                <Skeleton className="h-12 w-16 bg-white/10" />
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats?.rankings_count || 0}</p>
                  <p className="text-sm text-white/60">Rankings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats?.followers_count || 0}</p>
                  <p className="text-sm text-white/60">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats?.following_count || 0}</p>
                  <p className="text-sm text-white/60">Siguiendo</p>
                </div>
              </>
            )}
          </div>

          {/* Edit Profile Button */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" className="w-full mt-4 gap-2">
                <Edit3 className="w-4 h-4" />
                Editar perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Editar perfil</DialogTitle>
                <DialogDescription className="text-white/60">
                  Actualiza tu información de perfil
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white/80">Nombre para mostrar</Label>
                  <Input
                    id="displayName"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white/80">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-squircle font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-purple text-white shadow-clay"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Rankings Grid */}
        {currentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="glass" className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-3 w-1/2 bg-white/10" />
              </Card>
            ))}
          </div>
        ) : currentRankings && currentRankings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRankings.map((ranking: any, index: number) => (
              <Card
                key={ranking.id}
                variant="glass"
                className="p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => navigate(`/ranking/${ranking.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Mini Podium Preview */}
                {ranking.items && ranking.items.length >= 3 && (
                  <div className="mb-3">
                    <MiniPodium
                      items={ranking.items.slice(0, 3).map((item: any) => ({
                        position: item.position,
                        title: item.title,
                        imageUrl: item.image_url,
                      }))}
                    />
                  </div>
                )}

                <h3 className="font-bold text-white line-clamp-2 mb-2">
                  {ranking.title}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="category-pill text-xs">
                    {ranking.category_name}
                  </span>
                  <div className="flex items-center gap-3 text-white/60 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {ranking.likes_count}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            {activeTab === "rankings" ? (
              <>
                <Grid3x3 className="w-16 h-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sin rankings aún</h3>
                <p className="text-white/60 mb-4">
                  Crea tu primer ranking y compártelo con el mundo
                </p>
                <Button onClick={() => navigate("/create")}>
                  Crear ranking
                </Button>
              </>
            ) : activeTab === "liked" ? (
              <>
                <Heart className="w-16 h-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sin likes aún</h3>
                <p className="text-white/60">
                  Dale like a los rankings que te gusten
                </p>
              </>
            ) : (
              <>
                <Bookmark className="w-16 h-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sin rankings guardados</h3>
                <p className="text-white/60">
                  Guarda rankings para verlos después
                </p>
              </>
            )}
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

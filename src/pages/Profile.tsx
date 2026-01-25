import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Settings, Grid3x3, Heart, Bookmark, LogOut, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RankingCard } from "@/components/RankingCard";
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: rankings, isLoading: rankingsLoading } = useUserRankings(user?.id);
  const { data: likedRankings, isLoading: likedLoading } = useLikedRankings(user?.id);
  const { data: savedRankings, isLoading: savedLoading } = useSavedRankings(user?.id);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-bold flex-1">Perfil</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4 mr-2" />
                    Panel de Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Profile info */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-black">
              {(profile?.display_name || profile?.username || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {profile?.display_name || profile?.username}
            </h2>
            <p className="text-muted-foreground">@{profile?.username}</p>
            {profile?.bio && (
              <p className="text-sm mt-2 max-w-md mx-auto">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-2">
            {statsLoading ? (
              <>
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats?.rankings_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Rankings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats?.followers_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats?.following_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
              </>
            )}
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground font-semibold shadow-glow">
                Editar perfil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar perfil</DialogTitle>
                <DialogDescription>
                  Actualiza tu información de perfil
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre para mostrar</Label>
                  <Input
                    id="displayName"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="rankings" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="w-4 h-4" />
              Me gusta
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Guardados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="mt-6">
            {rankingsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 p-4 rounded-xl border border-border">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : rankings && rankings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rankings.map((ranking, index) => (
                  <RankingCard
                    key={ranking.id}
                    id={ranking.id}
                    title={ranking.title}
                    author={ranking.author_display_name || ranking.author_username}
                    category={ranking.category_name}
                    likes={ranking.likes_count}
                    comments={ranking.comments_count}
                    onClick={() => navigate(`/ranking/${ranking.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Grid3x3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-bold mb-2">Sin rankings aún</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer ranking y compártelo con el mundo
                </p>
                <Button
                  onClick={() => navigate("/create")}
                  className="bg-gradient-primary text-primary-foreground font-semibold"
                >
                  Crear ranking
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            {likedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 p-4 rounded-xl border border-border">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : likedRankings && likedRankings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedRankings.map((ranking, index) => (
                  <RankingCard
                    key={ranking.id}
                    id={ranking.id}
                    title={ranking.title}
                    author={ranking.author_display_name || ranking.author_username}
                    category={ranking.category_name}
                    likes={ranking.likes_count}
                    comments={ranking.comments_count}
                    onClick={() => navigate(`/ranking/${ranking.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-bold mb-2">Sin likes aún</h3>
                <p className="text-muted-foreground">
                  Dale like a los rankings que te gusten
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {savedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 p-4 rounded-xl border border-border">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : savedRankings && savedRankings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRankings.map((ranking, index) => (
                  <RankingCard
                    key={ranking.id}
                    id={ranking.id}
                    title={ranking.title}
                    author={ranking.author_display_name || ranking.author_username}
                    category={ranking.category_name}
                    likes={ranking.likes_count}
                    comments={ranking.comments_count}
                    onClick={() => navigate(`/ranking/${ranking.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bookmark className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-bold mb-2">Sin rankings guardados</h3>
                <p className="text-muted-foreground">
                  Guarda rankings para verlos después
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;

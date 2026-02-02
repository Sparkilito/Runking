import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings, Grid3x3, Heart, Bookmark, LogOut, Shield, Loader2, Edit3,
  Copy, Share2, Trophy, Award, Users, ChevronRight
} from "lucide-react";
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
import { useProfileGamification, useReferralCode } from "@/hooks/useGamification";
import { toast } from "sonner";
import {
  Navbar, BottomNav, InlineLoader,
  XPProgressBar, StreakCounter, LeagueBadge, BadgeShowcase
} from "@/components/neo";
import { MiniPodium } from "@/components/neo/Podium";
import { cn } from "@/lib/utils";
import { LEVEL_TITLES } from "@/types/database";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: rankings, isLoading: rankingsLoading } = useUserRankings(user?.id);
  const { data: likedRankings, isLoading: likedLoading } = useLikedRankings(user?.id);
  const { data: savedRankings, isLoading: savedLoading } = useSavedRankings(user?.id);

  // Gamification data
  const { gamification, badges, isLoading: gamificationLoading } = useProfileGamification(user?.id);
  const { referralCode, referralLink, referralCount, copyReferralLink, shareReferralLink } = useReferralCode();

  const [activeTab, setActiveTab] = useState<"rankings" | "liked" | "saved" | "badges">("rankings");
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

  const handleCopyReferral = async () => {
    const copied = await copyReferralLink();
    if (copied) {
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handleShareReferral = async () => {
    await shareReferralLink();
  };

  const tabs = [
    { id: "rankings" as const, label: "Rankings", icon: Grid3x3 },
    { id: "liked" as const, label: "Me gusta", icon: Heart },
    { id: "saved" as const, label: "Guardados", icon: Bookmark },
    { id: "badges" as const, label: "Logros", icon: Award },
  ];

  const getCurrentRankings = () => {
    switch (activeTab) {
      case "rankings":
        return { data: rankings, loading: rankingsLoading };
      case "liked":
        return { data: likedRankings, loading: likedLoading };
      case "saved":
        return { data: savedRankings, loading: savedLoading };
      default:
        return { data: [], loading: false };
    }
  };

  const { data: currentRankings, loading: currentLoading } = getCurrentRankings();
  const level = gamification?.level || 1;
  const title = LEVEL_TITLES[Math.min(level, 20)] || "Leyenda";

  return (
    <div className="min-h-screen bg-midnight pb-24">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 pt-24 pb-6 space-y-6">
        {/* Profile Card */}
        <Card variant="glass" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-3 border-purple/50">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-purple text-white text-2xl font-bold">
                    {(profile?.display_name || profile?.username || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Level Badge */}
                {gamification && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-midnight">
                    <span className="text-white text-xs font-bold">{level}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-heading font-bold text-white">
                    {profile?.display_name || profile?.username}
                  </h2>
                  {profile?.is_verified && (
                    <Shield className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-white/60">@{profile?.username}</p>
                {gamification && (
                  <p className="text-sm text-purple-400 font-medium">{title}</p>
                )}
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
                <DropdownMenuItem onClick={() => navigate("/leaderboard")}>
                  <Trophy className="w-4 h-4 mr-2" />
                  Tabla de posiciones
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

          {/* Gamification Stats */}
          {gamification && !gamificationLoading && (
            <div className="mb-4">
              <XPProgressBar
                xpTotal={gamification.xp_total}
                level={gamification.level}
                showDetails={false}
              />
            </div>
          )}

          {/* Stats Row */}
          <div className="flex justify-around py-4 border-y border-white/10">
            {statsLoading || gamificationLoading ? (
              <>
                <Skeleton className="h-12 w-16 bg-white/10" />
                <Skeleton className="h-12 w-16 bg-white/10" />
                <Skeleton className="h-12 w-16 bg-white/10" />
                <Skeleton className="h-12 w-16 bg-white/10" />
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats?.rankings_count || 0}</p>
                  <p className="text-xs text-white/60">Rankings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats?.followers_count || 0}</p>
                  <p className="text-xs text-white/60">Seguidores</p>
                </div>
                {gamification && (
                  <>
                    <div className="text-center">
                      <StreakCounter
                        currentStreak={gamification.current_streak}
                        size="sm"
                        animated={false}
                      />
                    </div>
                    <div className="text-center">
                      <LeagueBadge
                        league={gamification.league}
                        size="sm"
                        showName={false}
                      />
                    </div>
                  </>
                )}
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

        {/* Referral Card */}
        {referralCode && (
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Invita amigos</p>
                  <p className="text-white/50 text-sm">
                    {referralCount} invitado{referralCount !== 1 ? 's' : ''} • +100 XP c/u
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleCopyReferral}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleShareReferral}>
                  <Share2 className="w-4 h-4 mr-1" />
                  Compartir
                </Button>
              </div>
            </div>
            <div className="mt-3 p-2 rounded-lg bg-white/5 flex items-center justify-between">
              <code className="text-purple-400 text-sm font-mono">{referralCode}</code>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-purple text-white shadow-lg shadow-purple/30"
                  : "glass text-white/60 hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on tab */}
        {activeTab === "badges" ? (
          // Badges Tab
          badges && badges.length > 0 ? (
            <BadgeShowcase
              badges={badges}
              columns={3}
              showUnearned={true}
            />
          ) : (
            <Card variant="glass" className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto text-white/30 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sin logros aún</h3>
              <p className="text-white/60">
                Crea rankings y gana XP para desbloquear logros
              </p>
            </Card>
          )
        ) : (
          // Rankings Tabs
          <>
            {currentLoading ? (
              <InlineLoader text="Cargando..." />
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
                        {ranking.category_slug === 'cine' || ranking.category_slug === 'peliculas' ? '🎬' :
                         ranking.category_slug === 'series' ? '📺' :
                         ranking.category_slug === 'libros' ? '📚' : '📋'}{' '}
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
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

import { useParams, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Grid3x3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RankingCard } from "@/components/RankingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUserStats, useIsFollowing, useToggleFollow } from "@/hooks/useProfile";
import { useUserRankings } from "@/hooks/useRankings";
import { toast } from "sonner";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading, error } = useProfile(username, true);
  const { data: stats, isLoading: statsLoading } = useUserStats(profile?.id);
  const { data: rankings, isLoading: rankingsLoading } = useUserRankings(profile?.id);
  const { data: isFollowing } = useIsFollowing(profile?.id);
  const toggleFollow = useToggleFollow();

  const isOwnProfile = user?.id === profile?.id;

  const handleFollow = async () => {
    if (!user) {
      toast.error("Inicia sesión para seguir");
      navigate("/login");
      return;
    }

    if (!profile?.id) return;

    try {
      await toggleFollow.mutateAsync({
        targetUserId: profile.id,
        isFollowing: isFollowing ?? false,
      });
      toast.success(isFollowing ? "Dejaste de seguir" : "Siguiendo");
    } catch (error) {
      toast.error("Error al seguir");
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Logo size="sm" />
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <div className="flex justify-center gap-8 pt-2">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Logo size="sm" />
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Usuario no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            Este usuario no existe
          </p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </main>
      </div>
    );
  }

  // Redirect to own profile page if viewing own profile
  if (isOwnProfile) {
    navigate("/profile", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Profile info */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-black">
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              {profile.display_name || profile.username}
              {profile.is_verified && (
                <span className="text-primary">✓</span>
              )}
            </h2>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && (
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

          <Button
            onClick={handleFollow}
            disabled={toggleFollow.isPending}
            variant={isFollowing ? "outline" : "default"}
            className={!isFollowing ? "bg-gradient-primary text-primary-foreground font-semibold shadow-glow" : ""}
          >
            {toggleFollow.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
              "Siguiendo"
            ) : (
              "Seguir"
            )}
          </Button>
        </div>

        {/* Rankings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Rankings de {profile.display_name || profile.username}</h3>

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
            <div className="text-center py-12">
              <Grid3x3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Este usuario aún no ha creado rankings
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

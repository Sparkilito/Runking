import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Crown, Heart, MessageCircle, Share2, Bookmark, Trophy, RefreshCw, Film, Tv, BookOpen, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar, BottomNav } from "@/components/neo/Navbar";
import { MiniPodium } from "@/components/neo/Podium";
import { InlineLoader, ScoreIndicator } from "@/components/neo";
import { useFeedRankings } from "@/hooks/useRankings";
import { useAuth } from "@/contexts/AuthContext";
import { useInteractions } from "@/hooks/useInteractions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { MediaType } from "@/lib/mediaApi";

// Main media categories for the pivot
const MEDIA_CATEGORIES = [
  { type: 'movie' as MediaType, label: 'Películas', emoji: '🎬', icon: Film, color: 'from-orange-500 to-red-500', slug: 'cine' },
  { type: 'series' as MediaType, label: 'Series', emoji: '📺', icon: Tv, color: 'from-teal-500 to-cyan-500', slug: 'series' },
  { type: 'book' as MediaType, label: 'Libros', emoji: '📚', icon: BookOpen, color: 'from-purple-500 to-pink-500', slug: 'libros' },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: rankings, isLoading, error, refetch } = useFeedRankings("for_you");
  const { toggleLike, toggleSave } = useInteractions();

  // Filter rankings by category if selected
  const filteredRankings = selectedCategory
    ? rankings?.filter((r: any) => r.category_slug === selectedCategory)
    : rankings;

  const handleLike = async (e: React.MouseEvent, rankingId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Inicia sesión para dar like");
      navigate("/login");
      return;
    }
    toggleLike.mutate(rankingId);
  };

  const handleSave = async (e: React.MouseEvent, rankingId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Inicia sesión para guardar");
      navigate("/login");
      return;
    }
    toggleSave.mutate(rankingId);
    toast.success("Guardado");
  };

  const handleShare = async (e: React.MouseEvent, ranking: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}/ranking/${ranking.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: ranking.title, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-midnight pb-24 md:pb-8">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section - Only for guests */}
        {!user && (
          <section className="px-4 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-purple mb-6">
                <Crown className="w-4 h-4 text-solar" />
                <span className="text-sm font-medium text-white/80">
                  Tu crítico interior merece ser escuchado
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Rankea tus{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple to-solar">
                  películas, series y libros
                </span>{" "}
                favoritos
              </h1>
              <p className="text-lg text-white/60 mb-8">
                Crea rankings con puntuaciones, comparte tu opinión y descubre qué están viendo y leyendo los demás.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => navigate("/register")}>
                  <Zap className="w-5 h-5 mr-2" />
                  Comenzar gratis
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories - Main 3 */}
        <section className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {/* All button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all",
                "border-2 whitespace-nowrap",
                !selectedCategory
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
              )}
            >
              <Flame className="w-5 h-5" />
              <span>Todos</span>
            </button>

            {/* Media type buttons */}
            {MEDIA_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.type}
                  onClick={() => setSelectedCategory(isActive ? null : cat.slug)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all",
                    "border-2 whitespace-nowrap",
                    isActive
                      ? `bg-gradient-to-r ${cat.color} border-transparent text-white shadow-lg`
                      : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick Create Cards - For logged in users */}
        {user && (
          <section className="max-w-screen-xl mx-auto px-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              {MEDIA_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    onClick={() => navigate("/create")}
                    className={cn(
                      "p-4 rounded-2xl text-center transition-all",
                      "bg-gradient-to-br opacity-80 hover:opacity-100",
                      "hover:scale-105 active:scale-95",
                      cat.color
                    )}
                  >
                    <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm font-medium">
                      Rankear {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Feed */}
        <section className="max-w-screen-xl mx-auto px-4 py-4">
          {/* Feed header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {selectedCategory
                  ? MEDIA_CATEGORIES.find(c => c.slug === selectedCategory)?.label || 'Rankings'
                  : 'Rankings recientes'}
              </h2>
              <p className="text-sm text-white/50">
                {selectedCategory
                  ? `Los mejores rankings de ${MEDIA_CATEGORIES.find(c => c.slug === selectedCategory)?.label.toLowerCase()}`
                  : 'Descubre lo que la comunidad está rankeando'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-white/50"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <InlineLoader text="Cargando rankings..." />
          )}

          {/* Error state */}
          {error && (
            <Card variant="glass" className="p-8 text-center">
              <p className="text-white/60 mb-4">Error al cargar los rankings</p>
              <Button onClick={() => refetch()} variant="secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredRankings?.length === 0 && (
            <Card variant="glass" className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple/20 to-solar/20 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-solar" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                {selectedCategory
                  ? "No hay rankings en esta categoría"
                  : "No hay rankings todavía"}
              </h3>
              <p className="text-white/60 mb-6">
                {user ? "¡Sé el primero en crear uno!" : "Inicia sesión para crear tu propio ranking"}
              </p>
              <Button onClick={() => navigate(user ? "/create" : "/login")}>
                <Plus className="w-4 h-4 mr-2" />
                {user ? "Crear Ranking" : "Iniciar Sesión"}
              </Button>
            </Card>
          )}

          {/* Rankings feed */}
          {!isLoading && !error && filteredRankings && filteredRankings.length > 0 && (
            <div className="space-y-4">
              {filteredRankings.map((ranking: any, index: number) => (
                <Card
                  key={ranking.id}
                  variant="glass"
                  className="overflow-hidden cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/ranking/${ranking.id}`)}
                >
                  {/* Author Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-purple/30">
                        <AvatarImage src={ranking.author_avatar_url} />
                        <AvatarFallback className="bg-purple/50 text-white">
                          {(ranking.author_display_name || ranking.author_username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {ranking.author_display_name || ranking.author_username}
                        </p>
                        <p className="text-sm text-white/50">
                          {formatDistanceToNow(new Date(ranking.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      {/* Category badge with emoji */}
                      <span className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium",
                        "bg-white/10 text-white/80"
                      )}>
                        {ranking.category_slug === 'cine' || ranking.category_slug === 'peliculas' ? '🎬' :
                         ranking.category_slug === 'series' ? '📺' :
                         ranking.category_slug === 'libros' ? '📚' : '📋'}{' '}
                        {ranking.category_name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-heading font-bold text-white mb-3">
                      {ranking.title}
                    </h3>

                    {/* Mini Podium Preview */}
                    {ranking.items && ranking.items.length >= 3 && (
                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Trophy className="w-4 h-4 text-solar" />
                          <span className="text-sm font-medium text-white/70">Top 3</span>
                        </div>
                        <MiniPodium
                          items={ranking.items.slice(0, 3).map((item: any) => ({
                            position: item.position,
                            title: item.title,
                            imageUrl: item.image_url,
                            score: item.score,
                          }))}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-2 hover:bg-red-400/10",
                          ranking.is_liked ? "text-red-400" : "text-white/60 hover:text-red-400"
                        )}
                        onClick={(e) => handleLike(e, ranking.id)}
                      >
                        <Heart className="w-5 h-5" fill={ranking.is_liked ? "currentColor" : "none"} />
                        <span>{ranking.likes_count}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-white/60 hover:text-cyan hover:bg-cyan/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ranking/${ranking.id}`);
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{ranking.comments_count}</span>
                      </Button>

                      <div className="flex-1" />

                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "hover:bg-purple/10",
                          ranking.is_saved ? "text-purple" : "text-white/60 hover:text-purple"
                        )}
                        onClick={(e) => handleSave(e, ranking.id)}
                      >
                        <Bookmark className="w-5 h-5" fill={ranking.is_saved ? "currentColor" : "none"} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-solar hover:bg-solar/10"
                        onClick={(e) => handleShare(e, ranking)}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Create Button - Desktop */}
      {user && (
        <Link
          to="/create"
          className={cn(
            "fixed bottom-8 right-8 z-40 hidden md:flex",
            "w-16 h-16 rounded-full",
            "bg-gradient-to-br from-solar to-solar/80",
            "shadow-lg shadow-solar/30",
            "items-center justify-center",
            "transition-transform duration-200 hover:scale-110 active:scale-95"
          )}
        >
          <Plus className="w-7 h-7 text-midnight" />
        </Link>
      )}

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default Home;

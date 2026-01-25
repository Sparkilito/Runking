import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, TrendingUp, RefreshCw, Plus, Flame, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, BottomNav } from "@/components/neo/Navbar";
import { RankingCard, RankingCardSkeleton } from "@/components/neo/RankingCard";
import { useFeedRankings } from "@/hooks/useRankings";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { useInteractions } from "@/hooks/useInteractions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"for_you" | "trending">("for_you");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: rankings, isLoading, error, refetch } = useFeedRankings(activeTab);
  const { data: categories } = useCategories();
  const { toggleLike, toggleSave } = useInteractions();

  // Filter rankings by category if selected
  const filteredRankings = selectedCategory
    ? rankings?.filter((r) => r.category_slug === selectedCategory)
    : rankings;

  const handleLike = async (rankingId: string) => {
    if (!user) {
      toast.error("Inicia sesión para dar like");
      navigate("/login");
      return;
    }
    toggleLike.mutate(rankingId);
  };

  const handleSave = async (rankingId: string) => {
    if (!user) {
      toast.error("Inicia sesión para guardar");
      navigate("/login");
      return;
    }
    toggleSave.mutate(rankingId);
  };

  const handleShare = async (rankingId: string, title: string) => {
    const url = `${window.location.origin}/ranking/${rankingId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section - Only for guests */}
        {!user && (
          <section className="px-4 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-purple mb-6">
                <Crown className="w-4 h-4 text-solar-400" />
                <span className="text-sm font-medium text-white/80">
                  La app #1 de rankings
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Crea y comparte{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-solar-400">
                  tus rankings
                </span>
              </h1>
              <p className="text-lg text-white/60 mb-8">
                Descubre los mejores rankings de películas, música, restaurantes y
                mucho más. Crea tu propio Top y compártelo con el mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => navigate("/register")}>
                  <Plus className="w-5 h-5 mr-2" />
                  Comenzar ahora
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories Scroll */}
        <section className="px-4 py-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 max-w-screen-xl mx-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "category-pill whitespace-nowrap",
                !selectedCategory && "active"
              )}
            >
              <Flame className="w-4 h-4 inline mr-1" />
              Todos
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "category-pill whitespace-nowrap",
                  selectedCategory === cat.slug && "active"
                )}
                style={{
                  borderColor:
                    selectedCategory === cat.slug
                      ? `${cat.color}50`
                      : undefined,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <section className="sticky top-16 z-30 glass-strong border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("for_you")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4",
                  "border-b-2 transition-all duration-200",
                  "font-heading font-semibold",
                  activeTab === "for_you"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                )}
              >
                <Sparkles className="w-4 h-4" />
                Para Ti
              </button>
              <button
                onClick={() => setActiveTab("trending")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4",
                  "border-b-2 transition-all duration-200",
                  "font-heading font-semibold",
                  activeTab === "trending"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="max-w-screen-xl mx-auto px-4 py-6">
          {/* Feed header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-white/50">
              {activeTab === "for_you"
                ? "Rankings de usuarios que sigues y contenido recomendado"
                : "Rankings más populares de los últimos 7 días"}
              {selectedCategory && (
                <span className="text-purple-400">
                  {" "}
                  · {categories?.find((c) => c.slug === selectedCategory)?.name}
                </span>
              )}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-white/50"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <RankingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16">
              <div className="glass rounded-squircle-xl p-8 max-w-md mx-auto">
                <p className="text-white/60 mb-4">
                  Error al cargar los rankings
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredRankings?.length === 0 && (
            <div className="text-center py-16">
              <div className="glass rounded-squircle-xl p-8 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-solar-500/20 flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-solar-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {selectedCategory
                    ? "No hay rankings en esta categoría"
                    : "No hay rankings todavía"}
                </h3>
                <p className="text-white/60 mb-6">
                  {user
                    ? "¡Sé el primero en crear uno!"
                    : "Inicia sesión para crear tu propio ranking"}
                </p>
                <Button onClick={() => navigate(user ? "/create" : "/login")}>
                  <Plus className="w-4 h-4 mr-2" />
                  {user ? "Crear Ranking" : "Iniciar Sesión"}
                </Button>
              </div>
            </div>
          )}

          {/* Rankings grid */}
          {!isLoading && !error && filteredRankings && filteredRankings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRankings.map((ranking, index) => (
                <div
                  key={ranking.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in opacity-0"
                >
                  <RankingCard
                    ranking={{
                      id: ranking.id,
                      title: ranking.title,
                      description: ranking.description || undefined,
                      category: ranking.category_name
                        ? {
                            name: ranking.category_name,
                            color: ranking.category_color || undefined,
                            slug: ranking.category_slug || "",
                          }
                        : undefined,
                      author: {
                        id: ranking.author_id,
                        username: ranking.author_username,
                        display_name: ranking.author_display_name || undefined,
                        avatar_url: ranking.author_avatar_url || undefined,
                      },
                      items:
                        ranking.items?.map((item: any) => ({
                          id: item.id,
                          title: item.title,
                          image_url: item.image_url,
                        })) || [],
                      likes_count: ranking.likes_count,
                      comments_count: ranking.comments_count,
                      is_liked: ranking.is_liked,
                      is_saved: ranking.is_saved,
                      created_at: ranking.created_at,
                    }}
                    onLike={() => handleLike(ranking.id)}
                    onSave={() => handleSave(ranking.id)}
                    onShare={() => handleShare(ranking.id, ranking.title)}
                  />
                </div>
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
            "bg-gradient-to-br from-solar-400 to-solar-600",
            "shadow-glow-solar",
            "items-center justify-center",
            "transition-transform duration-200 hover:scale-110 active:scale-95"
          )}
        >
          <Plus className="w-7 h-7 text-midnight-300" />
        </Link>
      )}

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default Home;

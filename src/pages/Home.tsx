import { RankingCard } from "@/components/RankingCard";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeedRankings } from "@/hooks/useRankings";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"for_you" | "trending">("for_you");

  const { data: rankings, isLoading, error, refetch } = useFeedRankings(activeTab);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          {!user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className={`flex-1 gap-2 rounded-none border-b-2 transition-colors ${
                activeTab === "for_you"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("for_you")}
            >
              <Sparkles className="w-4 h-4" />
              Para Ti
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 gap-2 rounded-none border-b-2 transition-colors ${
                activeTab === "trending"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("trending")}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeTab === "for_you"
                ? "Rankings de usuarios que sigues y contenido recomendado"
                : "Rankings más populares de los últimos 7 días"}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3 p-4 rounded-xl border border-border">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Error al cargar los rankings
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && rankings?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No hay rankings todavía.
                {user ? " ¡Sé el primero en crear uno!" : " Inicia sesión para crear el tuyo."}
              </p>
              <Button
                onClick={() => navigate(user ? '/create' : '/login')}
                className="bg-gradient-primary"
              >
                {user ? "Crear Ranking" : "Iniciar Sesión"}
              </Button>
            </div>
          )}

          {/* Rankings grid */}
          {!isLoading && !error && rankings && rankings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankings.map((ranking, index) => (
                <RankingCard
                  key={ranking.id}
                  id={ranking.id}
                  title={ranking.title}
                  author={ranking.author_display_name || ranking.author_username}
                  authorAvatar={ranking.author_avatar_url || undefined}
                  category={ranking.category_name}
                  likes={ranking.likes_count}
                  comments={ranking.comments_count}
                  coverImage={ranking.cover_image || undefined}
                  onClick={() => navigate(`/ranking/${ranking.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

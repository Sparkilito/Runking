import { RankingCard } from "@/components/RankingCard";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_RANKINGS = [
  {
    id: "1",
    title: "Mejores Restaurantes de Madrid 2024",
    author: "Ana García",
    category: "Gastronomía",
    likes: 234,
    comments: 45,
    isLiked: false,
  },
  {
    id: "2",
    title: "Top 10 Películas de Ciencia Ficción",
    author: "Carlos Ruiz",
    category: "Cine",
    likes: 567,
    comments: 89,
    isLiked: true,
  },
  {
    id: "3",
    title: "Mejores Álbumes de Rock Alternativo",
    author: "María López",
    category: "Música",
    likes: 892,
    comments: 156,
    isLiked: false,
  },
  {
    id: "4",
    title: "Equipos de Fútbol Más Grandes de la Historia",
    author: "Juan Martínez",
    category: "Deportes",
    likes: 1234,
    comments: 234,
    isLiked: true,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"foryou" | "trending">("foryou");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className={`flex-1 gap-2 rounded-none border-b-2 transition-colors ${
                activeTab === "foryou"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("foryou")}
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
        {activeTab === "foryou" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rankings de usuarios que sigues y contenido recomendado
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_RANKINGS.map((ranking, index) => (
                <RankingCard
                  key={ranking.id}
                  {...ranking}
                  onClick={() => navigate(`/ranking/${ranking.id}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "trending" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rankings más populares de los últimos 7 días
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_RANKINGS.sort((a, b) => b.likes - a.likes).map(
                (ranking, index) => (
                  <RankingCard
                    key={ranking.id}
                    {...ranking}
                    onClick={() => navigate(`/ranking/${ranking.id}`)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, X, Heart, Users } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useSearchRankings } from "@/hooks/useRankings";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { Navbar, BottomNav, InlineLoader } from "@/components/neo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

// Map icon names to emojis
const categoryEmojis: Record<string, string> = {
  "utensils": "🍽️",
  "film": "🎬",
  "music": "🎵",
  "trophy": "🏆",
  "laptop": "💻",
  "plane": "✈️",
  "book-open": "📚",
  "tv": "📺",
  "gamepad-2": "🎮",
  "palette": "🎨",
};

// Search users hook
function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: query.length > 0,
  });
}

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"rankings" | "users">("rankings");

  const debouncedQuery = useDebounce(query, 300);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: rankingResults, isLoading: rankingsLoading } = useSearchRankings(
    debouncedQuery,
    selectedCategorySlug || undefined
  );
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(debouncedQuery);

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  const showResults = debouncedQuery.length > 0 || selectedCategorySlug;
  const results = searchType === "rankings" ? rankingResults : userResults;
  const isLoading = searchType === "rankings" ? rankingsLoading : usersLoading;

  return (
    <div className="min-h-screen bg-midnight pb-24">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 pt-24 pb-6 space-y-6">
        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            placeholder="Buscar rankings, usuarios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search type toggle */}
        <div className="flex gap-2">
          <Button
            variant={searchType === "rankings" ? "default" : "secondary"}
            onClick={() => setSearchType("rankings")}
            className="flex-1"
          >
            Rankings
          </Button>
          <Button
            variant={searchType === "users" ? "default" : "secondary"}
            onClick={() => setSearchType("users")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
        </div>

        {/* Categories - Only show for rankings */}
        {searchType === "rankings" && (
          <div>
            <h2 className="text-sm font-semibold text-white/50 mb-3">
              CATEGORÍAS
            </h2>
            {categoriesLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full bg-white/10" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories?.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      setSelectedCategorySlug(
                        selectedCategorySlug === category.slug ? null : category.slug
                      )
                    }
                    className={cn(
                      "category-pill transition-all",
                      selectedCategorySlug === category.slug
                        ? "bg-purple text-white"
                        : ""
                    )}
                  >
                    {categoryEmojis[category.icon] || "📋"} {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!showResults && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple/20 to-solar/20 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Explora rankings</h3>
            <p className="text-white/60">
              Busca por texto o selecciona una categoría
            </p>
          </div>
        )}

        {/* Loading state */}
        {showResults && isLoading && (
          <InlineLoader text="Buscando..." />
        )}

        {/* Search results */}
        {showResults && !isLoading && results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">
                {results.length} resultado{results.length !== 1 && "s"}
                {debouncedQuery && (
                  <span> para "<span className="font-semibold text-white">{debouncedQuery}</span>"</span>
                )}
              </p>
              {(debouncedQuery || selectedCategorySlug) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategorySlug(null);
                  }}
                  className="text-white/50"
                >
                  Limpiar
                </Button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-3">
                {searchType === "rankings" ? (
                  // Rankings results
                  (results as any[]).map((ranking, index) => (
                    <Card
                      key={ranking.id}
                      variant="glass"
                      className="p-4 cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/ranking/${ranking.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-purple/30">
                          <AvatarImage src={ranking.author_avatar_url} />
                          <AvatarFallback className="bg-purple/50 text-white">
                            {(ranking.author_display_name || ranking.author_username || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{ranking.title}</h3>
                          <p className="text-sm text-white/60">
                            por {ranking.author_display_name || ranking.author_username}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="category-pill text-xs">
                            {ranking.category_name}
                          </span>
                          <span className="flex items-center gap-1 text-white/50 text-sm">
                            <Heart className="w-3.5 h-3.5" />
                            {ranking.likes_count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  // Users results
                  (results as any[]).map((user, index) => (
                    <Card
                      key={user.id}
                      variant="glass"
                      className="p-4 cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/user/${user.username}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-2 border-purple/30">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-purple/50 text-white text-lg">
                            {(user.display_name || user.username || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">
                            {user.display_name || user.username}
                          </h3>
                          <p className="text-sm text-white/60">@{user.username}</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Ver perfil
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card variant="glass" className="p-12 text-center">
                <SearchIcon className="w-16 h-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-white/60">
                  Intenta con otros términos de búsqueda
                </p>
              </Card>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Search;

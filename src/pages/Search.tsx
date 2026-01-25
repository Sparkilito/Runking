import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { RankingCard } from "@/components/RankingCard";
import { Search as SearchIcon, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useSearchRankings } from "@/hooks/useRankings";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: results, isLoading: resultsLoading } = useSearchRankings(
    debouncedQuery,
    selectedCategorySlug || undefined
  );

  const showResults = debouncedQuery.length > 0 || selectedCategorySlug;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-bold">Buscar</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar rankings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            CATEGORÍAS POPULARES
          </h2>
          {categoriesLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategorySlug(
                      selectedCategorySlug === category.slug ? null : category.slug
                    )
                  }
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategorySlug === category.slug
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {!showResults && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">Explora rankings</h3>
            <p className="text-muted-foreground">
              Busca por texto o selecciona una categoría
            </p>
          </div>
        )}

        {/* Loading state */}
        {showResults && resultsLoading && (
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

        {/* Search results */}
        {showResults && !resultsLoading && results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length} resultado{results.length !== 1 && "s"} para{" "}
                <span className="font-semibold text-foreground">
                  {debouncedQuery || categories?.find((c) => c.slug === selectedCategorySlug)?.name}
                </span>
              </p>
              {(debouncedQuery || selectedCategorySlug) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategorySlug(null);
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((ranking, index) => (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron rankings
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const categories = [
  "Gastronomía",
  "Cine",
  "Música",
  "Deportes",
  "Tecnología",
  "Viajes",
  "Libros",
  "Series",
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-black">Buscar</h1>
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
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            CATEGORÍAS POPULARES
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!query && !selectedCategory && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">Explora rankings</h3>
            <p className="text-muted-foreground">
              Busca por texto o selecciona una categoría
            </p>
          </div>
        )}

        {/* Search results placeholder */}
        {(query || selectedCategory) && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Resultados para{" "}
              <span className="font-semibold text-foreground">
                {query || selectedCategory}
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;

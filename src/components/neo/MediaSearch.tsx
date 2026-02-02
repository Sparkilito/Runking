import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Film, Tv, BookOpen, Loader2, Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { searchMedia, type MediaSearchResult, type MediaType } from "@/lib/mediaApi";
import { useDebounce } from "@/hooks/useDebounce";

interface MediaSearchProps {
  mediaType: MediaType;
  onSelect: (media: MediaSearchResult) => void;
  placeholder?: string;
  className?: string;
}

const MEDIA_CONFIG: Record<MediaType, { icon: typeof Film; label: string; color: string }> = {
  movie: { icon: Film, label: "Películas", color: "text-orange-400" },
  series: { icon: Tv, label: "Series", color: "text-teal-400" },
  book: { icon: BookOpen, label: "Libros", color: "text-purple-400" },
};

export function MediaSearch({ mediaType, onSelect, placeholder, className }: MediaSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const config = MEDIA_CONFIG[mediaType];
  const Icon = config.icon;

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await searchMedia(debouncedQuery, mediaType);
        setResults(data);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery, mediaType]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, selectedIndex]
  );

  const handleSelect = (media: MediaSearchResult) => {
    onSelect(media);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Buscar ${config.label.toLowerCase()}...`}
          className={cn(
            "w-full h-14 pl-12 pr-12",
            "bg-white/5 backdrop-blur-sm",
            "border-2 border-white/10 rounded-2xl",
            "text-white placeholder:text-white/40",
            "focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
            "transition-all duration-200"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="w-5 h-5 text-white/40 animate-spin" />}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-full mt-2",
              "bg-midnight-400/95 backdrop-blur-xl",
              "border border-white/10 rounded-2xl",
              "shadow-2xl shadow-black/50",
              "max-h-[400px] overflow-hidden"
            )}
          >
            {/* Results List */}
            <div ref={listRef} className="overflow-y-auto max-h-[360px] p-2">
              {isLoading && results.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="ml-2 text-white/60">Buscando...</span>
                </div>
              ) : results.length === 0 && query.length >= 2 ? (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40">No se encontraron resultados</p>
                  <p className="text-white/30 text-sm mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              ) : (
                results.map((media, index) => (
                  <MediaSearchItem
                    key={`${media.externalSource}-${media.externalId}`}
                    media={media}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelect(media)}
                  />
                ))
              )}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="border-t border-white/5 px-4 py-2 flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
                  <span>navegar</span>
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd>
                  <span>seleccionar</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

// Search Result Item
interface MediaSearchItemProps {
  media: MediaSearchResult;
  isSelected: boolean;
  onClick: () => void;
}

function MediaSearchItem({ media, isSelected, onClick }: MediaSearchItemProps) {
  const config = MEDIA_CONFIG[media.type];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-xl",
        "text-left transition-colors duration-150",
        isSelected ? "bg-purple-500/20" : "hover:bg-white/5"
      )}
    >
      {/* Cover Image */}
      <div className="relative flex-shrink-0 w-12 h-18 rounded-lg overflow-hidden bg-white/10">
        {media.coverImageUrl ? (
          <img
            src={media.coverImageUrl}
            alt={media.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <config.icon className={cn("w-6 h-6", config.color)} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white truncate">{media.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
          {media.releaseYear && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {media.releaseYear}
            </span>
          )}
          {media.externalRating && media.externalRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {media.externalRating.toFixed(1)}
            </span>
          )}
          {media.author && (
            <span className="truncate">{media.author}</span>
          )}
          {media.director && (
            <span className="truncate">{media.director}</span>
          )}
        </div>
        {media.genres && media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {media.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/60"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// Media Card for selected items
interface MediaCardProps {
  media: MediaSearchResult;
  score?: number | null;
  review?: string;
  onScoreChange?: (score: number) => void;
  onReviewChange?: (review: string) => void;
  onRemove?: () => void;
  position?: number;
  compact?: boolean;
  className?: string;
}

export function MediaCard({
  media,
  score,
  review,
  onRemove,
  position,
  compact = false,
  className,
}: MediaCardProps) {
  const config = MEDIA_CONFIG[media.type];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          "bg-white/5 border border-white/10",
          className
        )}
      >
        {position && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">#{position}</span>
          </div>
        )}
        <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
          {media.coverImageUrl ? (
            <img
              src={media.coverImageUrl}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <config.icon className={cn("w-5 h-5", config.color)} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{media.title}</h4>
          <p className="text-sm text-white/50">
            {media.releaseYear}
            {media.author && ` • ${media.author}`}
          </p>
        </div>
        {score && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              score >= 8 ? "from-green-500 to-emerald-500" :
              score >= 5 ? "from-yellow-500 to-orange-500" :
              "from-red-500 to-orange-500"
            )}
          >
            <span className="text-white font-bold">{score}</span>
          </div>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white/5 border border-white/10",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Position Badge */}
      {position && (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">#{position}</span>
          </div>
        </div>
      )}

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-red-500/50 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}

      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden bg-white/10">
          {media.coverImageUrl ? (
            <img
              src={media.coverImageUrl}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <config.icon className={cn("w-8 h-8", config.color)} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg line-clamp-2">{media.title}</h3>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-white/50">
            {media.releaseYear && (
              <span>{media.releaseYear}</span>
            )}
            {media.author && (
              <>
                <span>•</span>
                <span>{media.author}</span>
              </>
            )}
            {media.director && (
              <>
                <span>•</span>
                <span>{media.director}</span>
              </>
            )}
          </div>

          {media.genres && media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {media.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* External Rating */}
          {media.externalRating && media.externalRating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {media.externalRating.toFixed(1)}
              </span>
              <span className="text-white/30 text-sm">
                ({media.externalSource === 'tmdb' ? 'TMDB' : 'Google'})
              </span>
            </div>
          )}
        </div>

        {/* Score */}
        {score && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                score >= 8 ? "from-green-500 to-emerald-500 shadow-green-500/30" :
                score >= 5 ? "from-yellow-500 to-orange-500 shadow-yellow-500/30" :
                "from-red-500 to-orange-500 shadow-red-500/30"
              )}
            >
              <span className="text-white font-bold text-xl">{score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Review */}
      {review && (
        <div className="px-4 pb-4">
          <p className="text-white/60 text-sm italic line-clamp-3">"{review}"</p>
        </div>
      )}
    </motion.div>
  );
}

// Type selector component
interface MediaTypeSelectorProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
  className?: string;
}

export function MediaTypeSelector({ value, onChange, className }: MediaTypeSelectorProps) {
  const types: MediaType[] = ['movie', 'series', 'book'];

  return (
    <div className={cn("flex gap-2 p-1 bg-white/5 rounded-2xl", className)}>
      {types.map((type) => {
        const config = MEDIA_CONFIG[type];
        const Icon = config.icon;
        const isActive = value === type;

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
              "font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

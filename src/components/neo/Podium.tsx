import { cn } from "@/lib/utils";
import { Crown, Star } from "lucide-react";

interface PodiumItem {
  id?: string;
  position?: number;
  title: string;
  image?: string;
  imageUrl?: string;
  subtitle?: string;
  score?: number;
}

interface PodiumProps {
  items: PodiumItem[];
  className?: string;
}

// Helper to get score color
function getScoreColor(score: number) {
  if (score >= 9) return "from-yellow-400 to-amber-500";
  if (score >= 7) return "from-green-400 to-emerald-500";
  if (score >= 5) return "from-blue-400 to-cyan-500";
  if (score >= 3) return "from-orange-400 to-amber-500";
  return "from-red-400 to-rose-500";
}

export function Podium({ items, className }: PodiumProps) {
  // Ensure we have at least 3 items
  const safeItems = items.slice(0, 3);
  if (safeItems.length < 3) return null;

  // Reorganize items: [2nd, 1st, 3rd] for visual display
  const [first, second, third] = safeItems;
  const displayOrder = [second, first, third].filter(Boolean);

  const getPodiumStyles = (position: number) => {
    switch (position) {
      case 1: // Gold - tallest, center
        return {
          container: "order-2 z-10",
          height: "h-32",
          badge: "podium-gold",
          badgeText: "podium-badge-gold",
          glow: "shadow-podium-gold",
          color: "from-yellow-400 to-yellow-600",
        };
      case 2: // Silver - medium, left
        return {
          container: "order-1",
          height: "h-24",
          badge: "podium-silver",
          badgeText: "podium-badge-silver",
          glow: "shadow-podium-silver",
          color: "from-gray-300 to-gray-500",
        };
      case 3: // Bronze - shortest, right
        return {
          container: "order-3",
          height: "h-20",
          badge: "podium-bronze",
          badgeText: "podium-badge-bronze",
          glow: "shadow-podium-bronze",
          color: "from-amber-600 to-amber-800",
        };
      default:
        return {
          container: "",
          height: "h-16",
          badge: "",
          badgeText: "",
          glow: "",
          color: "from-gray-600 to-gray-800",
        };
    }
  };

  return (
    <div className={cn("flex items-end justify-center gap-2 sm:gap-4", className)}>
      {displayOrder.map((item, index) => {
        if (!item) return null;
        const position = index === 1 ? 1 : index === 0 ? 2 : 3;
        const styles = getPodiumStyles(position);
        const itemKey = item.id || `podium-${position}`;
        const itemImage = item.image || item.imageUrl;

        return (
          <div
            key={itemKey}
            className={cn(
              "flex flex-col items-center animate-podium-rise",
              styles.container
            )}
            style={{ animationDelay: `${position * 0.15}s` }}
          >
            {/* Item Card */}
            <div
              className={cn(
                "relative glass rounded-squircle-lg p-3 mb-2 w-20 sm:w-28 transition-all duration-300",
                "hover:scale-105",
                styles.glow
              )}
            >
              {/* Crown for #1 */}
              {position === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Crown className="w-8 h-8 text-yellow-400 crown" />
                </div>
              )}

              {/* Image or placeholder */}
              {itemImage ? (
                <img
                  src={itemImage}
                  alt={item.title}
                  className="w-full aspect-square object-cover rounded-squircle mb-2"
                />
              ) : (
                <div
                  className={cn(
                    "w-full aspect-square rounded-squircle mb-2",
                    "bg-gradient-to-br",
                    styles.color,
                    "flex items-center justify-center"
                  )}
                >
                  <span className="text-2xl font-display font-bold text-white/90">
                    {position}
                  </span>
                </div>
              )}

              {/* Title */}
              <p className="text-xs sm:text-sm font-heading font-semibold text-white text-center truncate">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[10px] text-white/50 text-center truncate">
                  {item.subtitle}
                </p>
              )}

              {/* Score badge (if score exists) */}
              {typeof item.score === "number" && (
                <div
                  className={cn(
                    "absolute -top-2 -left-2 w-8 h-8 rounded-lg",
                    "flex items-center justify-center",
                    "bg-gradient-to-br shadow-lg",
                    getScoreColor(item.score)
                  )}
                >
                  <span className="text-sm font-bold text-white">{item.score}</span>
                </div>
              )}

              {/* Position badge */}
              <div
                className={cn(
                  "absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full",
                  "flex items-center justify-center",
                  "font-display font-bold text-sm",
                  styles.badgeText
                )}
              >
                {position}
              </div>
            </div>

            {/* Podium base */}
            <div
              className={cn(
                "w-16 sm:w-24 rounded-t-lg",
                styles.height,
                styles.badge
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

// Mini podium for cards
export function MiniPodium({ items, className }: PodiumProps) {
  const safeItems = items.slice(0, 3);

  return (
    <div className={cn("flex items-end justify-center gap-3", className)}>
      {safeItems.map((item, index) => {
        const position = index + 1;
        const heights = ["h-12", "h-10", "h-8"];
        const colors = [
          "bg-gradient-to-t from-yellow-500 to-yellow-400",
          "bg-gradient-to-t from-gray-400 to-gray-300",
          "bg-gradient-to-t from-amber-700 to-amber-600",
        ];
        const itemKey = item.id || `mini-${position}`;
        const itemImage = item.image || item.imageUrl;

        return (
          <div key={itemKey} className="flex flex-col items-center">
            {/* Image */}
            <div className="relative">
              {itemImage ? (
                <img
                  src={itemImage}
                  alt={item.title}
                  className="w-10 h-10 rounded-lg ring-2 ring-white/20 mb-1 object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg mb-1 flex items-center justify-center text-sm font-bold",
                    colors[index],
                    position === 1 ? "text-midnight-300" : "text-white"
                  )}
                >
                  {position}
                </div>
              )}

              {/* Score badge (mini version) */}
              {typeof item.score === "number" && (
                <div
                  className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-md",
                    "flex items-center justify-center",
                    "bg-gradient-to-br shadow-sm",
                    getScoreColor(item.score)
                  )}
                >
                  <span className="text-[10px] font-bold text-white">{item.score}</span>
                </div>
              )}
            </div>

            {/* Title (truncated) */}
            <p className="text-[9px] text-white/70 text-center truncate w-12 mb-1">
              {item.title}
            </p>

            {/* Podium base */}
            <div
              className={cn("w-10 rounded-t-sm", heights[index], colors[index])}
            />
          </div>
        );
      })}
    </div>
  );
}

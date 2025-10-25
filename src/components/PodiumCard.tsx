import { cn } from "@/lib/utils";
import { Trophy, Medal } from "lucide-react";

interface PodiumItem {
  position: number;
  title: string;
  imageUrl?: string;
}

interface PodiumCardProps {
  items: PodiumItem[];
  className?: string;
}

export const PodiumCard = ({ items, className }: PodiumCardProps) => {
  const topThree = items.slice(0, 3);
  
  // Reorder for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree[1], // 2nd place (left)
    topThree[0], // 1st place (center, tallest)
    topThree[2], // 3rd place (right)
  ].filter(Boolean);

  const getHeightClass = (position: number) => {
    switch (position) {
      case 1:
        return "h-40";
      case 2:
        return "h-32";
      case 3:
        return "h-28";
      default:
        return "h-24";
    }
  };

  const getIconColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getPodiumGradient = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-400/20 to-yellow-600/20";
      case 2:
        return "from-gray-400/20 to-gray-600/20";
      case 3:
        return "from-amber-500/20 to-amber-700/20";
      default:
        return "from-muted/20 to-muted/40";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-center gap-2 sm:gap-4 pb-4">
        {podiumOrder.map((item, index) => {
          if (!item) return null;
          
          const actualPosition = item.position;
          const isFirst = actualPosition === 1;
          
          return (
            <div
              key={item.position}
              className={cn(
                "flex flex-col items-center gap-2 flex-1 max-w-[120px] animate-bounce-in",
                isFirst && "scale-105"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div
                className={cn(
                  "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-lg transition-transform hover:scale-110",
                  isFirst
                    ? "border-yellow-400 shadow-glow"
                    : actualPosition === 2
                    ? "border-gray-400"
                    : "border-amber-600"
                )}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {item.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Position badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-current flex items-center justify-center">
                  {isFirst ? (
                    <Trophy className={cn("w-3 h-3", getIconColor(actualPosition))} />
                  ) : (
                    <Medal className={cn("w-3 h-3", getIconColor(actualPosition))} />
                  )}
                </div>
              </div>

              {/* Title */}
              <p className="text-xs sm:text-sm font-semibold text-center line-clamp-2 px-1">
                {item.title}
              </p>

              {/* Podium base */}
              <div
                className={cn(
                  "w-full rounded-t-lg bg-gradient-to-b transition-all",
                  getHeightClass(actualPosition),
                  getPodiumGradient(actualPosition),
                  "border-2 border-b-0",
                  isFirst
                    ? "border-yellow-400/50"
                    : actualPosition === 2
                    ? "border-gray-400/50"
                    : "border-amber-600/50"
                )}
              >
                <div className="flex items-center justify-center h-full">
                  <span
                    className={cn(
                      "text-3xl sm:text-4xl font-black",
                      isFirst
                        ? "text-yellow-400"
                        : actualPosition === 2
                        ? "text-gray-400"
                        : "text-amber-600"
                    )}
                  >
                    {actualPosition}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

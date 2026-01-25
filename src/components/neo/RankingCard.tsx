import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MiniPodium } from "./Podium";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface RankingCardProps {
  ranking: {
    id: string;
    title: string;
    description?: string;
    category?: {
      name: string;
      color?: string;
      slug: string;
    };
    author: {
      id: string;
      username: string;
      display_name?: string;
      avatar_url?: string;
    };
    items: Array<{
      id: string;
      title: string;
      image_url?: string;
    }>;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    is_saved?: boolean;
    created_at: string;
  };
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  className?: string;
}

export function RankingCard({
  ranking,
  onLike,
  onSave,
  onShare,
  className,
}: RankingCardProps) {
  const top3Items = ranking.items.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image_url,
  }));

  return (
    <article
      className={cn(
        "glass rounded-squircle-xl p-5 transition-all duration-300",
        "hover:shadow-glass-lg hover:-translate-y-1",
        "animate-fade-in",
        className
      )}
    >
      {/* Header: Author + Category */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${ranking.author.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar size="default">
            {ranking.author.avatar_url && (
              <AvatarImage
                src={ranking.author.avatar_url}
                alt={ranking.author.display_name || ranking.author.username}
              />
            )}
            <AvatarFallback>
              {(ranking.author.display_name || ranking.author.username)
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading font-semibold text-white group-hover:text-purple-400 transition-colors">
              {ranking.author.display_name || ranking.author.username}
            </p>
            <p className="text-xs text-white/50">
              @{ranking.author.username} ·{" "}
              {formatDistanceToNow(new Date(ranking.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </Link>

        {ranking.category && (
          <Link to={`/category/${ranking.category.slug}`}>
            <Badge
              variant="secondary"
              className="hover:bg-white/15 transition-colors"
              style={{
                borderColor: ranking.category.color
                  ? `${ranking.category.color}40`
                  : undefined,
              }}
            >
              {ranking.category.name}
            </Badge>
          </Link>
        )}
      </div>

      {/* Title + Description */}
      <Link to={`/ranking/${ranking.id}`} className="block group">
        <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {ranking.title}
        </h3>
        {ranking.description && (
          <p className="text-sm text-white/60 line-clamp-2 mb-4">
            {ranking.description}
          </p>
        )}
      </Link>

      {/* Mini Podium Preview */}
      <Link to={`/ranking/${ranking.id}`} className="block">
        <div className="glass-light rounded-squircle-lg p-4 mb-4">
          <MiniPodium items={top3Items} className="mb-3" />

          {/* Top 3 list */}
          <div className="space-y-2">
            {top3Items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    index === 0 &&
                      "bg-gradient-to-br from-yellow-400 to-yellow-600 text-midnight-300",
                    index === 1 &&
                      "bg-gradient-to-br from-gray-300 to-gray-500 text-midnight-300",
                    index === 2 &&
                      "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-sm text-white/80 truncate flex-1">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike?.();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
              "hover:bg-white/10",
              ranking.is_liked && "text-red-400"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                ranking.is_liked && "fill-current"
              )}
            />
            <span className="text-sm font-medium">
              {ranking.likes_count > 0 ? ranking.likes_count : ""}
            </span>
          </button>

          {/* Comments */}
          <Link
            to={`/ranking/${ranking.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {ranking.comments_count > 0 ? ranking.comments_count : ""}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {/* Save */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave?.();
            }}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "hover:bg-white/10",
              ranking.is_saved && "text-solar-400"
            )}
          >
            <Bookmark
              className={cn(
                "w-4 h-4",
                ranking.is_saved && "fill-current"
              )}
            />
          </button>

          {/* Share */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onShare?.();
            }}
            className="p-2 rounded-full transition-all duration-200 hover:bg-white/10"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// Skeleton for loading state
export function RankingCardSkeleton() {
  return (
    <div className="glass rounded-squircle-xl p-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-white/10 rounded mb-1" />
          <div className="h-3 w-32 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-4 w-full bg-white/10 rounded mb-4" />

      {/* Podium skeleton */}
      <div className="glass-light rounded-squircle-lg p-4 mb-4">
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-6 h-8 bg-white/10 rounded" />
          <div className="w-6 h-10 bg-white/10 rounded" />
          <div className="w-6 h-6 bg-white/10 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/10" />
              <div className="h-4 flex-1 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-white/10 rounded-full" />
          <div className="w-16 h-8 bg-white/10 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="w-8 h-8 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

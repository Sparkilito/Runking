import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RankingCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  coverImage?: string;
  likes: number;
  comments: number;
  category: string;
  isLiked?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RankingCard = ({
  title,
  author,
  authorAvatar,
  coverImage,
  likes,
  comments,
  category,
  isLiked = false,
  onClick,
  className,
  style,
}: RankingCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-glow hover:-translate-y-1 animate-scale-in",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {/* Cover image */}
      <div className="relative aspect-video bg-gradient-primary overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-black text-primary-foreground/30">
              #
            </span>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-semibold text-foreground">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary overflow-hidden">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={author}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                {author.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {author}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5",
              isLiked && "text-destructive hover:text-destructive"
            )}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="text-xs font-semibold">{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">{comments}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

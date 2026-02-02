import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  Loader2,
  MoreVertical,
  Flag,
  Trash2,
  Trophy,
  Star,
  Film,
  Tv,
  BookOpen,
  Quote,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { useRanking } from "@/hooks/useRankings";
import {
  useHasLiked,
  useToggleLike,
  useHasSaved,
  useToggleSave,
  useComments,
  useAddComment,
} from "@/hooks/useInteractions";
import { useIsFollowing, useToggleFollow } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Podium, BottomNav, LoadingScreen, ScoreIndicator } from "@/components/neo";
import { ShareModal } from "@/components/neo/ShareModal";
import { cn } from "@/lib/utils";

// =====================================================
// Score Badge Component (inline)
// =====================================================

function ScoreBadgeInline({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 9) return "from-yellow-400 to-amber-500";
    if (s >= 7) return "from-green-400 to-emerald-500";
    if (s >= 5) return "from-blue-400 to-cyan-500";
    if (s >= 3) return "from-orange-400 to-amber-500";
    return "from-red-400 to-rose-500";
  };

  return (
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        "bg-gradient-to-br shadow-lg",
        getScoreColor(score)
      )}
    >
      <span className="text-lg font-bold text-white">{score}</span>
    </div>
  );
}

// =====================================================
// Media Type Icon
// =====================================================

function MediaTypeIcon({ type, className }: { type?: string; className?: string }) {
  if (type === "movie") return <Film className={className} />;
  if (type === "series") return <Tv className={className} />;
  if (type === "book") return <BookOpen className={className} />;
  return <Trophy className={className} />;
}

function getMediaTypeEmoji(type?: string) {
  if (type === "movie") return "🎬";
  if (type === "series") return "📺";
  if (type === "book") return "📚";
  return "📋";
}

// =====================================================
// Ranking Item Card with Score and Review
// =====================================================

interface RankingItemProps {
  item: any;
  position: number;
  showTopBadge?: boolean;
}

function RankingItemCard({ item, position, showTopBadge }: RankingItemProps) {
  const [showReview, setShowReview] = useState(false);

  const getPositionStyle = (pos: number) => {
    if (pos === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900";
    if (pos === 2) return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700";
    if (pos === 3) return "bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100";
    return "bg-white/10 text-white/70";
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-white/5 hover:bg-white/10 transition-all duration-300",
        "border border-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-stretch">
        {/* Position badge */}
        <div
          className={cn(
            "w-14 flex-shrink-0 flex items-center justify-center",
            "text-2xl font-black",
            getPositionStyle(position)
          )}
        >
          {position}
        </div>

        {/* Image */}
        {item.image_url && (
          <div className="w-20 h-28 flex-shrink-0 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-white/50 mt-0.5">{item.subtitle}</p>
              )}
            </div>

            {/* Score */}
            {typeof item.score === "number" && (
              <ScoreBadgeInline score={item.score} />
            )}
          </div>

          {/* Review toggle */}
          {item.review && (
            <button
              onClick={() => setShowReview(!showReview)}
              className="flex items-center gap-1 mt-2 text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Ver reseña</span>
              {showReview ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Review expanded */}
      {item.review && showReview && (
        <div className="px-4 pb-4 pt-0">
          <div className="p-4 rounded-xl bg-white/5 border-l-4 border-purple/50">
            <Quote className="w-4 h-4 text-purple/50 mb-2" />
            <p className="text-sm text-white/80 italic leading-relaxed">
              {item.review}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

const RankingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ranking, isLoading, error } = useRanking(id);
  const { data: hasLiked } = useHasLiked(id);
  const { data: hasSaved } = useHasSaved(id);
  const { data: isFollowing } = useIsFollowing(ranking?.user_id);
  const { data: comments } = useComments(id);

  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const toggleFollow = useToggleFollow();
  const addComment = useAddComment();

  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("Inicia sesión para dar like");
      navigate("/login");
      return;
    }

    if (!id) return;

    try {
      await toggleLike.mutateAsync({ rankingId: id, isLiked: hasLiked ?? false });
    } catch (error) {
      toast.error("Error al dar like");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar");
      navigate("/login");
      return;
    }

    if (!id) return;

    try {
      await toggleSave.mutateAsync({ rankingId: id, isSaved: hasSaved ?? false });
      toast.success(hasSaved ? "Eliminado de guardados" : "Guardado");
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Inicia sesión para seguir");
      navigate("/login");
      return;
    }

    if (!ranking?.user_id) return;

    try {
      await toggleFollow.mutateAsync({
        targetUserId: ranking.user_id,
        isFollowing: isFollowing ?? false,
      });
      toast.success(isFollowing ? "Dejaste de seguir" : "Siguiendo");
    } catch (error) {
      toast.error("Error al seguir");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Inicia sesión para comentar");
      navigate("/login");
      return;
    }

    if (!commentText.trim() || !id) return;

    try {
      await addComment.mutateAsync({
        rankingId: id,
        content: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comentario agregado");
    } catch (error) {
      toast.error("Error al comentar");
    }
  };

  if (isLoading) {
    return <LoadingScreen text="Cargando ranking..." />;
  }

  if (error || !ranking) {
    return (
      <div className="min-h-screen bg-midnight pb-24">
        <header className="sticky top-0 z-40 glass border-b border-white/10">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Trophy className="w-20 h-20 mx-auto text-white/20 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ranking no encontrado</h1>
          <p className="text-white/60 mb-4">
            Este ranking no existe o fue eliminado
          </p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isOwner = user?.id === ranking.user_id;
  const shareUrl = `${window.location.origin}/ranking/${id}`;

  // Calculate average score if items have scores
  const itemsWithScores = ranking.items?.filter((item: any) => typeof item.score === "number") || [];
  const averageScore =
    itemsWithScores.length > 0
      ? (itemsWithScores.reduce((sum: number, item: any) => sum + item.score, 0) / itemsWithScores.length).toFixed(1)
      : null;

  // Get first item image for share preview
  const shareImageUrl = ranking.items?.[0]?.image_url;

  return (
    <div className="min-h-screen bg-midnight pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              {isOwner ? (
                <DropdownMenuItem className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar ranking
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-white/80">
                  <Flag className="w-4 h-4 mr-2" />
                  Reportar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Ranking info */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Category & Media type badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple/20 text-purple text-sm font-medium">
                <span>{getMediaTypeEmoji(ranking.media_type)}</span>
                {ranking.category_name}
              </span>
              {averageScore && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-solar/20 text-solar text-sm font-medium">
                  <Star className="w-4 h-4" fill="currentColor" />
                  Promedio: {averageScore}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-heading font-black leading-tight text-white">
              {ranking.title}
            </h1>
            {ranking.description && (
              <p className="text-white/70 text-lg">{ranking.description}</p>
            )}
          </div>

          {/* Author */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <Link
                to={`/user/${ranking.author_username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-12 h-12 border-2 border-purple/50">
                  <AvatarImage src={ranking.author_avatar_url || undefined} />
                  <AvatarFallback className="bg-purple text-white font-bold">
                    {(ranking.author_display_name || ranking.author_username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">
                    {ranking.author_display_name || ranking.author_username}
                  </p>
                  <p className="text-sm text-white/60">
                    {formatDistanceToNow(new Date(ranking.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </Link>

              {!isOwner && (
                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={toggleFollow.isPending}
                >
                  {toggleFollow.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Siguiendo"
                  ) : (
                    "Seguir"
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "flex-1 gap-2",
                hasLiked && "text-red-400 border-red-400/50 bg-red-400/10"
              )}
              onClick={handleLike}
              disabled={toggleLike.isPending}
            >
              <Heart className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} />
              <span className="font-semibold">{ranking.likes_count}</span>
            </Button>

            <Button variant="secondary" size="lg" className="flex-1 gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{ranking.comments_count}</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "gap-2",
                hasSaved && "text-cyan border-cyan/50 bg-cyan/10"
              )}
              onClick={handleSave}
              disabled={toggleSave.isPending}
            >
              <Bookmark className="w-5 h-5" fill={hasSaved ? "currentColor" : "none"} />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="gap-2 hover:text-solar hover:border-solar/50"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Podium for top 3 */}
        {ranking.items && ranking.items.length >= 3 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-heading font-bold mb-6 text-center text-white flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-solar" />
              Top 3
            </h2>
            <Podium
              items={ranking.items.slice(0, 3).map((item: any) => ({
                position: item.position,
                title: item.title,
                imageUrl: item.image_url || undefined,
                score: item.score,
              }))}
            />
          </Card>
        )}

        {/* Full ranking list with scores and reviews */}
        <Card variant="glass" className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-solar" />
              Ranking completo
            </h2>
            <span className="text-sm text-white/50">
              {ranking.items?.length || 0} items
            </span>
          </div>

          <div className="space-y-3">
            {ranking.items?.map((item: any, index: number) => (
              <RankingItemCard
                key={item.id}
                item={item}
                position={item.position || index + 1}
                showTopBadge={index < 3}
              />
            ))}
          </div>
        </Card>

        {/* Comments */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-heading font-bold mb-4 text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan" />
            Comentarios ({ranking.comments_count})
          </h2>

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
            <Input
              placeholder={user ? "Escribe un comentario..." : "Inicia sesión para comentar"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user || addComment.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!user || !commentText.trim() || addComment.isPending}
              size="icon"
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Comments list */}
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple/50 text-white text-xs">
                      {(comment.profiles?.display_name || comment.profiles?.username || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {comment.profiles?.display_name || comment.profiles?.username}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-white/80">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/50 py-8">Sé el primero en comentar</p>
          )}
        </Card>

        {/* Share CTA at bottom */}
        <Card
          variant="glass"
          className="p-6 bg-gradient-to-br from-purple/20 to-solar/20 border-purple/20 cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => setShowShareModal(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-solar flex items-center justify-center">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">¿Te gustó este ranking?</h3>
              <p className="text-white/60 text-sm">
                Compártelo con tus amigos y compara opiniones
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={ranking.title}
        description={ranking.description}
        url={shareUrl}
        imageUrl={shareImageUrl}
      />
    </div>
  );
};

export default RankingDetail;

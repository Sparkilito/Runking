import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { useState } from "react";
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
import { Podium } from "@/components/neo/Podium";
import { BottomNav } from "@/components/neo";

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

  const handleShare = async () => {
    if (!ranking) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: ranking.title,
          text: ranking.description || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      const text = encodeURIComponent(`${ranking.title}\n\n${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
      toast.success("Compartido por WhatsApp");
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
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-24 bg-white/10" />
          <Skeleton className="h-10 w-full bg-white/10" />
          <Skeleton className="h-20 w-full bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 bg-white/10" />
            <Skeleton className="h-12 flex-1 bg-white/10" />
            <Skeleton className="h-12 w-12 bg-white/10" />
            <Skeleton className="h-12 w-12 bg-white/10" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
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
          <div className="space-y-2">
            <span className="category-pill">
              {ranking.category_name}
            </span>
            <h1 className="text-3xl font-heading font-black leading-tight text-white">
              {ranking.title}
            </h1>
            {ranking.description && (
              <p className="text-white/70">{ranking.description}</p>
            )}
          </div>

          {/* Author */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <Link to={`/user/${ranking.author_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="w-12 h-12 border-2 border-purple/50">
                  <AvatarImage src={ranking.author_avatar_url || undefined} />
                  <AvatarFallback className="bg-purple text-white font-bold">
                    {(ranking.author_display_name || ranking.author_username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{ranking.author_display_name || ranking.author_username}</p>
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
              className={`flex-1 gap-2 ${hasLiked && "text-red-400 border-red-400/50"}`}
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
              className={`gap-2 ${hasSaved && "text-cyan border-cyan/50"}`}
              onClick={handleSave}
              disabled={toggleSave.isPending}
            >
              <Bookmark className="w-5 h-5" fill={hasSaved ? "currentColor" : "none"} />
            </Button>

            <Button variant="secondary" size="lg" className="gap-2" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Podium */}
        {ranking.items && ranking.items.length >= 3 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-heading font-bold mb-6 text-center text-white flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-solar" />
              Top 3
            </h2>
            <Podium
              items={ranking.items.slice(0, 3).map((item) => ({
                position: item.position,
                title: item.title,
                imageUrl: item.image_url || undefined,
              }))}
            />
          </Card>
        )}

        {/* Rest of the list */}
        {ranking.items && ranking.items.length > 3 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-heading font-bold mb-4 text-white">Ranking completo</h2>
            <div className="space-y-3">
              {ranking.items.slice(3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-squircle glass hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple/30 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {item.position}
                  </div>
                  <p className="font-medium flex-1 text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Comments */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-heading font-bold mb-4 text-white">
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
            <p className="text-center text-white/50 py-8">
              Sé el primero en comentar
            </p>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default RankingDetail;

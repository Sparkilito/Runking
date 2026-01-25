import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { PodiumCard } from "@/components/PodiumCard";
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
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Logo size="sm" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !ranking) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Logo size="sm" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Ranking no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            Este ranking no existe o fue eliminado
          </p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </main>
      </div>
    );
  }

  const isOwner = user?.id === ranking.user_id;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <Logo size="sm" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar ranking
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
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
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {ranking.category_name}
            </span>
            <h1 className="text-3xl font-black leading-tight">{ranking.title}</h1>
            {ranking.description && (
              <p className="text-muted-foreground">{ranking.description}</p>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center justify-between">
            <Link to={`/user/${ranking.author_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="w-10 h-10">
                <AvatarImage src={ranking.author_avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                  {(ranking.author_display_name || ranking.author_username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{ranking.author_display_name || ranking.author_username}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(ranking.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </Link>

            {!isOwner && (
              <Button
                variant={isFollowing ? "outline" : "default"}
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

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="lg"
              className={`flex-1 gap-2 ${hasLiked && "text-destructive border-destructive"}`}
              onClick={handleLike}
              disabled={toggleLike.isPending}
            >
              <Heart className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} />
              <span className="font-semibold">{ranking.likes_count}</span>
            </Button>

            <Button variant="outline" size="lg" className="flex-1 gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{ranking.comments_count}</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${hasSaved && "text-primary border-primary"}`}
              onClick={handleSave}
              disabled={toggleSave.isPending}
            >
              <Bookmark className="w-5 h-5" fill={hasSaved ? "currentColor" : "none"} />
            </Button>

            <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Podium */}
        {ranking.items && ranking.items.length >= 3 && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <h2 className="text-xl font-bold mb-4 text-center">Top 3</h2>
            <PodiumCard
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
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Ranking completo</h2>
            <div className="space-y-3">
              {ranking.items.slice(3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {item.position}
                  </div>
                  <p className="font-medium flex-1">{item.title}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Comments */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
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
                    <AvatarFallback className="text-xs">
                      {(comment.profiles?.display_name || comment.profiles?.username || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {comment.profiles?.display_name || comment.profiles?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Sé el primero en comentar
            </p>
          )}
        </Card>
      </main>
    </div>
  );
};

export default RankingDetail;

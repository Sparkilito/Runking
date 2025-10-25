import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PodiumCard } from "@/components/PodiumCard";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_RANKING = {
  id: "1",
  title: "Mejores Restaurantes de Madrid 2024",
  description:
    "Mi selección personal de los restaurantes que debes visitar en Madrid este año. Desde tradicionales hasta innovadores, aquí está lo mejor de la gastronomía madrileña.",
  author: "Ana García",
  authorAvatar: "",
  category: "Gastronomía",
  createdAt: "Hace 2 días",
  likes: 234,
  comments: 45,
  isLiked: false,
  isSaved: false,
  items: [
    { position: 1, title: "DiverXO" },
    { position: 2, title: "DSTAgE" },
    { position: 3, title: "Casa Lucio" },
    { position: 4, title: "El Club Allard" },
    { position: 5, title: "Sobrino de Botín" },
    { position: 6, title: "La Tasquita de Enfrente" },
    { position: 7, title: "Ramón Freixa Madrid" },
    { position: 8, title: "Santceloni" },
  ],
};

const RankingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(MOCK_RANKING.isLiked);
  const [isSaved, setIsSaved] = useState(MOCK_RANKING.isSaved);
  const [likes, setLikes] = useState(MOCK_RANKING.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: MOCK_RANKING.title,
          text: MOCK_RANKING.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to WhatsApp
      const text = encodeURIComponent(
        `${MOCK_RANKING.title}\n\n${window.location.href}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
      toast.success("Compartido por WhatsApp");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Ranking info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {MOCK_RANKING.category}
            </span>
            <h1 className="text-3xl font-black leading-tight">
              {MOCK_RANKING.title}
            </h1>
            <p className="text-muted-foreground">{MOCK_RANKING.description}</p>
          </div>

          {/* Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-primary-foreground font-bold">
                  {MOCK_RANKING.author.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="font-semibold">{MOCK_RANKING.author}</p>
                <p className="text-sm text-muted-foreground">
                  {MOCK_RANKING.createdAt}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Seguir
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="lg"
              className={`flex-1 gap-2 ${
                isLiked && "text-destructive border-destructive"
              }`}
              onClick={handleLike}
            >
              <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
              <span className="font-semibold">{likes}</span>
            </Button>

            <Button variant="outline" size="lg" className="flex-1 gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{MOCK_RANKING.comments}</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${isSaved && "text-primary border-primary"}`}
              onClick={() => {
                setIsSaved(!isSaved);
                toast.success(isSaved ? "Eliminado de guardados" : "Guardado");
              }}
            >
              <Bookmark
                className="w-5 h-5"
                fill={isSaved ? "currentColor" : "none"}
              />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Podium */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-xl font-bold mb-4 text-center">Top 3</h2>
          <PodiumCard items={MOCK_RANKING.items.slice(0, 3)} />
        </Card>

        {/* Rest of the list */}
        {MOCK_RANKING.items.length > 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Ranking completo</h2>
            <div className="space-y-3">
              {MOCK_RANKING.items.slice(3).map((item) => (
                <div
                  key={item.position}
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

        {/* Comments placeholder */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Comentarios ({MOCK_RANKING.comments})
          </h2>
          <p className="text-center text-muted-foreground py-8">
            Los comentarios aparecerán aquí
          </p>
        </Card>
      </main>
    </div>
  );
};

export default RankingDetail;


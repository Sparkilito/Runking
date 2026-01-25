import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  DraggableRankingItem,
  RankingItemData,
} from "@/components/DraggableRankingItem";
import { PodiumCard } from "@/components/PodiumCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCategories } from "@/hooks/useCategories";
import { useCreateRanking } from "@/hooks/useRankings";

const CreateRanking = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createRanking = useCreateRanking();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [items, setItems] = useState<RankingItemData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        return newItems;
      });
    }
  };

  const addItem = () => {
    if (!newItemTitle.trim()) {
      toast.error("Escribe un título para el ítem");
      return;
    }

    const newItem: RankingItemData = {
      id: `item-${Date.now()}`,
      title: newItemTitle.trim(),
    };

    setItems([...items, newItem]);
    setNewItemTitle("");
    toast.success("¡Ítem agregado!", {
      icon: "✨",
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Ítem eliminado");
  };

  const updateItem = (id: string, updates: Partial<RankingItemData>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Dale un título a tu ranking");
      return;
    }

    if (!categoryId) {
      toast.error("Selecciona una categoría");
      return;
    }

    if (items.length < 3) {
      toast.error("Necesitas al menos 3 ítems para crear un ranking");
      return;
    }

    try {
      await createRanking.mutateAsync({
        ranking: {
          title: title.trim(),
          description: description.trim() || null,
          category_id: categoryId,
          is_published: true,
        },
        items: items.map((item) => ({
          title: item.title,
          image_url: item.imageUrl || null,
          link_url: item.linkUrl || null,
          position: 0, // Will be set by the mutation
        })),
      });

      toast.success("¡Ranking publicado! 🎉👑", {
        description: "Tu ranking ya está en vivo",
      });
      navigate("/");
    } catch (error) {
      toast.error("Error al publicar el ranking");
      console.error(error);
    }
  };

  const canShowPodium = items.length >= 3;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Button>
          <Logo size="sm" />
          <div className="flex-1" />
          <Button
            onClick={handlePublish}
            disabled={!title || !categoryId || items.length < 3 || createRanking.isPending}
            className="bg-gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition-transform"
          >
            {createRanking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`flex items-center gap-2 ${
              title ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                title ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              1
            </div>
            Info
          </div>
          <div className="flex-1 h-0.5 bg-border" />
          <div
            className={`flex items-center gap-2 ${
              items.length > 0 ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                items.length > 0 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              2
            </div>
            Ítems
          </div>
          <div className="flex-1 h-0.5 bg-border" />
          <div
            className={`flex items-center gap-2 ${
              canShowPodium ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                canShowPodium ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              3
            </div>
            Vista previa
          </div>
        </div>

        {/* Basic info */}
        <Card className="p-6 space-y-5 animate-scale-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  ¿Sobre qué es tu ranking?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Dale un título atractivo que capture la atención
                </p>
              </div>

              <Input
                placeholder="Ej: Las 10 Mejores Películas de Ciencia Ficción"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold h-12"
              />

              <Textarea
                placeholder="Describe tu ranking y por qué es especial..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Categoría</label>
                {categoriesLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-24 rounded-full" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          categoryId === cat.id
                            ? "bg-primary text-primary-foreground shadow-glow scale-105"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Add items */}
        <Card className="p-6 space-y-4 animate-scale-in">
          <div>
            <h2 className="text-xl font-bold mb-1">Agrega tus ítems</h2>
            <p className="text-sm text-muted-foreground">
              Escribe cada ítem y luego arrastra para ordenar
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe el nombre del ítem..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="flex-1 h-12"
            />
            <Button onClick={addItem} size="lg" className="gap-2 px-6">
              <Plus className="w-5 h-5" />
              Agregar
            </Button>
          </div>

          {items.length > 0 && (
            <Alert className="bg-primary/5 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Tip:</strong> Arrastra los ítems para reordenar •{" "}
                {items.length} ítem{items.length !== 1 && "s"}
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Sortable list */}
        {items.length > 0 && (
          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => (
                  <DraggableRankingItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={removeItem}
                    onUpdate={updateItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {items.length === 0 && (
          <Card className="p-16 text-center animate-fade-in">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Empieza a construir tu ranking
                </h3>
                <p className="text-muted-foreground text-sm">
                  Agrega al menos 3 ítems para crear tu podio
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Preview */}
        {canShowPodium && (
          <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 animate-bounce-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Vista previa del podio</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Ocultar" : "Mostrar"}
              </Button>
            </div>

            {showPreview && (
              <div className="animate-scale-in">
                <PodiumCard
                  items={items.slice(0, 3).map((item, index) => ({
                    position: index + 1,
                    title: item.title,
                    imageUrl: item.imageUrl,
                  }))}
                />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Así se verá tu Top 3 🏆
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Publish button (mobile) */}
        <div className="sticky bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            onClick={handlePublish}
            disabled={!title || !categoryId || items.length < 3 || createRanking.isPending}
            size="lg"
            className="w-full bg-gradient-primary text-primary-foreground font-bold text-lg shadow-glow hover:scale-105 transition-transform"
          >
            {createRanking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar Ranking"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateRanking;

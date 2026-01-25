import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  GripVertical,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Crown,
  Loader2,
  Check,
} from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useCreateRanking } from "@/hooks/useRankings";
import { Podium } from "@/components/neo/Podium";
import { cn } from "@/lib/utils";

interface RankingItemData {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
}

// Draggable Item Component
function DraggableItem({
  item,
  index,
  onRemove,
  onUpdate,
}: {
  item: RankingItemData;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<RankingItemData>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBadgeStyle = (pos: number) => {
    if (pos === 0)
      return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-midnight-300";
    if (pos === 1)
      return "bg-gradient-to-br from-gray-300 to-gray-500 text-midnight-300";
    if (pos === 2)
      return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
    return "bg-white/10 text-white/60";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass rounded-squircle-lg p-4",
        "transition-all duration-200",
        isDragging && "scale-105 shadow-glass-lg z-50 opacity-90"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-white/40" />
        </button>

        {/* Position badge */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "font-display font-bold text-sm",
            getBadgeStyle(index)
          )}
        >
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Input
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            className="bg-transparent border-0 p-0 h-auto text-white font-medium focus:ring-0 focus:outline-none"
            placeholder="Nombre del ítem"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const url = prompt("URL de la imagen:", item.imageUrl || "");
              if (url !== null) onUpdate(item.id, { imageUrl: url || undefined });
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              item.imageUrl ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:bg-white/10"
            )}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = prompt("URL del enlace:", item.linkUrl || "");
              if (url !== null) onUpdate(item.id, { linkUrl: url || undefined });
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              item.linkUrl ? "bg-cyan-500/20 text-cyan-400" : "text-white/40 hover:bg-white/10"
            )}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-lg text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const CreateRanking = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createRanking = useCreateRanking();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [items, setItems] = useState<RankingItemData[]>([]);

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
    toast.success("¡Ítem agregado!");
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
          position: 0,
        })),
      });

      toast.success("¡Ranking publicado!", {
        description: "Tu ranking ya está en vivo",
      });
      navigate("/");
    } catch (error) {
      toast.error("Error al publicar el ranking");
      console.error(error);
    }
  };

  const canPublish = title && categoryId && items.length >= 3;

  // Progress steps
  const steps = [
    { label: "Info", completed: !!title && !!categoryId },
    { label: "Ítems", completed: items.length >= 3 },
    { label: "Publicar", completed: false },
  ];

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
            className="text-white/70"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h1 className="font-display font-bold text-white">Crear Ranking</h1>
          </div>

          <Button
            onClick={handlePublish}
            disabled={!canPublish || createRanking.isPending}
            size="default"
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

      <main className="pt-20 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "font-display font-bold text-sm transition-all duration-300",
                  step.completed
                    ? "bg-gradient-to-br from-solar-400 to-solar-600 text-midnight-300"
                    : "bg-white/10 text-white/50"
                )}
              >
                {step.completed ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  step.completed ? "text-solar-400" : "text-white/50"
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 rounded-full",
                    step.completed ? "bg-solar-400" : "bg-white/10"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Basic Info Card */}
        <Card className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-squircle bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-glow-purple">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-1">
                  ¿Sobre qué es tu ranking?
                </h2>
                <p className="text-sm text-white/50">
                  Dale un título atractivo que capture la atención
                </p>
              </div>

              <Input
                placeholder="Ej: Las 10 Mejores Películas de Ciencia Ficción"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
              />

              <Textarea
                placeholder="Describe tu ranking y por qué es especial... (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none bg-white/5 border-white/10 rounded-squircle text-white placeholder:text-white/40"
              />

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-semibold text-white">
                  Categoría
                </label>
                {categoriesLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-10 w-24 rounded-full bg-white/10"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={cn(
                          "category-pill transition-all duration-200",
                          categoryId === cat.id && "active scale-105"
                        )}
                        style={{
                          borderColor:
                            categoryId === cat.id
                              ? `${cat.color}80`
                              : undefined,
                          backgroundColor:
                            categoryId === cat.id
                              ? `${cat.color}20`
                              : undefined,
                        }}
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

        {/* Add Items Card */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">
              Agrega tus ítems
            </h2>
            <p className="text-sm text-white/50">
              Escribe cada ítem y luego arrastra para ordenar ({items.length}/3
              mínimo)
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe el nombre del ítem..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="flex-1"
            />
            <Button onClick={addItem} className="gap-2 px-6">
              <Plus className="w-5 h-5" />
              Agregar
            </Button>
          </div>
        </Card>

        {/* Sortable Items List */}
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
                  <DraggableItem
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

        {/* Empty State */}
        {items.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <Plus className="w-10 h-10 text-white/30" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white mb-1">
                  Empieza a construir tu ranking
                </h3>
                <p className="text-white/50 text-sm">
                  Agrega al menos 3 ítems para crear tu podio
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Preview Podium */}
        {items.length >= 3 && (
          <Card className="p-6 glass-purple">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solar-500/20 mb-4">
                <Crown className="w-4 h-4 text-solar-400" />
                <span className="text-sm font-medium text-solar-400">
                  Vista previa del podio
                </span>
              </div>
            </div>

            <Podium
              items={items.slice(0, 3).map((item) => ({
                id: item.id,
                title: item.title,
                image: item.imageUrl,
              }))}
            />
          </Card>
        )}

        {/* Mobile Publish Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 glass-strong border-t border-white/5 md:hidden">
          <Button
            onClick={handlePublish}
            disabled={!canPublish || createRanking.isPending}
            size="lg"
            className="w-full"
          >
            {createRanking.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Publicar Ranking
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateRanking;

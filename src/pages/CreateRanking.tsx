import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  GripVertical,
  Trash2,
  Crown,
  Loader2,
  Check,
  Film,
  Tv,
  BookOpen,
  RotateCcw,
  Settings2,
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
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/hooks/useCategories";
import { useCreateRanking } from "@/hooks/useRankings";
import { Podium } from "@/components/neo/Podium";
import { MediaSearch, MediaTypeSelector, MediaCard, ScoreSlider, ScoreIndicator } from "@/components/neo";
import { cn } from "@/lib/utils";
import type { MediaSearchResult, MediaType } from "@/lib/mediaApi";
import type { SortMode } from "@/types/database";

interface RankingItemData {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  score?: number;
  review?: string;
  media?: MediaSearchResult;
  isManualPosition?: boolean;
}

// Wizard Steps
type Step = 'type' | 'info' | 'items' | 'preview';

// Media Type Card
function MediaTypeCard({
  type,
  icon: Icon,
  label,
  description,
  selected,
  onClick,
}: {
  type: MediaType;
  icon: typeof Film;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full p-6 rounded-2xl text-left transition-all",
        "border-2",
        selected
          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500"
          : "bg-white/5 border-white/10 hover:border-white/20"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            selected
              ? "bg-gradient-to-br from-purple-500 to-pink-500"
              : "bg-white/10"
          )}
        >
          <Icon className={cn("w-7 h-7", selected ? "text-white" : "text-white/60")} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

// Draggable Item Component with Score
function DraggableItem({
  item,
  index,
  onRemove,
  onScoreChange,
  showScore,
}: {
  item: RankingItemData;
  index: number;
  onRemove: (id: string) => void;
  onScoreChange: (id: string, score: number) => void;
  showScore: boolean;
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
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "glass rounded-2xl p-4",
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
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            "font-display font-bold text-sm",
            getBadgeStyle(index)
          )}
        >
          {index + 1}
        </div>

        {/* Cover image */}
        {item.imageUrl && (
          <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{item.title}</h4>
          {item.media && (
            <p className="text-sm text-white/50 truncate">
              {item.media.releaseYear}
              {item.media.author && ` • ${item.media.author}`}
              {item.media.director && ` • ${item.media.director}`}
            </p>
          )}
        </div>

        {/* Score */}
        {showScore && item.score && (
          <ScoreIndicator score={item.score} size="sm" />
        )}

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 rounded-lg text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Score Modal for new items
function ScoreModal({
  media,
  onSave,
  onCancel,
}: {
  media: MediaSearchResult;
  onSave: (score: number, review?: string) => void;
  onCancel: () => void;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [review, setReview] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-midnight-400 rounded-3xl p-6 space-y-6"
      >
        {/* Media Preview */}
        <div className="flex gap-4">
          {media.coverImageUrl && (
            <div className="w-20 h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
              <img
                src={media.coverImageUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{media.title}</h3>
            <p className="text-sm text-white/50">
              {media.releaseYear}
              {media.author && ` • ${media.author}`}
            </p>
          </div>
        </div>

        {/* Score Slider */}
        <div>
          <h4 className="text-sm font-semibold text-white/70 mb-4">¿Qué puntuación le das?</h4>
          <ScoreSlider value={score} onChange={setScore} size="lg" />
        </div>

        {/* Review (optional) */}
        <div>
          <h4 className="text-sm font-semibold text-white/70 mb-2">
            Mini reseña <span className="text-white/40">(opcional)</span>
          </h4>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="¿Por qué esta puntuación?"
            rows={2}
            className="bg-white/5 border-white/10 rounded-xl resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={score === null}
            onClick={() => score !== null && onSave(score, review || undefined)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const CreateRanking = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createRanking = useCreateRanking();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>('type');

  // Form state
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const [items, setItems] = useState<RankingItemData[]>([]);

  // Modal state
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-set category based on media type
  const autoSetCategory = (type: MediaType) => {
    if (!categories) return;
    const categoryMap: Record<MediaType, string> = {
      movie: 'cine',
      series: 'series',
      book: 'libros',
    };
    const cat = categories.find(c => c.slug === categoryMap[type] || c.slug === 'peliculas');
    if (cat) setCategoryId(cat.id);
  };

  // Sort items by score
  const sortedItems = useMemo(() => {
    if (sortMode === 'score') {
      return [...items].sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return items;
  }, [items, sortMode]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Mark items as manually positioned
        return newItems.map((item, i) => ({
          ...item,
          isManualPosition: true,
        }));
      });
      setSortMode('manual');

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleMediaSelect = (media: MediaSearchResult) => {
    setSelectedMedia(media);
  };

  const handleScoreSave = (score: number, review?: string) => {
    if (!selectedMedia) return;

    const newItem: RankingItemData = {
      id: `item-${Date.now()}`,
      title: selectedMedia.title,
      imageUrl: selectedMedia.coverImageUrl,
      score,
      review,
      media: selectedMedia,
    };

    setItems([...items, newItem]);
    setSelectedMedia(null);
    toast.success("¡Agregado al ranking!");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Ítem eliminado");
  };

  const updateItemScore = (id: string, score: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, score } : item))
    );
  };

  const resetToScoreOrder = () => {
    setSortMode('score');
    setItems(items.map(item => ({ ...item, isManualPosition: false })));
    toast.success("Orden restaurado por puntuación");
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
          media_type: mediaType,
          sort_mode: sortMode,
        },
        items: sortedItems.map((item, index) => ({
          title: item.title,
          image_url: item.imageUrl || null,
          link_url: item.linkUrl || null,
          position: index + 1,
          score: item.score || null,
          review: item.review || null,
          is_manual_position: item.isManualPosition || false,
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

  // Step validation
  const canProceed = {
    type: mediaType !== null,
    info: title.trim().length > 0 && categoryId,
    items: items.length >= 3,
    preview: canPublish,
  };

  const goToStep = (step: Step) => setCurrentStep(step);
  const nextStep = () => {
    const steps: Step[] = ['type', 'info', 'items', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-midnight pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
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

          {currentStep === 'preview' && (
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
          )}
        </div>
      </header>

      <main className="pt-20 max-w-2xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['type', 'info', 'items', 'preview'] as Step[]).map((step, i) => {
            const isActive = currentStep === step;
            const isPast = ['type', 'info', 'items', 'preview'].indexOf(currentStep) > i;
            return (
              <div key={step} className="flex items-center gap-2">
                <button
                  onClick={() => isPast && goToStep(step)}
                  disabled={!isPast}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "font-bold text-sm transition-all",
                    isActive
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                      : isPast
                      ? "bg-green-500 text-white cursor-pointer"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {isPast ? <Check className="w-4 h-4" /> : i + 1}
                </button>
                {i < 3 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 rounded-full",
                      isPast ? "bg-green-500" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Media Type Selection */}
          {currentStep === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¿Qué tipo de ranking vas a crear?
                </h2>
                <p className="text-white/50">
                  Selecciona el tipo de contenido para tu ranking
                </p>
              </div>

              <div className="space-y-4">
                <MediaTypeCard
                  type="movie"
                  icon={Film}
                  label="Películas"
                  description="Crea tu ranking de películas favoritas"
                  selected={mediaType === 'movie'}
                  onClick={() => {
                    setMediaType('movie');
                    autoSetCategory('movie');
                  }}
                />
                <MediaTypeCard
                  type="series"
                  icon={Tv}
                  label="Series"
                  description="Tu top de series que no te puedes perder"
                  selected={mediaType === 'series'}
                  onClick={() => {
                    setMediaType('series');
                    autoSetCategory('series');
                  }}
                />
                <MediaTypeCard
                  type="book"
                  icon={BookOpen}
                  label="Libros"
                  description="Comparte tus lecturas imprescindibles"
                  selected={mediaType === 'book'}
                  onClick={() => {
                    setMediaType('book');
                    autoSetCategory('book');
                  }}
                />
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                disabled={!canProceed.type}
                onClick={nextStep}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Información del ranking
                </h2>
                <p className="text-white/50">
                  Dale un título atractivo a tu ranking
                </p>
              </div>

              <Card variant="glass" className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-white/70 mb-2 block">
                      Título del ranking
                    </label>
                    <Input
                      placeholder="Ej: Mis películas favoritas de ciencia ficción"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/70 mb-2 block">
                      Descripción <span className="text-white/40">(opcional)</span>
                    </label>
                    <Textarea
                      placeholder="Cuéntanos más sobre tu ranking..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => goToStep('type')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceed.info}
                  onClick={nextStep}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Add Items */}
          {currentStep === 'items' && mediaType && (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Agrega elementos
                </h2>
                <p className="text-white/50">
                  Busca y puntúa cada elemento ({items.length}/3 mínimo)
                </p>
              </div>

              {/* Media Search */}
              <MediaSearch
                mediaType={mediaType}
                onSelect={handleMediaSelect}
              />

              {/* Sort Mode Toggle */}
              {items.length > 1 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/60">
                      Orden: {sortMode === 'score' ? 'Por puntuación' : 'Personalizado'}
                    </span>
                  </div>
                  {sortMode === 'manual' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetToScoreOrder}
                      className="text-purple-400"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restaurar
                    </Button>
                  )}
                </div>
              )}

              {/* Items List */}
              {sortedItems.length > 0 ? (
                <div className="space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortedItems}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {sortedItems.map((item, index) => (
                          <DraggableItem
                            key={item.id}
                            item={item}
                            index={index}
                            onRemove={removeItem}
                            onScoreChange={updateItemScore}
                            showScore={true}
                          />
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <Card variant="glass" className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="font-bold text-white mb-1">
                    Busca para agregar
                  </h3>
                  <p className="text-white/50 text-sm">
                    Usa el buscador de arriba para encontrar{' '}
                    {mediaType === 'movie' ? 'películas' : mediaType === 'series' ? 'series' : 'libros'}
                  </p>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => goToStep('info')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceed.items}
                  onClick={nextStep}
                >
                  Vista previa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Vista previa
                </h2>
                <p className="text-white/50">
                  Así se verá tu ranking
                </p>
              </div>

              {/* Preview Card */}
              <Card variant="glass" className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  {description && (
                    <p className="text-white/60 mt-2">{description}</p>
                  )}
                </div>

                {/* Podium Preview */}
                {sortedItems.length >= 3 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium text-white/70">Podio</span>
                    </div>
                    <Podium
                      items={sortedItems.slice(0, 3).map((item) => ({
                        id: item.id,
                        title: item.title,
                        image: item.imageUrl,
                      }))}
                    />
                  </div>
                )}

                {/* Full List */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  {sortedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-white/5"
                    >
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                        {index + 1}
                      </span>
                      {item.imageUrl && (
                        <div className="w-8 h-10 rounded overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="flex-1 text-white text-sm truncate">
                        {item.title}
                      </span>
                      {item.score && (
                        <ScoreIndicator score={item.score} size="xs" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => goToStep('items')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canPublish || createRanking.isPending}
                  onClick={handlePublish}
                >
                  {createRanking.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Score Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <ScoreModal
            media={selectedMedia}
            onSave={handleScoreSave}
            onCancel={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateRanking;

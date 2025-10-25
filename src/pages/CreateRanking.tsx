import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, GripVertical, X } from "lucide-react";
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

interface RankingItem {
  id: string;
  title: string;
  imageUrl?: string;
}

const SortableItem = ({
  item,
  index,
  onRemove,
}: {
  item: RankingItem;
  index: number;
  onRemove: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-lg p-4 flex items-center gap-3 ${
        isDragging ? "opacity-50 shadow-glow" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium">{item.title}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="text-destructive hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

const CreateRanking = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [items, setItems] = useState<RankingItem[]>([]);

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
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addItem = () => {
    if (!newItemTitle.trim()) {
      toast.error("Escribe un título para el ítem");
      return;
    }

    const newItem: RankingItem = {
      id: `item-${Date.now()}`,
      title: newItemTitle,
    };

    setItems([...items, newItem]);
    setNewItemTitle("");
    toast.success("Ítem agregado");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handlePublish = () => {
    if (!title.trim()) {
      toast.error("Dale un título a tu ranking");
      return;
    }

    if (items.length < 3) {
      toast.error("Necesitas al menos 3 ítems para tu ranking");
      return;
    }

    toast.success("¡Ranking publicado! 🎉");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <h1 className="text-xl font-bold flex-1">Crear Ranking</h1>
          <Button
            onClick={handlePublish}
            className="bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            Publicar
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Basic info */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Título</label>
            <Input
              placeholder="Ej: Mejores películas de ciencia ficción"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Descripción</label>
            <Textarea
              placeholder="Cuéntanos sobre este ranking..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Categoría</label>
            <Input
              placeholder="Ej: Cine, Música, Gastronomía..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </Card>

        {/* Add items */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Agrega ítems</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Título del ítem..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="flex-1"
            />
            <Button onClick={addItem} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          {items.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Arrastra para reordenar • {items.length} ítem{items.length !== 1 && "s"}
            </p>
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
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={removeItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {items.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Aún no has agregado ningún ítem.
              <br />
              Empieza a construir tu ranking 👆
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CreateRanking;

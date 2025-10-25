import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface RankingItemData {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
}

interface DraggableRankingItemProps {
  item: RankingItemData;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<RankingItemData>) => void;
}

export const DraggableRankingItem = ({
  item,
  index,
  onRemove,
  onUpdate,
}: DraggableRankingItemProps) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border-2 rounded-xl p-4 animate-scale-in",
        isDragging
          ? "border-primary shadow-glow opacity-50 scale-105"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none pt-2"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </div>

        {/* Position badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-glow">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title input */}
          <Input
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            placeholder="Nombre del ítem..."
            className="font-semibold text-base"
          />

          {/* Optional fields */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <Input
                value={item.imageUrl || ""}
                onChange={(e) => onUpdate(item.id, { imageUrl: e.target.value })}
                placeholder="URL de imagen (opcional)"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

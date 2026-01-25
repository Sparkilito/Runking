import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setSlug("");
    setIcon("");
    setColor("#8b5cf6");
    setEditingCategory(null);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setIcon(category.icon || "");
    setColor(category.color || "#8b5cf6");
    setIsDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingCategory) {
      // Auto-generate slug from name
      setSlug(
        value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Nombre y slug son requeridos");
      return;
    }

    setIsSaving(true);

    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({
            name: name.trim(),
            slug: slug.trim(),
            icon: icon.trim() || null,
            color: color || null,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Categoría actualizada");
      } else {
        // Create
        const { error } = await supabase.from("categories").insert({
          name: name.trim(),
          slug: slug.trim(),
          icon: icon.trim() || null,
          color: color || null,
        });

        if (error) throw error;
        toast.success("Categoría creada");
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Ya existe una categoría con ese slug");
      } else {
        toast.error("Error al guardar categoría");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">
            Gestiona las categorías de rankings
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Modifica los datos de la categoría"
                  : "Crea una nueva categoría para los rankings"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Tecnología"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="Ej: tecnologia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icono (nombre de Lucide)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Ej: laptop"
                />
                <p className="text-xs text-muted-foreground">
                  Ver iconos en lucide.dev/icons
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : editingCategory ? (
                  "Guardar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías ({categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: category.color || "#8b5cf6" }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.icon || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && categories?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay categorías
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

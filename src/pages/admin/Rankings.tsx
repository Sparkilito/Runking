import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreVertical, Star, StarOff, Trash2, Eye, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

export default function AdminRankings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: rankings, isLoading } = useQuery({
    queryKey: ["admin-rankings", debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from("rankings_with_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (debouncedSearch) {
        query = query.ilike("title", `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async (rankingId: string) => {
      const { data, error } = await supabase.rpc("toggle_ranking_featured", {
        ranking_uuid: rankingId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
      toast.success(newStatus ? "Ranking destacado" : "Ya no está destacado");
    },
    onError: () => {
      toast.error("Error al cambiar estado");
    },
  });

  const deleteRanking = useMutation({
    mutationFn: async (rankingId: string) => {
      const { error } = await supabase.rpc("admin_delete_ranking", {
        ranking_uuid: rankingId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
      toast.success("Ranking eliminado");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Error al eliminar");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rankings</h1>
        <p className="text-muted-foreground">
          Gestiona los rankings de la plataforma
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rankings table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Rankings ({rankings?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Interacciones</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings?.map((ranking: any) => (
                  <TableRow key={ranking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {ranking.title}
                          {ranking.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      @{ranking.author_username}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ranking.category_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {ranking.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {ranking.comments_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {ranking.views_count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ranking.is_reported ? (
                        <Badge variant="destructive">Reportado</Badge>
                      ) : ranking.is_published ? (
                        <Badge variant="secondary">Publicado</Badge>
                      ) : (
                        <Badge variant="outline">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ranking.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/ranking/${ranking.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver ranking
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured.mutate(ranking.id)}
                          >
                            {ranking.is_featured ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                Quitar destacado
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Destacar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(ranking.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && rankings?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron rankings
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ranking?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ranking será eliminado
              permanentemente junto con todos sus comentarios y likes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteRanking.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

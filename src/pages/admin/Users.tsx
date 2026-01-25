import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, MoreVertical, Shield, ShieldOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_users", {
        search_query: debouncedSearch || null,
        limit_count: 50,
        offset_count: 0,
      });
      if (error) throw error;
      return data;
    },
  });

  const toggleSuspension = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("toggle_user_suspension", {
        user_uuid: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(newStatus ? "Usuario suspendido" : "Suspensión removida");
    },
    onError: () => {
      toast.error("Error al cambiar estado");
    },
  });

  const toggleVerification = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("toggle_user_verification", {
        user_uuid: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(newStatus ? "Usuario verificado" : "Verificación removida");
    },
    onError: () => {
      toast.error("Error al cambiar estado");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios de la plataforma
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rankings</TableHead>
                  <TableHead>Seguidores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {(user.display_name || user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-1">
                            {user.display_name || user.username}
                            {user.is_verified && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                            {user.is_admin && (
                              <Shield className="w-4 h-4 text-orange-500" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.rankings_count}</TableCell>
                    <TableCell>{user.followers_count}</TableCell>
                    <TableCell>
                      {user.is_suspended ? (
                        <Badge variant="destructive">Suspendido</Badge>
                      ) : (
                        <Badge variant="secondary">Activo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(user.created_at), {
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
                            onClick={() => toggleVerification.mutate(user.id)}
                          >
                            {user.is_verified ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Quitar verificación
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verificar usuario
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleSuspension.mutate(user.id)}
                            className={user.is_suspended ? "" : "text-destructive"}
                          >
                            {user.is_suspended ? (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Reactivar cuenta
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-4 h-4 mr-2" />
                                Suspender cuenta
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && users?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

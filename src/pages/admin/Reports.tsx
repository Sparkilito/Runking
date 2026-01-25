import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminReports() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey (username, display_name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const resolveReport = useMutation({
    mutationFn: async ({
      reportId,
      newStatus,
    }: {
      reportId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase.rpc("resolve_report", {
        report_uuid: reportId,
        new_status: newStatus,
        admin_uuid: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Reporte actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar reporte");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendiente</Badge>;
      case "reviewed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Revisado</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Resuelto</Badge>;
      case "dismissed":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Descartado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "ranking":
        return "Ranking";
      case "comment":
        return "Comentario";
      case "user":
        return "Usuario";
      default:
        return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Revisa y gestiona los reportes de contenido
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="reviewed">Revisados</SelectItem>
            <SelectItem value="resolved">Resueltos</SelectItem>
            <SelectItem value="dismissed">Descartados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reportes ({reports?.length || 0})</CardTitle>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {getContentTypeLabel(report.content_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{report.reason}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {report.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      @{report.reporter?.username}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.content_type === "ranking" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/ranking/${report.content_id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {report.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                resolveReport.mutate({
                                  reportId: report.id,
                                  newStatus: "resolved",
                                })
                              }
                              className="gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Resolver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                resolveReport.mutate({
                                  reportId: report.id,
                                  newStatus: "dismissed",
                                })
                              }
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Descartar
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && reports?.length === 0 && (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No hay reportes {statusFilter !== "all" && `con estado "${statusFilter}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

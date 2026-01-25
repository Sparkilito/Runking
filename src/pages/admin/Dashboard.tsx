import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ListOrdered,
  Heart,
  MessageCircle,
  Flag,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      if (error) throw error;
      return data[0];
    },
  });

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats?.total_users || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Rankings",
      value: stats?.total_rankings || 0,
      icon: ListOrdered,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Likes",
      value: stats?.total_likes || 0,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Total Comentarios",
      value: stats?.total_comments || 0,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Reportes Pendientes",
      value: stats?.pending_reports || 0,
      icon: Flag,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Usuarios Hoy",
      value: stats?.users_today || 0,
      icon: UserPlus,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Rankings Hoy",
      value: stats?.rankings_today || 0,
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array(7)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
          : statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/reports"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Flag className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Revisar Reportes</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.pending_reports || 0} pendientes
                </p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Gestionar Usuarios</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.total_users || 0} usuarios
                </p>
              </div>
            </a>
            <a
              href="/admin/rankings"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ListOrdered className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Ver Rankings</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.total_rankings || 0} publicados
                </p>
              </div>
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ListOrdered className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Categorías</p>
                <p className="text-sm text-muted-foreground">
                  Gestionar categorías
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

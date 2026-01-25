import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Bell, Heart, MessageCircle, UserPlus, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useUnreadNotificationsCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Notification } from "@/types/database";

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'like':
      return <Heart className="w-5 h-5 text-destructive" />;
    case 'comment':
      return <MessageCircle className="w-5 h-5 text-primary" />;
    case 'follow':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate based on type
    if (notification.reference_type === 'ranking' && notification.reference_id) {
      navigate(`/ranking/${notification.reference_id}`);
    } else if (notification.reference_type === 'user' && notification.reference_id) {
      // For follows, navigate to user profile - would need username
      // For now, just mark as read
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-bold flex-1">Notificaciones</h1>
          {unreadCount && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todo leído
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-border">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-colors text-left ${
                  notification.is_read
                    ? "border-border bg-background hover:bg-muted/50"
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.is_read ? "bg-muted" : "bg-primary/10"
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${!notification.is_read && "text-primary"}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">Sin notificaciones</h3>
            <p className="text-muted-foreground">
              Te avisaremos cuando alguien interactúe con tus rankings
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;

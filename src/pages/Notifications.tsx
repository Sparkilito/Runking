import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-black">Notificaciones</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">Sin notificaciones</h3>
          <p className="text-muted-foreground">
            Te avisaremos cuando alguien interactúe con tus rankings
          </p>
        </div>
      </main>
    </div>
  );
};

export default Notifications;

import { Logo } from "@/components/Logo";
import { Settings, Grid3x3, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-bold flex-1">Perfil</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Profile info */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-3xl font-black">
            TÚ
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tu Nombre</h2>
            <p className="text-muted-foreground">@tunombre</p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Rankings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Siguiendo</p>
            </div>
          </div>

          <Button className="bg-gradient-primary text-primary-foreground font-semibold shadow-glow">
            Editar perfil
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="rankings" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="w-4 h-4" />
              Me gusta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="mt-6">
            <div className="text-center py-16">
              <Grid3x3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">Sin rankings aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer ranking y compártelo con el mundo
              </p>
              <Button className="bg-gradient-primary text-primary-foreground font-semibold">
                Crear ranking
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">Sin rankings guardados</h3>
              <p className="text-muted-foreground">
                Dale like a los rankings que te gusten
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;

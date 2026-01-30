import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: { container: "w-10 h-10", ring: "w-12 h-12" },
    md: { container: "w-16 h-16", ring: "w-20 h-20" },
    lg: { container: "w-24 h-24", ring: "w-28 h-28" },
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative flex items-center justify-center">
        {/* Outer glow pulse */}
        <div
          className={cn(
            sizes[size].ring,
            "absolute rounded-full",
            "bg-gradient-to-r from-purple-500/20 via-solar-500/20 to-purple-500/20",
            "blur-2xl"
          )}
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        />

        {/* Rotating gradient ring */}
        <div
          className={cn(
            sizes[size].ring,
            "absolute rounded-full",
            "bg-gradient-conic from-purple-500 via-solar-500 to-purple-500",
            "opacity-80"
          )}
          style={{
            animation: "spin 1.5s linear infinite",
            background: "conic-gradient(from 0deg, #8B5CF6, #F59E0B, #8B5CF6)",
            WebkitMaskImage: "radial-gradient(transparent 60%, black 61%)",
            maskImage: "radial-gradient(transparent 60%, black 61%)",
          }}
        />

        {/* Inner dark circle */}
        <div
          className={cn(
            sizes[size].container,
            "absolute rounded-full bg-midnight"
          )}
        />

        {/* Mascot/Isotipo with floating animation */}
        <img
          src="/isotipo.png"
          alt="Cargando"
          className={cn(
            sizes[size].container,
            "relative z-10 object-contain p-1"
          )}
          style={{
            animation: "float 2s ease-in-out infinite",
          }}
        />
      </div>

      {text && (
        <p className="text-white/60 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

// Full page loading screen
export function LoadingScreen({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline loading (for use inside pages/cards)
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Glow effect */}
        <div
          className={cn(
            sizes[size],
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-purple-500/30 to-solar-500/30",
            "blur-xl animate-pulse"
          )}
        />

        {/* Rotating ring */}
        <div
          className={cn(
            sizes[size],
            "absolute inset-0 rounded-full",
            "border-4 border-transparent",
            "border-t-purple-500 border-r-solar-500",
            "animate-spin"
          )}
          style={{ animationDuration: "1s" }}
        />

        {/* Mascot/Isotipo */}
        <img
          src="/isotipo.png"
          alt="Loading"
          className={cn(
            sizes[size],
            "relative z-10",
            "animate-bounce"
          )}
          style={{ animationDuration: "0.8s" }}
        />
      </div>

      {text && (
        <p className="text-white/60 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
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

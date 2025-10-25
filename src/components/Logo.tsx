import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform hover:scale-105",
        sizeClasses[size]
      )}>
        <Crown className={cn(
          "text-primary-foreground",
          size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-5 h-5" : "w-7 h-7"
        )} />
      </div>
      {showText && (
        <span className={cn(
          "font-black bg-gradient-primary bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          RunKing
        </span>
      )}
    </div>
  );
};

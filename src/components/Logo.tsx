import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/logo.png"
        alt="RunKing"
        className={cn(
          "object-contain",
          sizeClasses[size],
          !showText && "max-w-[40px]"
        )}
      />
    </div>
  );
};

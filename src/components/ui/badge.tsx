import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-heading font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default purple badge
        default:
          "border-transparent bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
        // Solar/gold badge for highlights
        solar:
          "border-transparent bg-solar-500/20 text-solar-400 hover:bg-solar-500/30",
        // Cyan accent badge
        cyan: "border-transparent bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30",
        // Glass badge
        secondary:
          "border-white/10 bg-white/5 text-white/80 backdrop-blur-sm hover:bg-white/10",
        // Destructive/error badge
        destructive:
          "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30",
        // Outline badge
        outline:
          "border-white/20 bg-transparent text-white/80 hover:bg-white/5",
        // Success badge
        success:
          "border-transparent bg-green-500/20 text-green-400 hover:bg-green-500/30",
        // Podium badges
        gold: "border-transparent bg-gradient-to-br from-yellow-400 to-yellow-600 text-midnight-300 shadow-sm",
        silver:
          "border-transparent bg-gradient-to-br from-gray-300 to-gray-500 text-midnight-300 shadow-sm",
        bronze:
          "border-transparent bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

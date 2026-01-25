import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-12 w-full px-4 py-3 text-base font-body",
          // Glass effect
          "bg-white/5 backdrop-blur-sm",
          "border border-white/10 rounded-squircle",
          // Text styling
          "text-white placeholder:text-white/40",
          // Focus states
          "focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:ring-2 focus-visible:ring-purple-500/20",
          // Hover state
          "hover:bg-white/8 hover:border-white/15",
          // Transitions
          "transition-all duration-200",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Clay Button - Primary CTA (Solar Yellow)
        default:
          "bg-gradient-to-br from-solar-500 to-solar-600 text-midnight-300 rounded-squircle shadow-clay hover:shadow-clay-lg hover:-translate-y-0.5 active:shadow-clay-pressed active:translate-y-0",
        // Clay Purple
        primary:
          "bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-squircle shadow-clay hover:shadow-clay-lg hover:-translate-y-0.5 active:shadow-clay-pressed active:translate-y-0",
        // Clay Cyan
        cyan: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-midnight-300 rounded-squircle shadow-clay hover:shadow-clay-lg hover:-translate-y-0.5 active:shadow-clay-pressed active:translate-y-0",
        // Glass secondary button
        secondary:
          "glass rounded-squircle text-white hover:bg-white/10 active:bg-white/5",
        // Destructive
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-squircle shadow-clay hover:shadow-clay-lg hover:-translate-y-0.5 active:shadow-clay-pressed",
        // Outline with glass effect
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-sm rounded-squircle text-white hover:bg-white/10 hover:border-white/30",
        // Ghost - minimal style
        ghost:
          "rounded-squircle text-white/80 hover:bg-white/10 hover:text-white",
        // Link style
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 py-1.5 text-sm rounded-[16px]",
        lg: "h-14 px-8 py-3 text-base rounded-squircle-md",
        xl: "h-16 px-10 py-4 text-lg rounded-squircle-lg",
        icon: "h-11 w-11 rounded-squircle",
        "icon-sm": "h-9 w-9 rounded-[16px]",
        "icon-lg": "h-14 w-14 rounded-squircle-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

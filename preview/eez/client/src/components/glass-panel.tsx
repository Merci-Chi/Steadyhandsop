import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl" | "2xl";
  opacity?: "low" | "medium" | "high";
  border?: boolean;
}

const blurClasses = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
};

const opacityClasses = {
  low: "bg-background/30 dark:bg-background/20",
  medium: "bg-background/50 dark:bg-background/40",
  high: "bg-background/70 dark:bg-background/60",
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, blur = "lg", opacity = "medium", border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          blurClasses[blur],
          opacityClasses[opacity],
          border && "border border-white/10 dark:border-white/5",
          "rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

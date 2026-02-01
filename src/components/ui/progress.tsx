import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "gradient" | "success";
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel, variant = "default", size = "md", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    const variantClasses = {
      default: "bg-gradient-primary",
      gradient: "bg-gradient-to-r from-primary via-accent to-success",
      success: "bg-gradient-success",
    };

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        <div
          className={cn(
            "relative w-full rounded-full bg-muted overflow-hidden",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out progress-animate",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="mt-1 text-xs text-muted-foreground">{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };

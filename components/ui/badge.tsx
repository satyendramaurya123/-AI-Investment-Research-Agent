import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
        secondary:
          "border-transparent bg-slate-700/50 text-slate-300 border-slate-600/30",
        destructive:
          "border-transparent bg-rose-600/20 text-rose-300 border-rose-500/30",
        outline:
          "text-slate-300 border-slate-600",
        success:
          "border-transparent bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
        warning:
          "border-transparent bg-amber-600/20 text-amber-300 border-amber-500/30",
        invest:
          "border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold uppercase tracking-wide",
        hold:
          "border-transparent bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold uppercase tracking-wide",
        pass:
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold uppercase tracking-wide",
        positive:
          "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        negative:
          "border-transparent bg-rose-500/15 text-rose-400 border-rose-500/25",
        neutral:
          "border-transparent bg-slate-500/15 text-slate-400 border-slate-500/25",
        purple:
          "border-transparent bg-purple-600/20 text-purple-300 border-purple-500/30",
        cyan:
          "border-transparent bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

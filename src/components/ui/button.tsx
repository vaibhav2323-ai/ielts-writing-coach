import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold",
    "rounded-md ring-offset-background transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "tracking-[-0.01em]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-indigo-600 text-white shadow-sm",
          "hover:bg-indigo-500 hover:scale-[1.01] hover:shadow-md",
          "active:scale-[0.99]",
        ].join(" "),
        destructive: [
          "bg-red-600 text-white",
          "hover:bg-red-500 hover:scale-[1.01]",
        ].join(" "),
        outline: [
          "border border-zinc-800 bg-transparent text-zinc-300",
          "hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100",
        ].join(" "),
        secondary: [
          "bg-zinc-800 text-zinc-200",
          "hover:bg-zinc-700 hover:scale-[1.01]",
        ].join(" "),
        ghost: [
          "text-zinc-400",
          "hover:bg-zinc-800/60 hover:text-zinc-200",
        ].join(" "),
        link: "text-indigo-400 underline-offset-4 hover:underline",
        indigo: [
          "bg-indigo-600/15 text-indigo-300 border border-indigo-600/25",
          "hover:bg-indigo-600/25 hover:border-indigo-500/40 hover:text-indigo-200",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-md px-6",
        icon:    "h-9 w-9",
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

import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
      {...props}
    />
  );
});

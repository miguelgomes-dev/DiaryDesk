import { type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** CSS color for a ribbon-bookmark tag in the card's top-left corner, marking it as an unwritten page. */
  ribbon?: string;
};

export function Card({ className = "", ribbon, children, ...props }: CardProps) {
  return (
    <div
      className={`relative rounded-lg border border-foreground/10 bg-foreground/[0.02] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${className}`}
      {...props}
    >
      {ribbon && (
        <span aria-hidden className="ribbon ribbon-card" style={{ backgroundColor: ribbon }} />
      )}
      {children}
    </div>
  );
}

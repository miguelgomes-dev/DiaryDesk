import Link from "next/link";

type LogoSize = "sm" | "lg";

const SIZES: Record<LogoSize, { text: string; icon: string }> = {
  sm: { text: "text-lg", icon: "h-5 w-5" },
  lg: { text: "text-2xl", icon: "h-7 w-7" },
};

type LogoProps = {
  size?: LogoSize;
  href?: string;
  className?: string;
};

export function Logo({ size = "lg", href = "/", className = "" }: LogoProps) {
  const { text, icon } = SIZES[size];

  return (
    <Link href={href} className={`flex items-center gap-2 leading-none ${className}`}>
      <svg viewBox="0 0 32 44" className={icon} aria-hidden>
        <path d="M6 12 Q16 8 16 12 V36 Q16 32 6 36 Z" fill="var(--accent)" />
        <path
          d="M26 12 Q16 8 16 12 V36 Q16 32 26 36 Z"
          fill="var(--accent)"
          opacity="0.65"
        />
      </svg>
      <span className={`font-serif italic ${text}`}>Diary Desk</span>
    </Link>
  );
}

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ruled flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <Link href="/login" className="leading-none">
        <span className="font-serif text-2xl italic">Diary</span>
        <span className="ml-0.5 font-mono text-xs font-medium tracking-[0.2em] text-foreground/50">
          DESK
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

import { Logo } from "@/components/app-shell/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ruled flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <Logo size="lg" href="/login" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

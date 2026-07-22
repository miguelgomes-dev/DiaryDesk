import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/app-shell/nav";
import { Logo } from "@/components/app-shell/logo";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifySession();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col border-b border-foreground/10 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-6 py-4 md:px-5 md:py-6">
          <Logo size="sm" href="/" />
          <form action={logout} className="md:hidden">
            <Button type="submit" variant="ghost" className="h-8 px-2 text-xs">
              Sair
            </Button>
          </form>
        </div>
        <div className="border-t border-foreground/10 px-2 py-1 md:flex-1 md:border-t-0 md:px-3 md:py-0">
          <AppNav />
        </div>
        <div className="hidden flex-col gap-2 border-t border-foreground/10 px-5 py-4 text-sm text-foreground/60 md:flex">
          <span className="truncate">{user.email}</span>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="h-8 justify-start px-2"
            >
              Sair
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

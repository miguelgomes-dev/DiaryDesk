import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="animate-rise">
      <h1 className="mb-6 text-2xl font-[650] tracking-[-0.033em]">Entrar no DiaryDesk</h1>
      <form action={login} className="flex flex-col gap-4">
        <Field label="Email">
          <Input type="email" name="email" required autoComplete="email" />
        </Field>
        <Field label="Senha" error={error}>
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit" className="mt-2">
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        Ainda não tem conta?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}

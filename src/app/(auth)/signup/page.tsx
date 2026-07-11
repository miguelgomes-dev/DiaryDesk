import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card ribbon="var(--accent)" className="animate-rise">
      <h1 className="mb-6 font-serif text-2xl italic">Criar conta</h1>
      <form action={signup} className="flex flex-col gap-4">
        <Field label="Nome">
          <Input type="text" name="displayName" required autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" required autoComplete="email" />
        </Field>
        <Field label="Senha" error={error}>
          <Input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className="mt-2">
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}

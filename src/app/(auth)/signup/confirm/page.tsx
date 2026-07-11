import { Card } from "@/components/ui/card";

export default function SignupConfirmPage() {
  return (
    <Card ribbon="var(--thread-saude)" className="animate-rise">
      <h1 className="mb-2 font-serif text-2xl italic">Confirme seu email</h1>
      <p className="text-sm text-foreground/70">
        Enviamos um link de confirmação para o seu email. Abra-o para ativar
        sua conta e depois volte para entrar.
      </p>
    </Card>
  );
}

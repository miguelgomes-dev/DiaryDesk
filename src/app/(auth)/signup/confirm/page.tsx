import { Card } from "@/components/ui/card";

export default function SignupConfirmPage() {
  return (
    <Card className="animate-rise">
      <h1 className="mb-2 text-2xl font-[650] tracking-[-0.033em]">Confirme seu email</h1>
      <p className="text-sm text-foreground/70">
        Enviamos um link de confirmação para o seu email. Abra-o para ativar
        sua conta e depois volte para entrar.
      </p>
    </Card>
  );
}

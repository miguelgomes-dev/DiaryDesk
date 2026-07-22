# Plano de Implementação — DiaryDesk

## Contexto

O repositório hoje é só o esqueleto do `create-next-app` (Next.js 16.2.10 / React 19) — nada do produto foi construído ainda. O escopo já está definido em `docs/project-scope.md` (problema, features, stack Next.js + Supabase) e o modelo de dados já está desenhado em `docs/schema.sql` (tabelas, RLS, view `calendar_events`, função `expand_task_occurrences`). Faltava um plano que quebrasse esse escopo em fases e grupos de trabalho pequenos e executáveis — é isso que este documento resolve.

Como o projeto também é veículo de aprendizado pessoal (conforme `project-scope.md`), a sequência abaixo prioriza construir os fundamentos (auth, camada de dados, componentes base) antes de paralelizar as features de produto, que são bem isoladas umas das outras.

Nota técnica importante: este Next.js é a v16, que **renomeou `middleware` para `proxy`** (`proxy.ts` na raiz/`src`) e recomenda um Data Access Layer (DAL) centralizando verificação de sessão — usado no plano abaixo em vez de padrões antigos de `middleware.ts`.

## Premissas assumidas (ajustar se erradas)

- **Deploy**: Vercel — influencia a escolha de cron para as notificações push (Vercel Cron Jobs).
- **"Admin"**: no MVP não terá painel próprio; é só uma terceira conta possível sem feature diferenciada (o schema não tem coluna de `role`). Se houver necessidade real de admin, isso é revisitado depois do MVP.
- **Auth**: Supabase Auth (email/senha) via `@supabase/ssr`, com `proxy.ts` cuidando do refresh de sessão e do redirecionamento de rotas protegidas.

## Fase 0 — Fundação (bloqueia tudo o resto)

**0.1 Setup Supabase**: criar projeto, aplicar `docs/schema.sql`, criar bucket de Storage para exames em PDF, configurar `.env.local` (URL, anon key, service role).

**0.2 Cliente Supabase no Next**: `lib/supabase/client.ts` (browser) e `lib/supabase/server.ts` (server, via `@supabase/ssr`); `proxy.ts` na raiz para refresh de sessão em cada request.

**0.3 Autenticação**: páginas de login/signup com Server Actions (`app/actions/auth.ts`), logout, criação automática da linha em `profiles` no signup.

**0.4 Shell da aplicação**: route groups `(auth)` (público) e `(app)` (protegido), layout autenticado com navegação entre Tarefas/Financeiro/Saúde/Faculdade/Trabalho/Dashboard, e `lib/dal.ts` com `getUser()`/`verifySession()` memoizado (`cache()`) reusado por toda feature.

**0.5 Base de UI**: componentes mínimos reaproveitáveis em `src/components/ui` (Button, Input, Card, Modal/Dialog, Toast) usando Tailwind v4 (já configurado em `globals.css`).

## Fase 1 — MVP (grupos independentes entre si, exceto onde anotado)

Cada grupo é uma fatia vertical (schema já existe → Server Actions/Route Handlers → UI) e pode ser feito e testado isoladamente após a Fase 0.

1. ✅ **Tarefas (CRUD básico)** — `tasks` sem recorrência ainda, com UI de calendário (`@fullcalendar/react` + `daygrid` + `interaction`, clicar no dia para adicionar) reaproveitado depois no grupo 3. Inclui CRUD de `task_categories` (tags): cada usuário recebe 5 categorias default no primeiro login (Trabalho, Faculdade, Amor, Saúde, Casa) e pode adicionar/renomear/remover as próprias.
2. ✅ **Recorrência de tarefas** — `recurrence_*` no formulário de tarefa (frequência, intervalo, dias da semana, data final) + `task_completions` (marcar ocorrência como feita/pulada, com desfazer). Implementado junto com o Item 3.
3. ✅ **Calendário unificado** — o calendário de `/tarefas` agora combina tarefas não-recorrentes, ocorrências expandidas de tarefas recorrentes e (via `calendar_events` filtrada a `source_type in ('faculdade','trabalho')`) o que vier dos grupos 8/9 quando existirem. *(depende de 1 e 2 — concluído)*
   - **Desvio da função SQL `expand_task_occurrences`**: a função usa `generate_series` com passo fixo de N semanas a partir da data de início, o que só revisita o mesmo dia da semana do início — não suporta uma regra semanal com múltiplos dias da semana (ex: seg+qui), que o formulário permite selecionar. A expansão de ocorrências foi movida para TypeScript (`src/app/actions/task-occurrences.ts`), como o próprio comentário do schema já sugeria ("considere mover isso para a aplicação"). A função SQL continua no banco mas não é mais usada pelo app.
4. **Financeiro — lançamentos manuais** — `transaction_categories` + `transactions`.
5. **Financeiro — investimentos** — `investment_snapshots` + resumo mensal simples.
6. **Saúde — peso** — `weight_logs` (log + gráfico simples de evolução).
7. **Saúde — exames e consultas** — upload de PDF pro Storage com `retention_expires_on` (~1 ano), `health_appointments`.
8. **Faculdade** — `courses` + `assessments`, cálculo de média ponderada e nota mínima necessária (client-side, conforme comentário do schema).
9. **Trabalho** — `work_projects` + `work_items` (kanban simples todo/doing/done).
10. **Dashboard v1** — só compromissos do dia, lendo de `calendar_events`. *(depende de 3)*
11. **Notificações push — inscrição** — chaves VAPID, `public/sw.js`, `push_subscriptions`, Server Actions subscribe/unsubscribe.
12. **Notificações push — disparo agendado** — Vercel Cron chamando um Route Handler que varre compromissos próximos (via `calendar_events`) e envia push. *(depende de 3 e 11)*
13. **PWA** — `app/manifest.ts`, ícones, checagem de instalabilidade.
14. **Hardening e deploy** — revisão de todas as policies de RLS, error boundaries (`error.tsx`), loading states (`loading.tsx`), teste manual ponta a ponta com as duas contas reais, deploy na Vercel. *(sempre por último)*

## Fase 2 — Pós-MVP (adiado conforme `project-scope.md`)

- Importação de extrato bancário (CSV/OFX) + categorização automática.
- Métricas adicionais no Dashboard (saldo financeiro, progresso acadêmico, evolução de peso).
- O que mais surgir do uso real do sistema.

## Ordem recomendada

Fase 0 é sequencial e obrigatória antes de tudo. Dentro da Fase 1, os grupos 1–10 podem ser feitos em qualquer ordem / paralelizados (são features isoladas por domínio); 11–12 dependem do calendário unificado existir; 13 é independente; 14 é sempre o encerramento.

## Verificação

Para cada grupo de feature: rodar `npm run dev`, logar com uma das duas contas, exercitar o CRUD da tela, depois logar com a segunda conta e confirmar isolamento de dados (RLS) — cada usuário só vê suas próprias linhas. Para o calendário unificado, conferir que tarefas recorrentes, avaliações e itens de trabalho com prazo aparecem juntos. Para push, testar subscribe/unsubscribe e um envio manual antes de plugar o cron.

## Arquivos críticos

- `docs/project-scope.md`, `docs/schema.sql` — fonte da verdade de escopo e modelo de dados, não duplicar essa informação em código sem necessidade.
- `src/app/layout.tsx` e `src/app/page.tsx` — atualmente o boilerplate do `create-next-app`, serão substituídos pelo shell real na Fase 0.
- `proxy.ts` (novo, raiz do projeto) — substitui o antigo `middleware.ts` no Next 16.
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/dal.ts` (novos) — usados por todas as features subsequentes.

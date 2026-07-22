---
name: run-diarydesk
description: Explica como rodar o DiaryDesk localmente em modo de desenvolvimento (npm run dev), incluindo pré-requisitos de ambiente (.env.local com chaves do Supabase) e como resolver os problemas mais comuns de arranque. Use sempre que o usuário pedir para rodar, iniciar, subir ou testar a aplicação localmente, ou perguntar "como eu rodo isso", mesmo sem mencionar o nome da skill.
---

# Rodar o DiaryDesk (modo desenvolvimento)

DiaryDesk é uma aplicação Next.js (App Router) com Supabase como backend. Este projeto usa **npm** como gerenciador de pacotes (há `package-lock.json` na raiz — não use `pnpm`/`yarn`/`bun`).

## Passo a passo

1. **Dependências instaladas?** Se a pasta `node_modules/` não existir (ou o comando `dev` falhar por módulo faltando), rode primeiro:
   ```bash
   npm install
   ```

2. **Variáveis de ambiente.** O app depende do Supabase e não sobe corretamente sem elas. Verifique se existe `.env.local` na raiz do projeto:
   - Se não existir, copie o template: `cp .env.local.example .env.local`
   - Preencha as três chaves necessárias (ver `.env.local.example`):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Essas chaves vêm do painel do projeto Supabase (Settings → API). Se o usuário não souber os valores, pergunte a ele antes de prosseguir — não invente valores.

3. **Suba o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação fica disponível em [http://localhost:3000](http://localhost:3000). O servidor recarrega automaticamente ao salvar arquivos (Hot Module Reloading).

## Coisas específicas desta versão do Next.js (16.x)

Este projeto usa Next.js 16, que tem mudanças relevantes em relação a versões mais antigas — não assuma o comportamento de versões anteriores:

- **Turbopack é o bundler padrão** em `next dev` (e em `next build`). Não é preciso passar `--turbopack`; só use `--webpack` se precisar depurar algo específico do Webpack.
- **A saída do dev vai para `.next/dev`**, não para `.next` (que é usado só por `next build`). Isso é intencional: permite rodar `next dev` e `next build` ao mesmo tempo sem conflito. Se for inspecionar artefatos de build manualmente, procure na pasta certa.

## Problemas comuns

- **Porta 3000 já em uso:** rode em outra porta com `npm run dev -- -p 4000` (o `--` é necessário porque é `npm run`, não `next` direto) ou defina `PORT=4000` na linha de comando (não funciona dentro de `.env`, pois a porta é definida antes do restante do app carregar).
- **Erros relacionados a autenticação/Supabase logo na tela inicial:** normalmente indica que `.env.local` está ausente ou com chaves erradas/expiradas — revise o passo 2 antes de investigar o código.

## Problem

Hoje em dia eu acabo perdendo meus compromissos, tarefas, não tenho um lugar para organizar meu dinheiro, não tenho um lugar para controlar minha saúde, perda de peso, nem um lugar para controlar minha produtividade na faculdade e no trabalho, e mesmo se procurasse isso, teria que ir em diversos sites diferentes

## Solution

Criar um site pessoal aonde eu consigo ter acesso a tudo isso e possa crescer futuramente, quando necessário, o escopo do projeto é pessoal, apenas para eu e minha mulher, ou seja, dois usuários e o admin.

Objetivo secundário: este projeto também é um veículo de aprendizado pessoal de desenvolvimento web. Escolhas de stack e ferramentas devem priorizar valor de aprendizado, não só velocidade de entrega.

## Modelo de dados e usuários

- Dois usuários finais (eu e minha esposa) + admin. Cada usuário tem login próprio.
- Dados são **separados por usuário** em todas as telas (financeiro, saúde, faculdade, trabalho, tarefas) — sem compartilhamento automático entre contas.
- **Calendário unificado**: compromissos de Tarefas, Faculdade e Trabalho aparecem numa visão única de calendário, em vez de ficarem isolados por tela.
- Notificações: push via navegador/PWA (web push) para lembrar de compromissos e tarefas.

## Features

- **Tarefas** — calendário para adicionar tarefas por dia e hora. Alimenta o calendário unificado junto com prazos de Faculdade e Trabalho.

- **Financeiro** — controle de gastos diários, mensais, salários e investimentos.
  - v1: lançamentos manuais.
  - Fase 2: importação de extrato bancário (CSV/OFX). Adiado porque parsing de formatos de banco e categorização automática é a parte mais complexa do sistema — melhor validar o resto do produto antes de investir nisso.

- **Dashboard** — visão de desempenho das telas anteriores.
  - v1: apenas compromissos do dia (do calendário unificado).
  - Métricas adicionais (saldo financeiro, progresso acadêmico, evolução de peso) ficam para depois do v1.

- **Saúde** — controle de peso, exames médicos, consultas.
  - Upload de exames em PDF, com retenção de ~1 ano.
  - Dados de saúde são individuais (não compartilhados entre os dois usuários).

- **Faculdade** — controle de notas, cálculo de média e nota mínima para passar.

- **Trabalho** — acompanhamento de projetos e tarefas do trabalho.

## Stack

- **Next.js** (React) no frontend/backend, com TypeScript.
- **Supabase** (Postgres + Auth + Storage) como backend gerenciado — cobre login separado por usuário, banco de dados relacional e armazenamento de arquivos (PDFs de exame) sem precisar montar essa infraestrutura do zero.
- Justificativa: como o projeto também serve para aprender desenvolvimento web, essa combinação ensina fundamentos reais (React, rotas de API, autenticação, modelagem de banco) sem exigir que toda a infraestrutura seja construída manualmente logo de início. Pode ser revisitada conforme o aprendizado avançar.

## Roadmap (fases)

- **Fase 1 (MVP)**: Tarefas + calendário unificado, Financeiro manual, Saúde (peso + upload de exames), Faculdade, Trabalho, Dashboard simples (compromissos do dia), notificações push.
- **Fase 2**: Importação de extrato bancário, métricas adicionais no Dashboard (saldo, progresso acadêmico, evolução de peso), o que mais surgir com o uso real do sistema.
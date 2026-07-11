-- ============================================================
-- DiaryDesk — schema Postgres (Supabase)
-- Auth é gerenciado pelo Supabase (auth.users). Toda tabela de
-- domínio tem user_id e RLS restringindo cada usuário às próprias
-- linhas (dados separados por usuário, conforme decidido no escopo).
-- ============================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tarefas (alimenta o calendário unificado junto com Faculdade e Trabalho)
-- ------------------------------------------------------------

create type recurrence_frequency as enum ('none', 'daily', 'weekly', 'monthly');

-- Tags de tarefa, por usuário. Cada usuário recebe 5 categorias default
-- (Trabalho, Faculdade, Amor, Saúde, Casa) criadas na aplicação no primeiro
-- login (mesma lógica que já cria a linha em profiles) — não são fixas no
-- schema porque o usuário pode adicionar/renomear/remover as próprias.
create table public.task_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.task_categories(id) on delete set null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  recurrence_frequency recurrence_frequency not null default 'none',
  recurrence_interval smallint not null default 1, -- ex: a cada 2 semanas
  recurrence_days_of_week smallint[], -- 0=domingo..6=sábado; usado só quando weekly
  recurrence_end_date date,
  completed_at timestamptz, -- só usado quando recurrence_frequency = 'none'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uma tarefa recorrente não tem um único "concluído" — cada ocorrência
-- (dia específico) é marcada separadamente aqui.
create table public.task_completions (
  task_id uuid not null references public.tasks(id) on delete cascade,
  occurrence_date date not null,
  status text not null default 'done' check (status in ('done', 'skipped')),
  completed_at timestamptz not null default now(),
  primary key (task_id, occurrence_date)
);

create index tasks_user_start_idx on public.tasks (user_id, start_at);

-- ------------------------------------------------------------
-- Financeiro (v1 = lançamento manual; import de extrato é fase 2)
-- ------------------------------------------------------------

create type transaction_type as enum ('income', 'expense');

create table public.transaction_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type transaction_type not null,
  color text, -- usado nos gráficos do dashboard mais pra frente
  unique (user_id, name, type)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.transaction_categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(12,2) not null check (amount > 0),
  description text,
  occurred_on date not null,
  source text not null default 'manual', -- 'manual' | 'import' (fase 2)
  created_at timestamptz not null default now()
);

create table public.investment_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_name text not null,
  value numeric(12,2) not null,
  recorded_on date not null,
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, occurred_on);

-- ------------------------------------------------------------
-- Saúde
-- ------------------------------------------------------------

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  recorded_on date not null,
  note text,
  unique (user_id, recorded_on)
);

create table public.health_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  exam_date date not null,
  file_path text not null, -- caminho no Supabase Storage
  retention_expires_on date, -- retenção de ~1 ano combinada no escopo
  uploaded_at timestamptz not null default now()
);

create type appointment_status as enum ('scheduled', 'completed', 'cancelled');

create table public.health_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  specialty text not null,
  doctor_name text,
  location text,
  scheduled_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  notes text
);

-- ------------------------------------------------------------
-- Faculdade (média ponderada por disciplina)
-- ------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  semester text not null, -- ex: '2026.1'
  min_passing_grade numeric(4,2) not null default 6.0,
  max_grade numeric(4,2) not null default 10.0
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  weight numeric(5,2) not null default 1,
  grade numeric(4,2), -- null = ainda não lançada; entra no cálculo de "nota mínima necessária"
  due_date date not null
);

create index assessments_course_due_idx on public.assessments (course_id, due_date);

-- Média ponderada e nota mínima necessária são calculadas na aplicação
-- a partir de weight/grade — não precisam de coluna própria aqui.

-- ------------------------------------------------------------
-- Trabalho (projetos com itens, estilo kanban)
-- ------------------------------------------------------------

create type work_item_status as enum ('todo', 'doing', 'done');

create table public.work_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'on_hold', 'done')),
  created_at timestamptz not null default now()
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.work_projects(id) on delete cascade,
  title text not null,
  status work_item_status not null default 'todo',
  priority smallint not null default 2, -- 1=alta 2=média 3=baixa
  due_date date
);

create index work_items_project_due_idx on public.work_items (project_id, due_date);

-- ------------------------------------------------------------
-- Notificações (web push)
-- ------------------------------------------------------------

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Calendário unificado
-- Tarefas sem recorrência, avaliações e itens de trabalho com prazo
-- entram direto aqui. Tarefas recorrentes ficam de fora da view porque
-- expandir uma regra de recorrência em instâncias exige um intervalo de
-- datas (não faz sentido gerar infinitas ocorrências numa view estática)
-- — use a função expand_task_occurrences() abaixo para isso.
-- ------------------------------------------------------------

create view public.calendar_events as
select
  t.id as source_id,
  t.user_id,
  t.title,
  t.start_at,
  t.end_at,
  t.all_day,
  'tarefa' as source_type
from public.tasks t
where t.recurrence_frequency = 'none'
union all
select
  a.id,
  c.user_id,
  c.name || ' — ' || a.name,
  a.due_date::timestamptz,
  null,
  true,
  'faculdade'
from public.assessments a
join public.courses c on c.id = a.course_id
union all
select
  w.id,
  p.user_id,
  w.title,
  w.due_date::timestamptz,
  null,
  true,
  'trabalho'
from public.work_items w
join public.work_projects p on p.id = w.project_id
where w.due_date is not null;

-- Expande tarefas recorrentes em ocorrências dentro de um intervalo de datas
-- (chamar com o range visível do calendário, ex: mês atual). Ponto de partida
-- simples — se a lógica de recorrência crescer (exceções, feriados, etc.),
-- considere mover isso para a aplicação com uma lib como rrule.js.
create or replace function public.expand_task_occurrences(
  p_user_id uuid,
  p_range_start date,
  p_range_end date
)
returns table (task_id uuid, occurrence_date date, title text) as $$
  select t.id, d::date, t.title
  from public.tasks t
  cross join lateral generate_series(
    greatest(t.start_at::date, p_range_start),
    least(coalesce(t.recurrence_end_date, p_range_end), p_range_end),
    case t.recurrence_frequency
      when 'daily' then (t.recurrence_interval || ' days')::interval
      when 'weekly' then (t.recurrence_interval * 7 || ' days')::interval
      when 'monthly' then (t.recurrence_interval || ' months')::interval
      else '1 day'::interval
    end
  ) as d
  where t.user_id = p_user_id
    and t.recurrence_frequency <> 'none'
    and (
      t.recurrence_frequency <> 'weekly'
      or extract(dow from d)::smallint = any(t.recurrence_days_of_week)
    )
$$ language sql stable;

-- ============================================================
-- Row Level Security — cada usuário só acessa as próprias linhas
-- ============================================================

alter table public.profiles enable row level security;
alter table public.task_categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.transaction_categories enable row level security;
alter table public.transactions enable row level security;
alter table public.investment_snapshots enable row level security;
alter table public.weight_logs enable row level security;
alter table public.health_exams enable row level security;
alter table public.health_appointments enable row level security;
alter table public.courses enable row level security;
alter table public.assessments enable row level security;
alter table public.work_projects enable row level security;
alter table public.work_items enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid());
create policy "own task categories" on public.task_categories for all using (user_id = auth.uid());
create policy "own tasks" on public.tasks for all using (user_id = auth.uid());
create policy "own task completions" on public.task_completions for all
  using (task_id in (select id from public.tasks where user_id = auth.uid()));
create policy "own categories" on public.transaction_categories for all using (user_id = auth.uid());
create policy "own transactions" on public.transactions for all using (user_id = auth.uid());
create policy "own investments" on public.investment_snapshots for all using (user_id = auth.uid());
create policy "own weight logs" on public.weight_logs for all using (user_id = auth.uid());
create policy "own exams" on public.health_exams for all using (user_id = auth.uid());
create policy "own appointments" on public.health_appointments for all using (user_id = auth.uid());
create policy "own courses" on public.courses for all using (user_id = auth.uid());
create policy "own assessments" on public.assessments for all
  using (course_id in (select id from public.courses where user_id = auth.uid()));
create policy "own work projects" on public.work_projects for all using (user_id = auth.uid());
create policy "own work items" on public.work_items for all
  using (project_id in (select id from public.work_projects where user_id = auth.uid()));
create policy "own push subs" on public.push_subscriptions for all using (user_id = auth.uid());

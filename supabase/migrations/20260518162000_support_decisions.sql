create table if not exists public.support_decisions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.support_conversations(id) on delete set null,
  user_id uuid,
  business_id uuid references public.businesses(id) on delete set null,
  route text not null check (route in ('support', 'technical_triage', 'setup_completion', 'human_escalation')),
  domain text not null check (domain in (
    'frontend_expert',
    'backend_expert',
    'payments_expert',
    'booking_expert',
    'calendar_expert',
    'support_ops_expert',
    'safety_escalation_expert'
  )),
  decision_type text not null check (decision_type in (
    'grounded_answer',
    'clarifying_question',
    'technical_triage',
    'human_escalation'
  )),
  confidence numeric(4,3) not null,
  requires_human boolean not null default false,
  fallback_used boolean not null default false,
  needs_follow_up boolean not null default false,
  escalated_later boolean not null default false,
  ticket_id uuid references public.support_tickets(id) on delete set null,
  support_message text not null,
  assistant_reply text,
  reason text,
  suggested_action_href text,
  evidence_refs text[] not null default '{}',
  knowledge_area_ids text[] not null default '{}',
  review_label text check (review_label in (
    'correct',
    'wrong_domain',
    'weak_knowledge',
    'bad_escalation',
    'poor_wording',
    'missing_rule'
  )),
  review_notes text,
  reviewed_by_admin_email text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.support_decisions enable row level security;

create index if not exists support_decisions_conversation_created_idx
  on public.support_decisions (conversation_id, created_at desc);

create index if not exists support_decisions_business_created_idx
  on public.support_decisions (business_id, created_at desc);

create index if not exists support_decisions_review_label_idx
  on public.support_decisions (review_label, created_at desc);

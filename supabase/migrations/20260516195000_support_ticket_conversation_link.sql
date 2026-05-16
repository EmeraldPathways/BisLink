alter table public.support_tickets
add column if not exists conversation_id uuid references public.support_conversations(id) on delete set null;

create index if not exists support_tickets_conversation_id_idx
on public.support_tickets (conversation_id);

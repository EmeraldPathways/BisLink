alter table public.support_messages
drop constraint if exists support_messages_agent_name_check;

alter table public.support_messages
add constraint support_messages_agent_name_check
check (
  agent_name in (
    'support',
    'technical_triage',
    'setup_completion',
    'human_escalation',
    'admin_support'
  )
);

alter table public.support_conversations
drop constraint if exists support_conversations_current_agent_check;

alter table public.support_conversations
add constraint support_conversations_current_agent_check
check (
  current_agent in (
    'support',
    'technical_triage',
    'setup_completion',
    'human_escalation',
    'admin_support'
  )
);

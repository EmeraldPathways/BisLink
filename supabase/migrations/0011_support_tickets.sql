CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('public_support', 'owner_support', 'escalation')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  source TEXT NOT NULL CHECK (source IN ('contact_form', 'owner_dashboard')),
  created_by_role TEXT NOT NULL CHECK (created_by_role IN ('public_user', 'owner', 'admin')),
  subject TEXT,
  message TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  assigned_admin_email TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE INDEX support_tickets_business_created_idx
  ON support_tickets (business_id, created_at DESC);

CREATE INDEX support_tickets_type_status_created_idx
  ON support_tickets (ticket_type, status, created_at DESC);

CREATE INDEX support_tickets_status_priority_created_idx
  ON support_tickets (status, priority, created_at DESC);

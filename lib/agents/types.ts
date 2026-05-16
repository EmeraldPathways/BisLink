export type AgentRoute =
  | 'support'
  | 'technical_triage'
  | 'setup_completion'
  | 'human_escalation';

export type Severity = 'P0' | 'P1' | 'P2' | 'P3';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  role: ChatMessageRole;
  content: string;
}

export interface UserSupportContext {
  userId: string;
  email?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  publicUrl?: string | null;
  pagePublished?: boolean;
  hasProfileImage?: boolean;
  hasBannerImage?: boolean;
  serviceCount?: number;
  hasAvailability?: boolean;
  stripeConnected?: boolean;
  productCount?: number;
  hasContactLinks?: boolean;
  hasSocialLinks?: boolean;
  subscriptionStatus?: string | null;
}

export interface ActivationStatus {
  activationScore: number;
  missingSteps: string[];
  completedSteps: string[];
  nextBestAction: string;
  nextBestActionHref?: string;
  nextBestActionReason?: string;
}

export interface RouterResult {
  route: AgentRoute;
  confidence: number;
  reason: string;
  requiresHuman: boolean;
}

export interface SupportTicketDraft {
  title: string;
  severity: Severity;
  affectedArea: string;
  userId?: string;
  userEmail?: string | null;
  bislinkUrl?: string | null;
  device?: string | null;
  browser?: string | null;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  evidence?: string;
  suggestedPriority?: string;
  developerNotes?: string;
}

export interface SupportAgentInput {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
  relevantDocs: HelpDoc[];
  conversationHistory?: ConversationMessage[];
}

export interface SupportAgentOutput {
  reply: string;
  route: 'support';
  requiresHuman: boolean;
  suggestedActionHref?: string;
}

export interface SetupCompletionOutput {
  reply: string;
  route: 'setup_completion';
  requiresHuman: boolean;
  suggestedActionHref?: string;
}

export interface TechnicalTriageOutput {
  reply: string;
  route: 'technical_triage';
  requiresHuman: boolean;
  needsFollowUp: boolean;
  followUpQuestion?: string;
  suggestedActionHref?: string;
  ticketDraft?: SupportTicketDraft | null;
}

export interface HelpDoc {
  id: string;
  title: string;
  keywords: string[];
  content: string;
}

export interface SupportConversationRecord {
  id: string;
  user_id: string;
  business_id: string | null;
  status: 'open' | 'resolved' | 'escalated';
  current_agent: AgentRoute;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportMessageRecord {
  id: string;
  conversation_id: string;
  role: ChatMessageRole;
  content: string;
  agent_name: string | null;
  created_at: string;
}

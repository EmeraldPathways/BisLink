import {
  findCuratedDocsByIds,
  getBusinessAreaKnowledgeById,
  type BusinessAreaKnowledge
} from '@/lib/agents/knowledge/registry';
import type { HelpDoc, SupportAgentInput, SupportDomain } from '@/lib/agents/types';

interface SpecialistReply {
  reply: string;
  suggestedActionHref?: string;
  needsFollowUp?: boolean;
  followUpQuestion?: string;
}

interface SupportPlaybook {
  clarifyingQuestion: (areaTitle?: string) => string;
  buildGroundedReply: (args: {
    input: SupportAgentInput;
    area: BusinessAreaKnowledge;
    primaryDoc?: HelpDoc;
  }) => SpecialistReply;
}

function toInternalDashboardHref(href?: string) {
  return href?.startsWith('/') ? href : undefined;
}

function pickPrimaryArea(input: SupportAgentInput) {
  return input.knowledgeAreaIds
    .map((id) => getBusinessAreaKnowledgeById(id))
    .find((area) => area !== null);
}

function pickPrimaryDoc(input: SupportAgentInput, area: BusinessAreaKnowledge) {
  const registryDocs = findCuratedDocsByIds(area.curatedDocIds);
  const curatedDocs = [...registryDocs, ...input.relevantDocs].filter(
    (doc, index, all) => all.findIndex((item) => item.id === doc.id) === index
  );
  return curatedDocs[0];
}

function fallbackSuggestion(input: SupportAgentInput, area?: BusinessAreaKnowledge | null) {
  return (
    area?.suggestedActionHref ??
    toInternalDashboardHref(input.activationStatus.nextBestActionHref)
  );
}

function supportsOneOf(message: string, phrases: string[]) {
  return phrases.some((phrase) => message.includes(phrase));
}

const specialistPlaybooks: Record<SupportDomain, SupportPlaybook> = {
  frontend_expert: {
    clarifyingQuestion: (areaTitle) =>
      areaTitle
        ? `Which part of ${areaTitle} are you trying to change or verify?`
        : 'Which page or area of the dashboard are you trying to use?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      const normalized = input.message.toLowerCase();

      if (area.id === 'reviews') {
        if (supportsOneOf(normalized, ['request review', 'request-review'])) {
          return {
            reply:
              'Open Dashboard -> Reviews to manage review visibility. The current review flow supports publishing and hiding reviews only, and the Request review button is present in the UI but the outbound follow-up workflow is not wired up yet.',
            suggestedActionHref: '/reviews'
          };
        }

        return {
          reply:
            'Open Dashboard -> Reviews to manage customer review cards. Each review shows the customer name, text, rating, and whether it is Verified or Unverified. Use Publish or Hide to control whether a review appears on the public page.',
          suggestedActionHref: '/reviews'
        };
      }

      if (area.id === 'services') {
        return {
          reply:
            'Open Dashboard -> Services and use the Add service form. The form includes Name, Description, Service image, Duration, and Price. The service image is shown on the public booking cards, should be square 1:1, and the service is saved with Create service.',
          suggestedActionHref: '/services'
        };
      }

      if (area.id === 'public-page-editor') {
        if (supportsOneOf(normalized, ['my link', 'hero', 'announcement', 'link settings'])) {
          return {
            reply:
              'Open Dashboard -> Link to edit your public page live. My Link is split into Hero, Announcement, Bookings, Shop, Portfolio, About and Trust, Contact and Social, and Link Settings. Link Settings is where you update the public slug and copy or open the link after saving.',
            suggestedActionHref: '/link'
          };
        }

        if (supportsOneOf(normalized, ['slug', 'share', 'url', 'copy link'])) {
          return {
            reply:
              'Open Dashboard -> Link and update the page slug in Link Settings. The public BisLink URL is based on that slug, and the editor can copy the public link after save.',
            suggestedActionHref: '/link'
          };
        }

        if (supportsOneOf(normalized, ['portfolio', 'image', 'upload', 'hero', 'cover'])) {
          return {
            reply:
              'Open Dashboard -> Link to update portfolio items and public-page section images. Uploads there must be JPG, PNG, or WebP and 5MB or smaller. Cover and section images use a 16:9 layout, while portfolio images do not enforce a fixed ratio.',
            suggestedActionHref: '/link'
          };
        }
      }

      if (area.id === 'theme-settings') {
        return {
          reply:
            'Open Dashboard -> Theme to control the visual styling of the public page while previewing it live. Theme Settings is split into Theme Preset, Brand Styling, and Save Theme. Theme Preset chooses the overall look, Brand Styling controls brand colour and font pairing, and Save Theme Settings persists those changes to the public page.',
          suggestedActionHref: '/link/theme'
        };
      }

      if (area.id === 'products') {
        if (
          supportsOneOf(normalized, [
            'add product',
            'create product',
            'product name',
            'original price',
            'badge',
            'category'
          ])
        ) {
          return {
            reply:
              'Open Dashboard -> Products and use the Add product form. The form includes Product name, Description, Product image, Category, Price, Original price, and Badge. The product image is shown on the public shop cards and product detail view, should be square 1:1, and can be attached with Upload Image before you use Create product to save the item.',
            suggestedActionHref: '/products'
          };
        }

        if (
          supportsOneOf(normalized, [
            'product image',
            'upload image',
            'image upload',
            'add an image',
            'add image'
          ])
        ) {
          return {
            reply:
              'Open Dashboard -> Products and use the image upload field in the product form before saving the new product. The product image is shown on public shop cards and the product detail view. Product images should be square 1:1, and uploads must be JPG, PNG, or WebP and 5MB or smaller.',
            suggestedActionHref: '/products'
          };
        }

        if (supportsOneOf(normalized, ['digital download', 'download link'])) {
          return {
            reply:
              'Open Dashboard -> Products and edit the product you want to update. Use the product form to set digital product details and save the item so it stays active and available in the shop.',
            suggestedActionHref: '/products'
          };
        }
      }

      return {
        reply:
          primaryDoc?.content ??
          `${area.summary} Supported actions here include ${area.supportedActions.join(', ')}.`,
        suggestedActionHref: fallbackSuggestion(input, area)
      };
    }
  },
  backend_expert: {
    clarifyingQuestion: () =>
      'Which backend behavior is wrong right now: ticket creation, message delivery, or order confirmation state?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      if (area.id === 'order-confirmations') {
        return {
          reply:
            'If a customer paid but no confirmation arrived, treat that as an order-confirmation issue rather than a setup step. Confirm the order completed successfully first, then use Dashboard -> Support if confirmation delivery still looks wrong.',
          suggestedActionHref: '/support'
        };
      }

      return {
        reply:
          primaryDoc?.content ??
          `${area.summary} Supported actions here include ${area.supportedActions.join(', ')}.`,
        suggestedActionHref: fallbackSuggestion(input, area)
      };
    }
  },
  payments_expert: {
    clarifyingQuestion: () =>
      'Is this a Stripe setup question, a checkout failure, or a payout-status question?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      const normalized = input.message.toLowerCase();

      if (supportsOneOf(normalized, ['connect stripe', 'stripe onboarding', 'business payments not configured'])) {
        return {
          reply:
            'Go to Dashboard -> Payouts and complete the Stripe Express onboarding flow. Payments work only after the connected account exists and Stripe reports charges enabled plus details submitted.',
          suggestedActionHref: '/payouts'
        };
      }

      return {
        reply:
          'Go to Dashboard -> Payouts to view Stripe Connect status, revenue totals, payout history, and recent orders. If Stripe is not connected, use Complete Stripe onboarding to launch the Stripe Express flow and finish payment setup.',
        suggestedActionHref: '/payouts'
      };
    }
  },
  booking_expert: {
    clarifyingQuestion: () =>
      'Is this about setting up availability, blocked time, or a customer-facing booking issue?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      const normalized = input.message.toLowerCase();

      if (supportsOneOf(normalized, ['blocked time', 'time off', 'next monday', 'holiday'])) {
        return {
          reply:
            'Open Dashboard -> Availability and use Block time off to enter Date, Start, End, and Reason, then select Add blocked time. The end time must be after the start time, and blocked time is combined with weekly Working hours when public slots are calculated.',
          suggestedActionHref: '/availability'
        };
      }

      if (supportsOneOf(normalized, ['working hours', 'turn on', 'turn off', 'save day'])) {
        return {
          reply:
            'Open Dashboard -> Availability and use the Working hours panel. Each weekday can be turned On or Off, then saved with a start time and end time using the Save button for that row.',
          suggestedActionHref: '/availability'
        };
      }

      if (supportsOneOf(normalized, ['no slots', 'no times', 'cannot book', 'slot unavailable'])) {
        return {
          reply:
            'Check Dashboard -> Availability first. Public slots depend on an active service, active weekday hours, existing bookings, blocked time, and the service duration plus buffer. If the service is active but customers still see no times, review weekday availability and blocked time first.',
          suggestedActionHref: '/availability'
        };
      }

      if (area.id === 'bookings') {
        return {
          reply:
            'In the public booking flow, customers choose a service, a date, and then a time from the Choose a time step. If slots are missing or unavailable, review Dashboard -> Availability, blocked time, and active service state first.',
          suggestedActionHref: '/availability'
        };
      }

      return {
        reply:
          primaryDoc?.content ??
          `${area.summary} Supported actions here include ${area.supportedActions.join(', ')}.`,
        suggestedActionHref: fallbackSuggestion(input, area)
      };
    }
  },
  calendar_expert: {
    clarifyingQuestion: () =>
      'Is this about connecting Google Calendar, reconnecting it, or bookings not syncing after it shows connected?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      const normalized = input.message.toLowerCase();

      if (supportsOneOf(normalized, ['connect', 'reconnect', 'not connected', 'reconnect needed'])) {
        return {
          reply:
            'Open Dashboard -> Calendar and use Connect Google Calendar or Reconnect Google Calendar from the integration card. If the status shows Not connected or Reconnect needed, reconnect the Google account from that page so future bookings can sync again.',
          suggestedActionHref: '/calendar'
        };
      }

      return {
        reply:
          'Open Dashboard -> Calendar to review the Google Calendar integration card and the Weekly calendar view. If the integration card shows connected, bookings can sync to Google Calendar. Use Connect Google Calendar or Reconnect Google Calendar from that page if the connection needs attention.',
        suggestedActionHref: '/calendar'
      };
    }
  },
  support_ops_expert: {
    clarifyingQuestion: () =>
      'Which support flow are you asking about: the owner inbox, an admin reply, or a contact-form ticket?',
    buildGroundedReply: ({ input, area, primaryDoc }) => {
      const normalized = input.message.toLowerCase();

      if (area.id === 'owner-support-inbox') {
        if (supportsOneOf(normalized, ['reply', 'send reply', 'message back'])) {
          return {
            reply:
              'Open Dashboard -> Support and open the ticket thread you want to answer. If the ticket has a linked conversation, use the reply field in that thread to send your message back to support.',
            suggestedActionHref: '/support'
          };
        }

        if (supportsOneOf(normalized, ['ask admin for help', 'support request', 'subject', 'send support request'])) {
          return {
            reply:
              'Open Dashboard -> Support and use Ask admin for help for owner questions about the platform, payments, or account support. Enter a Subject and Message, then use Send support request to contact admin directly.',
            suggestedActionHref: '/support'
          };
        }

        if (supportsOneOf(normalized, ['escalate to admin', 'public support inbox'])) {
          return {
            reply:
              'Open Dashboard -> Support and use the Public support inbox to manage contact-form tickets. From each ticket you can view the conversation, Send reply, update status and priority, or use Escalate to admin when a public support issue needs admin review.',
            suggestedActionHref: '/support'
          };
        }

        return {
          reply:
            primaryDoc?.content ??
            'Open Dashboard -> Support to view owner support tickets, conversation history, and replies.',
          suggestedActionHref: '/support'
        };
      }

      if (area.id === 'contact-form') {
        return {
          reply:
            'Public contact-form submissions should create a support ticket that appears in Dashboard -> Support. That ticket becomes the owner-visible inbox thread for follow-up replies and status changes.',
          suggestedActionHref: '/support'
        };
      }

      return {
        reply:
          primaryDoc?.content ??
          `${area.summary} Supported actions here include ${area.supportedActions.join(', ')}.`,
        suggestedActionHref: fallbackSuggestion(input, area)
      };
    }
  },
  safety_escalation_expert: {
    clarifyingQuestion: () =>
      'Is this about refunds, security, account access, privacy, or missing data?',
    buildGroundedReply: ({ input, area, primaryDoc }) => ({
      reply:
        primaryDoc?.content ??
        `${area.summary} Supported actions here include ${area.supportedActions.join(', ')}.`,
      suggestedActionHref: fallbackSuggestion(input, area)
    })
  }
};

export function buildSupportReply(input: SupportAgentInput): SpecialistReply {
  const primaryArea = pickPrimaryArea(input);

  if (!primaryArea) {
    const followUpQuestion = specialistPlaybooks[input.domain].clarifyingQuestion();
    return {
      reply: followUpQuestion,
      suggestedActionHref: toInternalDashboardHref(input.activationStatus.nextBestActionHref),
      needsFollowUp: true,
      followUpQuestion
    };
  }

  if (input.decisionType === 'clarifying_question') {
    const followUpQuestion = specialistPlaybooks[input.domain].clarifyingQuestion(
      primaryArea.title
    );
    return {
      reply: followUpQuestion,
      suggestedActionHref: primaryArea.suggestedActionHref,
      needsFollowUp: true,
      followUpQuestion
    };
  }

  const primaryDoc = pickPrimaryDoc(input, primaryArea);
  return specialistPlaybooks[input.domain].buildGroundedReply({
    input,
    area: primaryArea,
    primaryDoc
  });
}

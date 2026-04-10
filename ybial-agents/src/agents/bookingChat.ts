import { callWithCache, MODELS } from '../lib/anthropic';
import { SYSTEM_PROMPT } from '../prompts/bookingChat';
import type { BookingChatContext, BookingChatOutput } from '../types';

export async function runBookingChat(context: BookingChatContext): Promise<BookingChatOutput> {
  const systemPrompt = SYSTEM_PROMPT
    .replaceAll('{BUSINESS_NAME}', context.businessName)
    .replaceAll('{BUSINESS_CATEGORY}', context.businessCategory)
    .replaceAll('{BUSINESS_LOCATION}', context.businessLocation ?? 'Not listed')
    .replaceAll('{BUSINESS_BIO}', context.businessBio ?? 'Not listed')
    .replaceAll('{INSTAGRAM_HANDLE}', context.instagramHandle ?? 'Not listed')
    .replaceAll(
      '{SERVICES_LIST}',
      context.services
        .map((service) => `${service.name}: ${service.duration} mins, ${service.price} cents, ${service.description ?? 'No description'}`)
        .join('\n')
    )
    .replaceAll('{AVAILABILITY_SUMMARY}', context.availabilitySummary);

  const userMessage = [
    ...context.conversationHistory.map((message) => `${message.role.toUpperCase()}: ${message.content}`),
    `USER: ${context.currentMessage}`
  ].join('\n');

  try {
    const response = await callWithCache({
      model: MODELS.HAIKU,
      systemPrompt,
      userMessage,
      maxTokens: 200
    });

    return { reply: response.trim() };
  } catch {
    return { reply: "Sorry, I'm having a moment — tap the service you'd like to book!" };
  }
}

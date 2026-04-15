export type DraftService = {
  emoji: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  tag?: string | null;
};

export type DraftAvailability = {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
};

export function createDefaultServices(category: string): DraftService[] {
  const presets: Record<string, DraftService[]> = {
    'Personal Training': [
      { emoji: '💪', name: '1-on-1 Training Session', description: 'Personalized coaching session tailored to your goals.', duration_minutes: 60, price: 12000, tag: 'Most Booked' },
      { emoji: '⚡', name: 'Power Half Hour', description: 'Short, focused session for busy schedules.', duration_minutes: 30, price: 6500, tag: null }
    ],
    'Hair & Beauty': [
      { emoji: '✨', name: 'Signature Appointment', description: 'Your core booked service with consultation included.', duration_minutes: 60, price: 8500, tag: 'Popular' },
      { emoji: '💫', name: 'Express Refresh', description: 'A shorter session for maintenance and quick wins.', duration_minutes: 30, price: 4500, tag: null }
    ],
    Consulting: [
      { emoji: '🧠', name: 'Consultation Call', description: '60-minute problem-solving session.', duration_minutes: 60, price: 15000, tag: 'Start Here' },
      { emoji: '📌', name: 'Strategy Review', description: 'Fast review session focused on one priority.', duration_minutes: 30, price: 8000, tag: null }
    ]
  };

  return presets[category] ?? [
    { emoji: '✨', name: 'Core Service', description: 'Your most popular service offering.', duration_minutes: 60, price: 10000, tag: 'Start Here' },
    { emoji: '⚡', name: 'Quick Session', description: 'A shorter, lower-friction booking option.', duration_minutes: 30, price: 5500, tag: null }
  ];
}

export function createDefaultAvailability(): DraftAvailability[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    is_active: day >= 1 && day <= 5,
    start_time: '09:00',
    end_time: '17:00'
  }));
}

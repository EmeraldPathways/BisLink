jest.mock('../../src/lib/supabase', () => ({
  getBusinessWithOwner: jest.fn(),
  getBookingsInRange: jest.fn(),
  getCustomersForBusiness: jest.fn(),
  getLinkVisitCount: jest.fn(),
  getServicesForBusiness: jest.fn(),
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn()
    })),
    auth: { admin: { getUserById: jest.fn() } }
  }
}));

import {
  buildAdvisorContext,
  buildBookingChatContext,
  buildOnboardingContext,
  buildSupportContext
} from '../../src/lib/contextBuilders';
import {
  getBookingsInRange,
  getBusinessWithOwner,
  getCustomersForBusiness,
  getLinkVisitCount,
  getServicesForBusiness,
  supabaseAdmin
} from '../../src/lib/supabase';

const mockBusiness = {
  id: 'biz_1',
  owner_id: 'user_1',
  slug: 'studio-eleven',
  name: 'Studio Eleven',
  category: 'Personal Training',
  bio: 'Movement coaching',
  photo_url: null,
  location: 'Brooklyn, NY',
  instagram_handle: '@studio',
  tiktok_handle: null,
  stripe_account_id: null,
  stripe_onboarded: true,
  google_cal_token: null,
  microsoft_cal_token: null,
  timezone: 'America/New_York',
  currency: 'usd',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

beforeEach(() => {
  jest.resetAllMocks();
  (getBusinessWithOwner as jest.Mock).mockResolvedValue({
    business: mockBusiness,
    ownerEmail: 'owner@example.com',
    ownerFirstName: 'Andrew'
  });
  (getBookingsInRange as jest.Mock).mockResolvedValue([]);
  (getCustomersForBusiness as jest.Mock).mockResolvedValue([]);
  (getLinkVisitCount as jest.Mock).mockResolvedValue(0);
  (getServicesForBusiness as jest.Mock).mockResolvedValue([
    {
      id: 'svc_1',
      business_id: 'biz_1',
      name: 'Consultation',
      description: null,
      duration_minutes: 60,
      price: 10000,
      tag: null,
      emoji: 'x',
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString()
    }
  ]);
  (supabaseAdmin.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: { name: 'Consultation' } })
  });
});

describe('context builders', () => {
  it('builds onboarding context', async () => {
    const context = await buildOnboardingContext('biz_1', 'USER_SIGNED_UP');
    expect(context.businessName).toBe('Studio Eleven');
    expect(context.setupComplete.servicesAdded).toBe(true);
  });

  it('builds support context with sensible defaults', async () => {
    const context = await buildSupportContext('biz_1', [], 'Need help');
    expect(context.businessLink).toContain('studio-eleven');
    expect(context.serviceNames).toEqual(['Consultation']);
  });

  it('builds advisor context with null-safe values', async () => {
    const context = await buildAdvisorContext(mockBusiness as any);
    expect(context.thisWeekBookings).toBe(0);
    expect(context.mostBookedServiceThisWeek).toBeNull();
  });

  it('builds booking chat context', async () => {
    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'businesses') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: mockBusiness })
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(),
        data: [{ day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00' }]
      };
    });

    const context = await buildBookingChatContext('studio-eleven', [], 'Is parking nearby?');
    expect(context.businessName).toBe('Studio Eleven');
    expect(context.currentMessage).toBe('Is parking nearby?');
  });
});

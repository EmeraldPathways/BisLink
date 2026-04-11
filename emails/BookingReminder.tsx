import * as React from 'react';

export default function BookingReminder() {
  return (
    <div style={{ fontFamily: 'DM Sans, Arial, sans-serif', background: '#fafaf8', padding: '40px 24px', color: '#111' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 24, padding: 32 }}>
        <p style={{ color: '#8b6b1a', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Appointment reminder
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 40, margin: '12px 0' }}>See you tomorrow</h1>
        <p style={{ color: '#666', lineHeight: 1.7 }}>Your session is coming up soon. Review the details and keep this email handy if you need to reschedule.</p>
      </div>
    </div>
  );
}

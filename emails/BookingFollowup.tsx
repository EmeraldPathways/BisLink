import * as React from 'react';

export default function BookingFollowup() {
  return (
    <div style={{ fontFamily: 'DM Sans, Arial, sans-serif', background: '#fafaf8', padding: '40px 24px', color: '#111' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 24, padding: 32 }}>
        <p style={{ color: '#8b6b1a', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Follow-up
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 40, margin: '12px 0' }}>How was your session?</h1>
        <p style={{ color: '#666', lineHeight: 1.7 }}>Hope it went well. Leave a review and help the business keep growing through the link.</p>
      </div>
    </div>
  );
}

import { Service } from './BookingPage';

export function StepConfirm({ service, date, time, details, onReset }: { service: Service; date: string; time: string; details: { name: string; email: string }; onReset: () => void }) {
  return <div className="text-center"><div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-gradient-to-br from-black to-zinc-800 text-3xl text-[var(--color-gold)]">✓</div><h3 className="mt-3 font-display text-5xl">You're booked!</h3><p className="mt-2 text-sm text-zinc-600">Confirmation sent to {details.email}. We'll remind you before your session.</p><div className="mt-4 rounded-xl bg-[var(--color-surface-2)] p-4 text-left text-sm">{service.name}<br />{date} {time}<br />Paid: ${service.price / 100}</div><button onClick={onReset} className="mt-4 w-full rounded-2xl bg-zinc-100 px-4 py-3">Back to services</button></div>;
}

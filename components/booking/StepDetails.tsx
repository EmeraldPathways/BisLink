'use client';

import { useState } from 'react';
import { Service } from './BookingPage';

export function StepDetails({ service, date, time, onBack, onNext }: { service: Service; date: string; time: string; onBack: () => void; onNext: (d: { name: string; email: string; phone?: string }) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  return <div><button onClick={onBack} className="text-sm">Back</button><h3 className="font-display text-4xl">Your details</h3><p className="text-sm">Just the basics — no account needed</p><div className="mt-4 space-y-3"><input className="w-full rounded-[13px] border p-3" placeholder="Alex Johnson" value={name} onChange={(e)=>setName(e.target.value)} /><input className="w-full rounded-[13px] border p-3" placeholder="alex@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="w-full rounded-[13px] border p-3" placeholder="+1 (555) 000-0000" value={phone} onChange={(e)=>setPhone(e.target.value)} /></div><div className="mt-4 rounded-xl bg-[var(--color-surface-2)] p-4 text-sm">{service.name}<br />{date} {time}<br />Total: ${service.price / 100}</div><button disabled={!name || !email} onClick={()=>onNext({name,email,phone})} className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-white disabled:bg-zinc-200 disabled:text-zinc-500">Continue to Payment</button></div>;
}

'use client';
import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Service } from './BookingPage';

export function StepDate({ service, onNext }: { service: Service; onNext: (d: string) => void }) {
  const [selected, setSelected] = useState<string>('');
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  return <div><h3 className="font-display text-4xl">Pick a date</h3><p className="mb-3 text-sm">{service.duration_minutes} min · ${service.price / 100}</p><div className="grid grid-cols-7 gap-2">{days.map((d) => {const iso=format(d,'yyyy-MM-dd');const disabled=[0,6].includes(d.getDay());return <button disabled={disabled} key={iso} onClick={()=>setSelected(iso)} className={`rounded-xl p-2 text-center text-xs ${selected===iso?'bg-black text-white':'bg-zinc-100'} ${disabled?'opacity-40':''}`}>{format(d,'EEE')}<br />{format(d,'d')}</button>;})}</div><button disabled={!selected} onClick={()=>onNext(selected)} className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-white disabled:bg-zinc-200 disabled:text-zinc-500">{selected?`Continue — ${selected}`:'Select a date to continue'}</button></div>;
}

import { Service } from './BookingPage';
import { useState } from 'react';

const slots = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];

export function StepTime({ service, date, onBack, onNext }: { service: Service; date: string; onBack: () => void; onNext: (t: string) => void }) {
  const [selected, setSelected] = useState('');
  return <div><button onClick={onBack} className="text-sm">Back</button><h3 className="font-display text-4xl">Choose a time</h3><p className="mb-3 text-sm">{date} · {service.duration_minutes} min</p><div className="grid grid-cols-3 gap-2">{slots.map(s => <button key={s} onClick={()=>setSelected(s)} className={`rounded-xl border p-2 text-sm ${selected===s?'bg-black text-white':''}`}>{s}</button>)}</div><button disabled={!selected} onClick={()=>onNext(selected)} className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-white disabled:bg-zinc-200 disabled:text-zinc-500">{selected?`Continue — ${selected}`:'Select a time to continue'}</button></div>;
}

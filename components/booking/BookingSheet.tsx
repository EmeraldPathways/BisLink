'use client';

import { useMemo, useState } from 'react';
import { Service } from './BookingPage';
import { StepDate } from './StepDate';
import { StepTime } from './StepTime';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';
import { StepConfirm } from './StepConfirm';

export function BookingSheet({ service, onClose }: { service: Service | null; business: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const progress = useMemo(() => [1, 2, 3, 4].map((n) => n <= step), [step]);

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 w-full rounded-t-[26px] bg-white p-4 shadow-[0_-24px_64px_rgba(0,0,0,0.22)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded bg-zinc-200" />
        <div className="mb-4 flex gap-2">{progress.map((on, i) => <div key={i} className={`h-[3px] flex-1 rounded ${on ? 'bg-black' : 'bg-zinc-200'}`} />)}</div>
        {step === 1 && <StepDate service={service} onNext={(d) => { setDate(d); setStep(2); }} />}
        {step === 2 && date && <StepTime service={service} date={date} onBack={() => setStep(1)} onNext={(t) => { setTime(t); setStep(3); }} />}
        {step === 3 && date && time && <StepDetails service={service} date={date} time={time} onBack={() => setStep(2)} onNext={(d) => { setDetails(d); setStep(4); }} />}
        {step === 4 && date && time && details && <StepPayment service={service} date={date} time={time} details={details} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
        {step === 5 && date && time && details && <StepConfirm service={service} date={date} time={time} details={details} onReset={onClose} />}
      </div>
    </div>
  );
}

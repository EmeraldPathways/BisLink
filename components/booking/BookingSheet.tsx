'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BusinessProfile } from '@/types';
import { StepDate } from './StepDate';
import { StepTime } from './StepTime';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';
import { StepConfirm } from './StepConfirm';
import type { Service } from './BookingPage';

type Details = { name: string; email: string; phone?: string };

export function BookingSheet({
  business,
  service,
  onClose
}: {
  business: BusinessProfile;
  service: Service | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!service) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [service]);

  useEffect(() => {
    if (service) {
      setStep(1);
      setDate(null);
      setTime(null);
      setDetails(null);
      setDragOffset(0);
    }
  }, [service?.id]);

  const progress = useMemo(() => [1, 2, 3, 4].map((value) => value <= Math.min(step, 4)), [step]);

  if (!service) return null;

  const title = step === 1 ? service.name : 'Booking';

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 180 }}
          dragElastic={0.1}
          onDrag={(event, info) => setDragOffset(info.offset.y)}
          onDragEnd={(event, info) => {
            if (info.offset.y > 100) onClose();
            setDragOffset(0);
          }}
          initial={{ y: '100%' }}
          animate={{ y: dragOffset > 0 ? dragOffset : 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className="hide-scrollbar absolute bottom-0 left-0 right-0 mx-auto max-h-[90vh] max-w-[430px] overflow-y-auto rounded-t-[26px] bg-white px-4 pb-6 pt-3 shadow-[0_-24px_64px_rgba(0,0,0,0.22)] xl:right-auto xl:left-[calc(50%-640px)]"
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[#e0e0e0]" />
          <div className="mb-4 flex items-center justify-between">
            {step > 1 ? (
              <button className="text-sm font-medium text-[var(--color-text-primary)]" onClick={() => setStep((current) => current - 1)}>
                Back
              </button>
            ) : (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Booking</p>
                <p className="font-display text-[24px] text-[var(--color-text-primary)]">{title}</p>
              </div>
            )}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--color-surface-3)] text-sm text-[var(--color-text-primary)]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="mb-6 flex gap-2">
            {progress.map((complete, index) => (
              <div key={index} className={`h-[3px] flex-1 rounded ${complete ? 'bg-[var(--color-void)]' : 'bg-[var(--color-border)]'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="date" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <StepDate
                  business={business}
                  service={service}
                  onNext={(selectedDate) => {
                    setDate(selectedDate);
                    setStep(2);
                  }}
                />
              </motion.div>
            ) : null}

            {step === 2 && date ? (
              <motion.div key="time" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <StepTime
                  business={business}
                  service={service}
                  date={date}
                  onBack={() => setStep(1)}
                  onNext={(selectedTime) => {
                    setTime(selectedTime);
                    setStep(3);
                  }}
                />
              </motion.div>
            ) : null}

            {step === 3 && date && time ? (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <StepDetails
                  business={business}
                  service={service}
                  date={date}
                  time={time}
                  onBack={() => setStep(2)}
                  onNext={(value) => {
                    setDetails(value);
                    setStep(4);
                  }}
                />
              </motion.div>
            ) : null}

            {step === 4 && date && time && details ? (
              <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <StepPayment
                  business={business}
                  service={service}
                  date={date}
                  time={time}
                  details={details}
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                />
              </motion.div>
            ) : null}

            {step === 5 && date && time && details ? (
              <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <StepConfirm business={business} service={service} date={date} time={time} details={details} onReset={onClose} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

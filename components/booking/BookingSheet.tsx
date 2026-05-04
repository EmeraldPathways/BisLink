'use client';

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { type RefObject, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '@/hooks/useBreakpoint';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';
import { StepConfirm } from './StepConfirm';
import { StepDate } from './StepDate';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';
import { StepTime } from './StepTime';

type Details = { name: string; email: string; phone?: string };

export function BookingSheet({
  business,
  service,
  onClose,
  presentation = 'default',
  containerRef,
}: {
  business: BusinessProfile;
  service: Service | null;
  onClose: () => void;
  presentation?: 'default' | 'demo';
  containerRef?: RefObject<HTMLDivElement>;
}) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragControls = useDragControls();
  const isMobile = useIsMobile();

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
      setBookingId(null);
      setDragOffset(0);
    }
  }, [service]);

  const progress = useMemo(
    () => [
      { label: 'Date', complete: step >= 1, current: step === 1 },
      { label: 'Time', complete: step >= 2, current: step === 2 },
      { label: 'Details', complete: step >= 3, current: step === 3 },
      { label: 'Confirm', complete: step >= 4, current: step >= 4 },
    ],
    [step],
  );

  if (!service) return null;

  const title = step === 1 ? service.name : 'Booking';
  const framed = presentation === 'demo' && !isMobile && containerRef?.current;
  const shellClassName = framed
    ? 'absolute inset-0 z-50'
    : 'fixed inset-0 z-50';
  const panelClassName = framed
    ? 'hide-scrollbar absolute bottom-0 left-0 right-0 h-[calc(100%-8px)] w-full overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-[var(--sheet-bg)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[var(--panel-shadow)]'
    : 'hide-scrollbar absolute bottom-0 left-0 right-0 mx-auto h-[calc(100dvh-8px)] w-full max-w-[430px] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-[var(--sheet-bg)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[var(--panel-shadow)] xl:left-[calc(50%-640px)] xl:right-auto xl:h-auto xl:max-h-[calc(100dvh-24px)] xl:rounded-t-[26px] xl:px-4';

  const sheet = (
    <AnimatePresence>
      <motion.div
        className={shellClassName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/55 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 180 }}
          dragElastic={0.1}
          onDrag={(_event, info) => setDragOffset(info.offset.y)}
          onDragEnd={(_event, info) => {
            if (info.offset.y > 100) onClose();
            setDragOffset(0);
          }}
          initial={{ y: '100%' }}
          animate={{ y: dragOffset > 0 ? dragOffset : 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className={panelClassName}
          style={{ touchAction: 'pan-y' }}
        >
          <button
            type="button"
            aria-label="Drag to close"
            onPointerDown={(event) => dragControls.start(event)}
            className="mx-auto mb-4 block cursor-grab touch-none active:cursor-grabbing"
          >
            <span className="block h-1 w-[38px] rounded bg-[var(--sheet-handle)]" />
          </button>
          <div className="mb-4 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                className="text-sm font-medium text-[var(--color-text-primary)]"
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
            ) : (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  Booking
                </p>
                <p className="font-display text-[24px] text-[var(--color-text-primary)]">
                  {title}
                </p>
              </div>
            )}
            <button
              type="button"
              aria-label="Close booking"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--color-surface-3)] text-[var(--color-text-primary)]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <fieldset className="mb-6 grid grid-cols-4 gap-2">
            <legend className="sr-only">Booking progress</legend>
            {progress.map((item) => (
              <div key={item.label} className="space-y-2">
                <p
                  className={`text-center text-[11px] font-medium ${
                    item.current
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                  aria-current={item.current ? 'step' : undefined}
                >
                  {item.label}
                </p>
                <div
                  className={`h-[3px] rounded ${item.complete ? 'bg-[var(--color-void)]' : 'bg-[var(--color-border)]'}`}
                />
              </div>
            ))}
          </fieldset>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="date"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
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
              <motion.div
                key="time"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
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
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
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
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <StepPayment
                  business={business}
                  service={service}
                  date={date}
                  time={time}
                  details={details}
                  onBack={() => setStep(3)}
                  onNext={(confirmedBookingId) => {
                    setBookingId(confirmedBookingId);
                    setStep(5);
                  }}
                />
              </motion.div>
            ) : null}

            {step === 5 && date && time && details && bookingId ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <StepConfirm
                  business={business}
                  service={service}
                  date={date}
                  time={time}
                  details={details}
                  bookingId={bookingId}
                  onReset={onClose}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return framed && containerRef?.current
    ? createPortal(sheet, containerRef.current)
    : sheet;
}

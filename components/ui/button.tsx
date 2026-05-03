import { cn } from '@/lib/utils/cn';

export function Button({
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'min-h-[48px] bg-[var(--color-void)] text-white hover:opacity-90 md:min-h-[44px] md:rounded-[18px]',
        variant === 'secondary' &&
          'min-h-[48px] border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] md:min-h-[44px] md:rounded-[18px]',
        variant === 'ghost' &&
          'min-h-[48px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] md:min-h-[44px]',
        className
      )}
      {...props}
    />
  );
}

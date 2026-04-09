import { cn } from '@/lib/utils/cn';

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-xl px-4 py-2', className)} {...props} />;
}

'use client';
import { motion } from 'framer-motion';

export function BusinessHero({ business }: { business: any }) {
  const seq = [0, 0.07, 0.13, 0.19, 0.25];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-void)] to-[var(--color-void-2)] px-5 pb-8 pt-9 text-[var(--color-text-hero)]">
      <div className="absolute -left-10 bottom-2 h-32 w-32 rounded-full bg-[var(--color-gold)]/10 blur-2xl" />
      <div className="absolute -right-10 top-2 h-32 w-32 rounded-full bg-[var(--color-gold)]/10 blur-2xl" />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[0] }} className="mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] font-display text-2xl font-semibold text-[var(--color-void)]">
        {business?.name?.split(' ').map((x: string) => x[0]).join('').slice(0, 2) || 'SB'}
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[1] }} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">{business.category} · <span className="text-green-400">●</span> Live</motion.p>
      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-2 font-display text-5xl leading-[1.08] tracking-[-0.6px]">{business.name}</motion.h1>
      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }} className="mt-3 text-sm font-light leading-[1.65] text-[var(--color-text-hero-2)]">{business.bio}</motion.p>
      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[4] }} className="mt-3 text-sm text-[var(--color-text-hero-3)]">★ <span className="text-[var(--color-text-hero)]">4.9</span> (143 reviews) · 📍 {business.location}</motion.p>
    </section>
  );
}

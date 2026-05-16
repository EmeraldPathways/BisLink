import type { HelpDoc } from '@/lib/agents/types';

export function scoreKnowledgeDocs(message: string, docs: HelpDoc[]) {
  const normalized = message.toLowerCase();
  const terms = normalized
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3);

  return docs
    .map((doc) => ({
      doc,
      score:
        doc.keywords.reduce(
          (total, keyword) => total + (normalized.includes(keyword) ? 3 : 0),
          0
        ) +
        terms.reduce((total, term) => {
          if (doc.title.toLowerCase().includes(term)) return total + 2;
          if (doc.content.toLowerCase().includes(term)) return total + 1;
          return total;
        }, 0)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

'use client';

import Image from 'next/image';
import { useState } from 'react';

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  value: string;
  kind: 'profile' | 'cover' | 'portfolio' | 'product' | 'service';
  aspectHint?: string;
  onChange: (url: string) => void;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RATIO_TOLERANCE = 0.02;

function getUploadRule(kind: ImageUploadFieldProps['kind']) {
  if (kind === 'product' || kind === 'service') {
    return { label: 'square (1:1)', ratio: 1 };
  }

  if (kind === 'cover') {
    return { label: '16:9', ratio: 16 / 9 };
  }

  return null;
}

async function getImageDimensions(file: File) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    try {
      return { width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('Could not load image'));
      image.src = imageUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function ImageUploadField({ label, description, value, kind, aspectHint, onChange }: ImageUploadFieldProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setLoading(true);
    setError(null);

    try {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error('Only JPG, PNG, and WebP files are allowed');
      }

      const rule = getUploadRule(kind);

      if (rule) {
        const { width, height } = await getImageDimensions(file);
        const ratio = width / height;

        if (Math.abs(ratio - rule.ratio) > RATIO_TOLERANCE) {
          throw new Error(`${label} must be ${rule.label}`);
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      const response = await fetch('/api/owner/media', {
        method: 'POST',
        body: formData
      });
      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-[20px] border border-[var(--color-border)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
        {description ? <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description}</p> : null}
        {aspectHint ? <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{aspectHint}</p> : null}
      </div>

      <div className={`relative overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-2)] ${kind === 'profile' ? 'aspect-square max-w-[120px] rounded-full' : kind === 'cover' ? 'aspect-[16/7]' : 'aspect-square max-w-[160px]'}`}>
        {value ? <Image src={value} alt={`${label} preview`} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-secondary)]">No image</div>}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer rounded-xl bg-[var(--color-void)] px-4 py-2 text-sm font-semibold text-white">
          {loading ? 'Uploading...' : 'Upload image'}
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            disabled={loading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
              event.currentTarget.value = '';
            }}
          />
        </label>
        {value ? (
          <button type="button" onClick={() => onChange('')} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold">
            Remove image
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

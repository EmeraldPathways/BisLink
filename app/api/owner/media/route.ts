import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { getBusinessMediaBucketMessage, isBucketNotFoundError } from '@/lib/supabase/schema-compat';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const BUSINESS_MEDIA_BUCKET = 'business-media';
const RATIO_TOLERANCE = 0.02;

function getExtension(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}

function getUploadRule(kind: string) {
  if (kind === 'product' || kind === 'service') {
    return { label: 'square (1:1)', ratio: 1 };
  }

  if (kind === 'cover') {
    return { label: '16:9', ratio: 16 / 9 };
  }

  return null;
}

function getOrientedDimensions(width: number, height: number, orientation?: number) {
  if (orientation && [5, 6, 7, 8].includes(orientation)) {
    return { width: height, height: width };
  }

  return { width, height };
}

export async function POST(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const kind = formData.get('kind');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (kind !== 'profile' && kind !== 'cover' && kind !== 'portfolio' && kind !== 'product' && kind !== 'service') {
    return NextResponse.json({ error: 'Invalid upload kind' }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP files are allowed' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
  }

  const extension = getExtension(file.type);
  if (!extension) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  const path = `businesses/${owner.business.id}/${kind}-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let uploadBuffer: Buffer;

  try {
    const image = sharp(buffer, { failOn: 'error' }).rotate();
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: 'Could not read image dimensions' }, { status: 400 });
    }

    const dimensions = getOrientedDimensions(metadata.width, metadata.height, metadata.orientation);
    const ratio = dimensions.width / dimensions.height;
    const rule = getUploadRule(kind);

    if (rule && Math.abs(ratio - rule.ratio) > RATIO_TOLERANCE) {
      return NextResponse.json({ error: `${kind === 'cover' ? 'Hero images' : 'Product and service images'} must be ${rule.label}` }, { status: 400 });
    }

    uploadBuffer = await image.toBuffer();
  } catch {
    return NextResponse.json({ error: 'Only valid image files are allowed' }, { status: 400 });
  }

  const { error: uploadError } = await owner.supabase.storage.from(BUSINESS_MEDIA_BUCKET).upload(path, uploadBuffer, {
    contentType: file.type,
    upsert: true
  });

  if (uploadError) {
    if (isBucketNotFoundError(uploadError, BUSINESS_MEDIA_BUCKET)) {
      return NextResponse.json({ error: getBusinessMediaBucketMessage(BUSINESS_MEDIA_BUCKET) }, { status: 500 });
    }

    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = owner.supabase.storage.from(BUSINESS_MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}

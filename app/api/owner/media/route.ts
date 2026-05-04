import { type NextRequest, NextResponse } from 'next/server';
import { requireOwnerBusiness } from '@/lib/owner-api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

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

  if (kind !== 'profile' && kind !== 'cover' && kind !== 'portfolio') {
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
  const { error: uploadError } = await owner.supabase.storage.from('business-media').upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = owner.supabase.storage.from('business-media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}

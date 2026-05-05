type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
};

function getMessage(error: unknown) {
  return typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
    ? (error as { message: string }).message
    : '';
}

export function isMissingColumnError(error: unknown, table: string, column: string) {
  const message = getMessage(error);
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    ((error as SupabaseLikeError).code === 'PGRST204' || (error as SupabaseLikeError).code === '42703') &&
    message.includes(column) &&
    message.includes(table)
  );
}

export function isMissingRelationError(error: unknown, relation: string) {
  const message = getMessage(error);
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    ((error as SupabaseLikeError).code === 'PGRST205' || (error as SupabaseLikeError).code === '42P01') &&
    message.includes(relation)
  );
}

export function isBucketNotFoundError(error: unknown, bucket: string) {
  const message = getMessage(error).toLowerCase();
  return message.includes('bucket not found') && message.includes(bucket.toLowerCase());
}

export function getPublicPageMigrationMessage() {
  return 'Database schema is missing the public page fields. Run Supabase migrations 0012_public_page_brand_redesign.sql and 0013_portfolio_items.sql, then refresh the schema cache.';
}

export function getBusinessMediaBucketMessage(bucket: string) {
  return `Storage bucket "${bucket}" is missing. Run Supabase migration 0013_portfolio_items.sql or create the bucket before uploading media.`;
}

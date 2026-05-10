import { isMissingColumnError } from '@/lib/supabase/schema-compat';
import type { ServiceRecord } from '@/types';

const SERVICE_SELECT_BASE =
  'id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji';

export const SERVICE_SELECT_WITH_IMAGE = `${SERVICE_SELECT_BASE},image_url`;

type ServiceQueryClient = {
  from: (table: 'services') => any;
};

export async function listServices(
  supabase: ServiceQueryClient,
  businessId: string,
  options?: { onlyActive?: boolean }
) {
  const onlyActive = options?.onlyActive ?? false;

  const runQuery = async (columns: string): Promise<{ data: ServiceRecord[] | null; error: unknown }> => {
    let query = supabase.from('services').select(columns).eq('business_id', businessId);
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    return query.order('sort_order', { ascending: true });
  };

  const result = await runQuery(SERVICE_SELECT_WITH_IMAGE);
  if (!result.error) {
    return result;
  }

  if (!isMissingColumnError(result.error, 'services', 'image_url')) {
    return result;
  }

  return runQuery(SERVICE_SELECT_BASE);
}

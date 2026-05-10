import test from 'node:test';
import assert from 'node:assert/strict';

function createBuilder(result) {
  return {
    eq() {
      return this;
    },
    order() {
      return Promise.resolve(result);
    }
  };
}

test('service schema fallback retries without image_url when the column is missing', async () => {
  const calls = [];
  const missingColumnError = {
    code: 'PGRST204',
    message: "Could not find the 'image_url' column of 'services' in the schema cache"
  };

  const supabase = {
    from(table) {
      assert.equal(table, 'services');
      return {
        select(columns) {
          calls.push(columns);
          if (columns.includes('image_url')) {
            return createBuilder({ data: null, error: missingColumnError });
          }

          return createBuilder({
            data: [
              {
                id: 'svc_1',
                business_id: 'biz_1',
                name: 'Consultation',
                description: '',
                duration_minutes: 60,
                price: 10000,
                currency: 'usd',
                max_concurrent: 1,
                buffer_after: 0,
                is_active: true,
                sort_order: 0,
                tag: null,
                emoji: '✨'
              }
            ],
            error: null
          });
        }
      };
    }
  };

  const { listServices } = await import('../lib/service-schema.ts');
  const result = await listServices(supabase, 'biz_1', { onlyActive: true });

  assert.deepEqual(calls, [
    'id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji,image_url',
    'id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji'
  ]);
  assert.equal(result.error, null);
  assert.equal(result.data?.length, 1);
});

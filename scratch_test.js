const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xyz.supabase.co', 'eyJhb...xyz');
try {
  let query = supabase.from('products').select('*').neq('id', undefined);
  console.log('Query built successfully');
} catch (e) {
  console.error('Error building query:', e.message);
}

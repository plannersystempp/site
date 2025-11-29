import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://atogozlqfwxztjyycjoy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2dvemxxZnd4enRqeXljam95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzY4MzY5MCwiZXhwIjoyMDE5MjU5NjkwfQ.0v7iJiF6zKMFz2b1Bj3xX8z4z1Z1Z1Z1Z1Z1Z1Z1Z1Z'
);

async function checkPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('sort_order');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Plans found:');
  data.forEach(plan => {
    console.log(`- ${plan.display_name} (${plan.name}): R$ ${plan.price/100}, billing_cycle: ${plan.billing_cycle}, active: ${plan.is_active}`);
  });
}

checkPlans();
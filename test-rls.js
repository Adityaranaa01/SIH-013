// Test RLS policies and permissions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqfohyirfowsbhyzzgf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcWZvaHlpcmZvd3NiaHl6emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTQzMDAsImV4cCI6MjA3MzE5MDMwMH0.YOuKs47PWjJ6-KMTXrwjEvjKuSQaTRI1kk2HU_-bN1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  console.log('Testing RLS policies and permissions...');
  
  try {
    // Test 1: Check if RLS is enabled
    console.log('\n1. Testing basic table access...');
    const { data, error, count } = await supabase
      .from('drivers')
      .select('*', { count: 'exact' });
    
    console.log('Query result:', { data, error, count });
    
    // Test 2: Try with different select options
    console.log('\n2. Testing count-only query...');
    const { count: countOnly, error: countError } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true });
    
    console.log('Count result:', { count: countOnly, error: countError });
    
    // Test 3: Check if table exists
    console.log('\n3. Testing table existence...');
    const { error: tableError } = await supabase
      .from('drivers')
      .select('driver_id')
      .limit(1);
    
    console.log('Table existence test error:', tableError);
    
    // Test 4: Check auth status
    console.log('\n4. Checking auth status...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testRLSPolicies();
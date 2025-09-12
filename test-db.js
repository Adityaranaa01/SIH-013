// Test script to check Supabase connection and data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqfohyirfowsbhyzzgf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcWZvaHlpcmZvd3NiaHl6emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTQzMDAsImV4cCI6MjA3MzE5MDMwMH0.YOuKs47PWjJ6-KMTXrwjEvjKuSQaTRI1kk2HU_-bN1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: pingData, error: pingError } = await supabase
      .from('drivers')
      .select('count');
    
    if (pingError) {
      console.error('Connection error:', pingError);
      return;
    }
    
    console.log('✓ Connection successful');
    
    // Check if drivers table exists and has data
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*');
    
    if (driversError) {
      console.error('Error reading drivers table:', driversError);
      return;
    }
    
    console.log('Drivers in database:', drivers);
    
    // Test specific login credentials
    const { data: testLogin, error: loginError } = await supabase
      .from('drivers')
      .select('*')
      .eq('driver_id', 'D001')
      .eq('bus_number', 'BUS101')
      .single();
    
    if (loginError) {
      console.error('Login test error:', loginError);
    } else {
      console.log('✓ Login credentials found:', testLogin);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();
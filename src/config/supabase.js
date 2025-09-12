// src/config/supabase.js
// Replace with your actual Supabase project credentials

export const supabaseConfig = {
  url: process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// Example environment variables to add to your .env file:
// REACT_APP_SUPABASE_URL=https://your-project.supabase.co
// REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
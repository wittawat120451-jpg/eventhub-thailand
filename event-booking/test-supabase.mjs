const SUPABASE_URL = 'https://wtqkvomoxqbizsguqdkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cWt2b21veHFiaXpzZ3VxZGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjU1NTcsImV4cCI6MjEwMzgwMTU1N30.9L3V2EGhvwwmNcu90zkczCQHuOw-ThM0VrG6TPM60ik';

async function testRest() {
  console.log('Testing Supabase REST endpoint...');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testRest();

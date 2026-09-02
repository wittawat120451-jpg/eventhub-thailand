const url = "https://mgyskmcohldmqxjsixhc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neXNrbWNvaGxkbXF4anNpeGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTY1OTksImV4cCI6MjEwMzg3MjU5OX0.xFu_CGf7ftkgnosE5WtYj-HVWBeiN9wyrK3kXSCwWdE";

async function test() {
  try {
    const res = await fetch(`${url}/rest/v1/events?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();

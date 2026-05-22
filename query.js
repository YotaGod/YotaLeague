const https = require('https');

const options = {
  hostname: 'pagrukpugmvohtxsmewv.supabase.co',
  path: '/rest/v1/state_turnamen',
  method: 'POST',
  headers: {
    'apikey': 'SUPABASE_ANON_KEY_HIDDEN',
    'Authorization': 'Bearer SUPABASE_ANON_KEY_HIDDEN',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.write(JSON.stringify({ turnamen_id: "00000000-0000-0000-0000-000000000000", user_id: "00000000-0000-0000-0000-000000000000", data_pertandingan: [] }));
req.end();

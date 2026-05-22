export default async function handler(req, res) {
  // Hanya melayani method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Gunakan variabel environment dari Vercel
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "SUPABASE_URL_HIDDEN";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "SUPABASE_ANON_KEY_HIDDEN";

  try {
    // Lakukan request kecil ke tabel 'tim' untuk memicu aktivitas database Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tim?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Kembalikan respons berhasil tanpa mengekspos data sensitif
    return res.status(200).json({ 
      success: true, 
      message: 'Ping berhasil, Supabase tetap aktif!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Ping error:", error);
    // Mengembalikan 200 meskipun error agar cron-job.org tidak mengirim email notifikasi kegagalan secara terus-menerus
    return res.status(200).json({ 
      success: false, 
      message: 'Ping gagal, tetapi ditangani agar tidak memicu notifikasi error.',
      error: error.message 
    });
  }
}

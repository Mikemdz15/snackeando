import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjoawvfzipnfmgqokdrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqb2F3dmZ6aXBuZm1ncW9rZHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzMxNTksImV4cCI6MjEwMDI0OTE1OX0.thH5IOqwI6kkBRRNfdHcyvcfD3xGddy96hFSPOCIh9U';
const scriptUrl = 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sync() {
  console.log("Reading products from Supabase...");
  try {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) throw error;
    
    console.log(`Retrieved ${products.length} products from Supabase.`);
    console.log("Syncing them to Google Sheets...");
    
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_all_products',
        products: products
      })
    });
    const text = await res.text();
    console.log("Response text:", text);
    console.log("Database catalog successfully synced to Google Sheets!");
  } catch (e) {
    console.error("Sync error:", e);
  }
}

sync();

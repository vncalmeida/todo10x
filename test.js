import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Testando fetch...');
  const { data: fetch, error: fetchErr } = await supabase.from('todo10x').select('*');
  console.log('Fetch Result:', fetch, fetchErr);

  console.log('Testando upsert...');
  const { data: up, error: upErr } = await supabase.from('todo10x').upsert({ id: 1, data_payload: { test: true } });
  console.log('Upsert Result:', up, upErr);
}

test();

import { createClient } from '@supabase/supabase-js';

// Helper for safe environment variable access
const getEnv = (key: string) => {
  // Check for Vite/Modern Browser environment
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Check for Node/Webpack/Vercel environment
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

// 1. Try to get config from Environment Variables
let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// 2. If missing and we are in the browser, try to get from LocalStorage (Runtime Config)
if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined') {
  const storedUrl = localStorage.getItem('vladicamp_supabase_url');
  const storedKey = localStorage.getItem('vladicamp_supabase_key');
  
  if (storedUrl) supabaseUrl = storedUrl;
  if (storedKey) supabaseKey = storedKey;
}

// If credentials are valid, create the real client.
// Otherwise, create a dummy object that mimics the API but returns errors, preventing a crash.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado. Faltan variables de entorno o configuración manual en Admin.' } }),
        }),
        insert: () => Promise.resolve({ error: { message: 'Supabase no configurado. Faltan variables de entorno o configuración manual en Admin.' } }),
        delete: () => ({
          neq: () => Promise.resolve({ error: { message: 'Supabase no configurado.' } })
        })
      })
    } as any;
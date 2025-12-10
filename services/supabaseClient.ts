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
// Support standard naming OR the user specific 'VITE_SUPABASE'
let supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE');

// 2. If missing and we are in the browser, try to get from LocalStorage (Runtime Config)
if (typeof window !== 'undefined') {
  if (!supabaseUrl) supabaseUrl = localStorage.getItem('vladicamp_supabase_url') || '';
  if (!supabaseKey) supabaseKey = localStorage.getItem('vladicamp_supabase_key') || '';
}

let client;

// 3. Initialize with safety check
try {
  if (supabaseUrl && supabaseKey) {
    // Validate URL format to prevent crash if user pasted a bad string
    new URL(supabaseUrl);
    client = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.warn("Supabase configuration invalid:", e);
  // Fallthrough to mock client
}

// If credentials are valid, create the real client.
// Otherwise, create a dummy object that mimics the API but returns errors.
export const supabase = client
  ? client
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
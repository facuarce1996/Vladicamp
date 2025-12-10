import { createClient } from '@supabase/supabase-js';

// En Vite, las variables de entorno se acceden via import.meta.env
// Asegúrate de que tus variables en .env o en el panel de Vercel comiencen con VITE_
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime manual override (desde el Panel Admin)
const getManualConfig = () => {
  if (typeof window !== 'undefined') {
    return {
      url: localStorage.getItem('vladicamp_supabase_url'),
      key: localStorage.getItem('vladicamp_supabase_key')
    };
  }
  return { url: null, key: null };
};

const manualConfig = getManualConfig();
const finalUrl = manualConfig.url || SUPABASE_URL;
const finalKey = manualConfig.key || SUPABASE_KEY;

let client;

if (finalUrl && finalKey && finalUrl.startsWith('http')) {
  try {
    client = createClient(finalUrl, finalKey);
  } catch (error) {
    console.error('Error inicializando Supabase:', error);
  }
}

// Exportamos el cliente o un mock seguro para evitar que la app explote si faltan las keys
export const supabase = client || {
  from: () => ({
    select: () => Promise.resolve({ 
      data: [], 
      error: { message: 'Supabase no conectado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' } 
    }),
    insert: () => Promise.resolve({ 
      error: { message: 'Supabase no conectado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' } 
    }),
    delete: () => ({
      neq: () => Promise.resolve({ error: { message: 'Supabase no conectado.' } })
    })
  })
} as any;
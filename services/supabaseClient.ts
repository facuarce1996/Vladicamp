import { createClient } from '@supabase/supabase-js';

// Acceso seguro a variables de entorno para evitar "Cannot read properties of undefined"
const getEnvVar = (key: string) => {
  // Verificación defensiva de import.meta con cast a 'any' para evitar errores de TS (TS2339)
  const meta = import.meta as any;
  
  if (typeof meta !== 'undefined' && meta.env) {
    return meta.env[key] || '';
  }
  return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

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
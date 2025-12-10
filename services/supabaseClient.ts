import { createClient } from '@supabase/supabase-js';

// Helper function to get environment variables reliably across environments (Vite/Node)
const getEnvVar = (key: string): string => {
  // 1. Try Vite's import.meta.env (Standard for this project)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // 2. Try process.env (Fallback or for build scripts)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }

  return '';
};

// Config keys
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE');

// Runtime manual override (from Admin Panel LocalStorage)
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

if (finalUrl && finalKey) {
  try {
    // Validate URL syntax basically to avoid crash
    if (finalUrl.startsWith('http')) {
      client = createClient(finalUrl, finalKey);
    } else {
      console.warn('Supabase URL inválida detectada.');
    }
  } catch (error) {
    console.error('Error inicializando Supabase:', error);
  }
}

// Export client or a safe mock to prevent "Cannot read properties of undefined"
export const supabase = client || {
  from: () => ({
    select: () => Promise.resolve({ 
      data: [], 
      error: { message: 'Supabase no conectado. Configura las variables en .env o en el Panel Admin.' } 
    }),
    insert: () => Promise.resolve({ 
      error: { message: 'Supabase no conectado. Configura las variables en .env o en el Panel Admin.' } 
    }),
    delete: () => ({
      neq: () => Promise.resolve({ error: { message: 'Supabase no conectado.' } })
    })
  })
} as any;
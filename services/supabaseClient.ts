import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabaseConfig';

// Inicialización directa con las credenciales del archivo de configuración.
// Esto asegura que funcione en todos los dispositivos (celulares, pc, etc)
// sin depender de variables de entorno locales o configuraciones manuales.

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
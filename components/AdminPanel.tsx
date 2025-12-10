import React, { useRef, useEffect, useState } from 'react';
import { QUESTIONS } from '../constants';
import { Submission } from '../types';
import { Logo } from './Logo';
import { LogOut, Upload, Trash2, Download, Smartphone, Undo2, Loader2, RefreshCcw, Database, Save } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AdminPanelProps {
  logoSrc: string | null;
  onUpdateLogo: (file: File) => void;
  onLogout: () => void;
  onResetDevice: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  logoSrc, 
  onUpdateLogo, 
  onLogout,
  onResetDevice
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // DB Config State
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching votes:", error);
      // Don't alert immediately on load to avoid spamming if not configured
    } else {
      const formattedData: Submission[] = (data || []).map((row: any) => ({
        email: row.email,
        timestamp: row.created_at,
        votes: row.votes
      }));
      setSubmissions(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
    
    // Load existing manual config
    const storedUrl = localStorage.getItem('vladicamp_supabase_url');
    const storedKey = localStorage.getItem('vladicamp_supabase_key');
    if(storedUrl) setDbUrl(storedUrl);
    if(storedKey) setDbKey(storedKey);
  }, []);

  const handleSaveDbConfig = () => {
    if (!dbUrl || !dbKey) {
        alert("Por favor completa URL y Key");
        return;
    }
    localStorage.setItem('vladicamp_supabase_url', dbUrl.trim());
    localStorage.setItem('vladicamp_supabase_key', dbKey.trim());
    alert('Configuración guardada. La página se recargará para aplicar los cambios.');
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdateLogo(e.target.files[0]);
    }
  };

  const handleClearData = async () => {
    if(window.confirm('ATENCIÓN: Esto borrará TODOS los registros de la base de datos de Nube permanentemente. ¿Estás seguro?')) {
       const { error } = await supabase.from('votes').delete().neq('id', 0);
       if (error) {
         alert("Error borrando datos (Revisar permisos RLS): " + (error.message || "Desconocido"));
       } else {
         setSubmissions([]);
         alert("Base de datos limpiada.");
       }
    }
  };

  const downloadCSV = () => {
    const headers = ['Email', 'Fecha', ...QUESTIONS.map(q => q.text)];
    const rows = submissions.map(s => [
      s.email,
      new Date(s.timestamp).toLocaleString(),
      ...QUESTIONS.map(q => s.votes[q.id] || '')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'vladicamp_votes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Panel de Configuración</h1>
            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20">Admin</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        </div>

        {/* Database Configuration Section */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Database size={20} className="text-emerald-500" />
                Conexión a Supabase (Base de Datos)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Project URL</label>
                    <input 
                        type="text" 
                        value={dbUrl}
                        onChange={(e) => setDbUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">API Key (anon/public)</label>
                    <input 
                        type="password" 
                        value={dbKey}
                        onChange={(e) => setDbKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleSaveDbConfig}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                    <Save size={18} />
                    Guardar y Recargar
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                * Si usas Vercel con variables de entorno, esto no es necesario. Úsalo si te aparece "Error [object Object]".
            </p>
        </div>

        {/* Configuration Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Logo Configuration */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload size={20} className="text-yellow-500" />
                Configuración de Logo
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                <div className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-yellow-500/50 transition-colors group cursor-pointer h-40"
                    onClick={() => fileInputRef.current?.click()}>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    />
                    <div className="bg-slate-800 p-3 rounded-full mb-3 group-hover:bg-slate-700 transition-colors">
                    <Upload className="text-slate-400 group-hover:text-yellow-500 transition-colors" size={20} />
                    </div>
                    <p className="text-slate-300 font-medium text-sm">Subir nuevo logo</p>
                </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-6 border border-slate-700 h-40 w-full relative group">
                    {logoSrc && (
                       <button 
                         onClick={() => {
                             localStorage.removeItem('vladicamp_logo');
                             window.location.reload();
                         }}
                         className="absolute top-2 right-2 bg-slate-800 text-slate-400 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                         title="Restaurar Logo Original"
                       >
                           <Undo2 size={14} />
                       </button>
                    )}
                    <Logo size="lg" customSrc={logoSrc} className="transform scale-75" />
                </div>
            </div>
            </div>

            {/* Testing Actions */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Smartphone size={20} className="text-blue-500" />
                    Acciones de Prueba
                </h2>
                
                <div className="flex-1 bg-slate-900/30 rounded-xl p-6 border border-slate-700/50 flex flex-col justify-center space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-white">Desbloquear este dispositivo</h3>
                            <p className="text-sm text-slate-400 mt-1">Permite volver a votar desde este navegador.</p>
                        </div>
                        <button 
                            onClick={onResetDevice}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-blue-500/20 whitespace-nowrap"
                        >
                            Desbloquear
                        </button>
                    </div>
                    
                    <div className="w-full h-px bg-slate-700/50"></div>

                     <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-red-400">Borrar Base de Datos</h3>
                            <p className="text-sm text-slate-500 mt-1">Elimina permanentemente los registros de Supabase.</p>
                        </div>
                        <button 
                            onClick={handleClearData}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-red-500/20 whitespace-nowrap"
                        >
                            <Trash2 size={16} />
                            Borrar DB
                        </button>
                    </div>
                </div>
            </div>

        </div>

        {/* Data Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Registros de Votación (Nube)</h2>
              <p className="text-slate-400 text-sm">{submissions.length} votos registrados</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchSubmissions}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                Actualizar
              </button>

              <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                disabled={submissions.length === 0}
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-slate-200 font-medium border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap sticky left-0 bg-[#162032] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">Email</th>
                  <th className="px-6 py-4 whitespace-nowrap border-l border-slate-700">Fecha</th>
                  {QUESTIONS.map(q => (
                    <th key={q.id} className="px-6 py-4 whitespace-nowrap border-l border-slate-700 min-w-[200px]" title={q.text}>
                      {q.id}. {q.text.length > 30 ? q.text.substring(0, 30) + '...' : q.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                   <tr>
                     <td colSpan={QUESTIONS.length + 2} className="px-6 py-12 text-center text-slate-500">
                       <div className="flex flex-col items-center justify-center gap-2">
                         <Loader2 className="animate-spin text-yellow-500" size={32} />
                         <p>Cargando registros...</p>
                       </div>
                     </td>
                   </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={QUESTIONS.length + 2} className="px-6 py-12 text-center text-slate-500">
                      No hay registros en la base de datos todavía.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap sticky left-0 bg-[#0f172a] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)] border-r border-slate-700">
                        {sub.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-slate-700">
                        {new Date(sub.timestamp).toLocaleString()}
                      </td>
                      {QUESTIONS.map(q => (
                        <td key={q.id} className="px-6 py-4 whitespace-nowrap border-r border-slate-700/50">
                          {sub.votes[q.id] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
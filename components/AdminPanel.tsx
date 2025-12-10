import React, { useRef, useEffect, useState } from 'react';
import { QUESTIONS } from '../constants';
import { Submission } from '../types';
import { Logo } from './Logo';
import { LogOut, Link as LinkIcon, Trash2, Download, Smartphone, Undo2, Loader2, RefreshCcw, Database, Save, ImagePlus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AdminPanelProps {
  logoSrc: string | null;
  onUpdateLogo: (url: string) => void;
  onLogout: () => void;
  onResetDevice: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  logoSrc, 
  onUpdateLogo, 
  onLogout,
  onResetDevice
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // DB Config State
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  
  // Global Logo State
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching votes:", error);
    } else {
      // Filter out the configuration row and format data
      const formattedData: Submission[] = (data || [])
        .filter((row: any) => row.email !== 'admin_config') // Hide config row
        .map((row: any) => ({
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
    
    if (logoSrc) setNewLogoUrl(logoSrc);
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

  const handleSaveLogoGlobal = async () => {
    if (!newLogoUrl) return;
    setSavingLogo(true);
    
    try {
      // 1. Save to Database (Global)
      // We use a specific email 'admin_config' to store settings without creating a new table
      
      // First delete old config to avoid duplicates if ID is auto-generated
      await supabase.from('votes').delete().eq('email', 'admin_config');
      
      // Insert new config
      const { error } = await supabase.from('votes').insert({
        email: 'admin_config',
        votes: { logo_url: newLogoUrl } // We store the URL inside the votes JSON column
      });

      if (error) throw error;

      // 2. Update local state
      onUpdateLogo(newLogoUrl);
      alert("Logo actualizado globalmente. Todos los dispositivos verán este logo.");
      
    } catch (err: any) {
      console.error("Error saving logo:", err);
      alert("Error guardando logo en la nube: " + err.message);
    } finally {
      setSavingLogo(false);
    }
  };

  const handleClearData = async () => {
    if(window.confirm('ATENCIÓN: Esto borrará TODOS los registros de la base de datos de Nube permanentemente. ¿Estás seguro?')) {
       // Delete everything EXCEPT the config
       const { error } = await supabase.from('votes').delete().neq('email', 'admin_config');
       if (error) {
         alert("Error borrando datos (Revisar permisos RLS): " + (error.message || "Desconocido"));
       } else {
         setSubmissions([]);
         alert("Base de datos limpiada (Configuración preservada).");
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
                * Si usas Vercel con variables de entorno, esto no es necesario.
            </p>
        </div>

        {/* Configuration Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Logo Configuration */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <ImagePlus size={20} className="text-yellow-500" />
                  Logo Global (Visible en todos los celulares)
              </h2>
              
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">URL de la Imagen (Link)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <LinkIcon size={16} />
                      </div>
                      <input 
                        type="text" 
                        value={newLogoUrl} 
                        onChange={(e) => setNewLogoUrl(e.target.value)} 
                        placeholder="https://i.imgur.com/..." 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <button 
                      onClick={handleSaveLogoGlobal}
                      disabled={savingLogo || !newLogoUrl}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingLogo ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Guardar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Sube tu imagen a <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-500 underline">imgbb.com</a> y pega el "Enlace directo" aquí.
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-6 border border-slate-700 min-h-[160px] relative group">
                    <p className="text-xs text-slate-500 absolute top-2 left-2">Vista previa actual:</p>
                    {logoSrc && (
                       <button 
                         onClick={() => onUpdateLogo('')}
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
                            <p className="text-sm text-slate-500 mt-1">Elimina los votos (Mantiene la config del logo).</p>
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
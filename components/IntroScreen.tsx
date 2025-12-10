import React, { useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight, Shield, KeyRound, ChevronLeft, AlertCircle, X } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
  onAdminLogin: (password: string) => boolean;
  logoSrc: string | null;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onAdminLogin, logoSrc }) => {
  const [view, setView] = useState<'menu' | 'admin'>('menu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  const handleStartClick = () => {
    if (localStorage.getItem('vladicamp_device_voted') === 'true') {
      setShowBlockedModal(true);
    } else {
      onStart();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
      <div className="w-full max-w-md relative">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="mb-10 relative z-10">
            <Logo size="lg" customSrc={logoSrc} />
          </div>

          <div className="relative z-10">
            {view === 'menu' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Vladicamp 2025</h2>
                  <p className="text-slate-400">
                    Completá las ternas más picantes del año.
                  </p>
                </div>

                <button
                  onClick={handleStartClick}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Ingresar a la encuesta
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={() => setView('admin')}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-xl border border-slate-600 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
                >
                  <Shield size={18} />
                  Ingresar como administrador
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                 <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Acceso Administrador</h2>
                  <p className="text-slate-400 text-sm">
                    Ingresá la clave de acceso para continuar.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 ml-1">
                    Clave de acceso
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound size={20} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      className={`w-full bg-slate-900/80 border ${error ? 'border-red-500' : 'border-slate-600'} text-white py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all placeholder-slate-500`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs ml-1">Clave incorrecta. Intentalo de nuevo.</p>}
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-all"
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('menu');
                      setError(false);
                      setPassword('');
                    }}
                    className="w-full text-slate-400 hover:text-white py-2 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Volver al menú
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Blocked Modal */}
        {showBlockedModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl" onClick={() => setShowBlockedModal(false)}></div>
             <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 shadow-2xl relative w-full max-w-sm animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setShowBlockedModal(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">¡Ya votaste!</h3>
                  <p className="text-slate-300">
                    Eyy, ya votaste, deja que voten los demás, no seas ventajin.
                  </p>
                  <button 
                    onClick={() => setShowBlockedModal(false)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                  >
                    Entendido
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
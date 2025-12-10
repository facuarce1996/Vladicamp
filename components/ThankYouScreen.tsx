import React from 'react';
import { Logo } from './Logo';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Trophy, Clock } from 'lucide-react';

interface ThankYouScreenProps {
  analysis: string;
  logoSrc: string | null;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ analysis, logoSrc }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Message */}
        <div className="text-center space-y-6 py-8">
          <Logo size="lg" className="mb-6" customSrc={logoSrc} />
          
          <div className="bg-gradient-to-r from-yellow-600/20 via-yellow-500/20 to-yellow-600/20 p-8 rounded-2xl border border-yellow-500/30 backdrop-blur-sm">
            <div className="inline-block p-3 bg-yellow-500 rounded-full text-slate-900 mb-4 shadow-lg shadow-yellow-500/50">
              <Trophy size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¡Votos Registrados!
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
              Gracias por completar la encuesta del vladicamp, espero que puedas ganar muchas ternas (positivas).
            </p>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 border-b border-slate-700">
            <Sparkles className="text-yellow-500" size={24} />
            <h2 className="font-bold text-lg text-white">Análisis de tus votaciones</h2>
          </div>
          
          <div className="p-8">
            <div className="prose prose-invert prose-yellow max-w-none leading-relaxed text-slate-200">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Session Timeout Info */}
        <div className="flex justify-center pt-8 pb-12">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full text-sm">
            <Clock size={14} />
            <span>La sesión se cerrará automáticamente en 1 minuto.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
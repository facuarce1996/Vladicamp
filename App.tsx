import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { VoteCard } from './components/VoteCard';
import { IntroScreen } from './components/IntroScreen';
import { ThankYouScreen } from './components/ThankYouScreen';
import { AdminPanel } from './components/AdminPanel';
import { Logo } from './components/Logo';
import { QUESTIONS, CANDIDATES, shuffleArray } from './constants';
import { VoteState, Submission } from './types';
import { generateVoteAnalysis } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Send, RotateCcw } from 'lucide-react';

type ViewState = 'intro' | 'voting' | 'results' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewState>('intro');
  const [email, setEmail] = useState('');
  const [votes, setVotes] = useState<VoteState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  // Admin & Persistence State
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  // Load local settings on mount AND Global Config from DB
  useEffect(() => {
    const fetchGlobalConfig = async () => {
       try {
         // Check local storage first
         const savedLogo = localStorage.getItem('vladicamp_logo');
         if (savedLogo) setLogoSrc(savedLogo);

         // Fetch global config from DB (admin_config row)
         // We do this to sync logo across devices
         const { data, error } = await supabase
           .from('votes')
           .select('votes')
           .eq('email', 'admin_config')
           .single();
         
         if (data && data.votes && data.votes.logo_url) {
            setLogoSrc(data.votes.logo_url);
            localStorage.setItem('vladicamp_logo', data.votes.logo_url);
         }
       } catch (e) {
         console.error("Error loading config", e);
       }
    };

    fetchGlobalConfig();

    // Try to restore draft votes if not submitted
    if (localStorage.getItem('vladicamp_device_voted') !== 'true') {
      const savedDraft = localStorage.getItem('vladicamp_draft_votes');
      if (savedDraft) {
        try {
          setVotes(JSON.parse(savedDraft));
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }
  }, []);

  // Save draft whenever votes change
  useEffect(() => {
    if (Object.keys(votes).length > 0 && view === 'voting') {
      localStorage.setItem('vladicamp_draft_votes', JSON.stringify(votes));
    }
  }, [votes, view]);

  const randomizedCandidates = useMemo(() => {
    return shuffleArray(CANDIDATES);
  }, []);

  const handleStart = () => {
    // Check device lock
    if (localStorage.getItem('vladicamp_device_voted') === 'true') {
      alert("Eyy, ya votaste, deja que voten los demás, no seas ventajin");
      return;
    }

    setEmail('Anónimo');
    setView('voting');
    window.scrollTo(0, 0);
  };

  const handleAdminLogin = (password: string) => {
    if (password === '39908053') {
      setView('admin');
      return true;
    }
    return false;
  };

  const handleSelect = useCallback((questionId: number, candidate: string) => {
    setVotes((prev) => ({
      ...prev,
      [questionId]: candidate,
    }));
  }, []);

  const handleReset = () => {
    if (window.confirm("¿Estás seguro de reiniciar la aplicación? Se perderán los datos actuales.")) {
      setVotes({});
      setAnalysisResult(null);
      setEmail('');
      localStorage.removeItem('vladicamp_draft_votes');
      setView('intro');
    }
  };

  const handleUpdateLogo = (url: string) => {
    setLogoSrc(url);
    if(url) {
        localStorage.setItem('vladicamp_logo', url);
    } else {
        localStorage.removeItem('vladicamp_logo');
    }
  };

  // Helper for admin to reset their own device lock for testing
  const handleResetDeviceLock = () => {
    localStorage.removeItem('vladicamp_device_voted');
    alert("Bloqueo de dispositivo eliminado. Ahora puedes volver a votar.");
  };

  const handleSubmit = async () => {
    // Filter logic to ensure validity
    const completedCount = Object.values(votes).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
    if (completedCount !== QUESTIONS.length) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Save to Supabase
      // NOTE: Removed 'timestamp' field. Supabase uses 'created_at' default column automatically.
      const { error } = await supabase
        .from('votes')
        .insert([
          { 
            email: email || "Anónimo",
            votes: votes
          }
        ]);

      if (error) {
        // Safe error logging
        const errorMessage = (error && typeof error === 'object' && 'message' in error) 
           ? (error as any).message 
           : JSON.stringify(error);
        
        console.error('Error saving to Supabase:', errorMessage);
        alert(`Hubo un error guardando los votos (${errorMessage}), pero se generará el análisis igual. \n\nTip: Avisale al admin que configure la base de datos.`);
      }

      // 2. Lock device
      localStorage.setItem('vladicamp_device_voted', 'true');
      localStorage.removeItem('vladicamp_draft_votes');

      // 3. Generate Analysis
      const result = await generateVoteAnalysis(votes, QUESTIONS);
      setAnalysisResult(result);
      
      setView('results');
      window.scrollTo(0, 0);

      // 4. Auto-reset/Close session
      setTimeout(() => {
        setVotes({});
        setAnalysisResult(null);
        setEmail('');
        setView('intro');
        window.scrollTo(0, 0);
      }, 60000);

    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = Object.values(votes).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  const totalCount = QUESTIONS.length;
  const progress = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  // Render Views
  if (view === 'admin') {
    return (
      <AdminPanel 
        logoSrc={logoSrc}
        onUpdateLogo={handleUpdateLogo}
        onLogout={() => setView('intro')}
        onResetDevice={handleResetDeviceLock}
      />
    );
  }

  if (view === 'intro') {
    return <IntroScreen onStart={handleStart} onAdminLogin={handleAdminLogin} logoSrc={logoSrc} />;
  }

  if (view === 'results' && analysisResult) {
    return <ThankYouScreen analysis={analysisResult} logoSrc={logoSrc} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700 shadow-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               {/* Small logo in header */}
               <div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                 <Logo size="sm" className="transform scale-50" customSrc={logoSrc} />
               </div>
               <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Vladicamp 2025</h1>
                <p className="text-slate-400 text-xs truncate max-w-[200px]">Encuesta General</p>
               </div>
            </div>
            
            <button 
              onClick={handleReset}
              className="text-slate-500 hover:text-red-400 transition-colors p-2"
              title="Salir"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Tu progreso</span>
            <span className={isComplete ? "text-yellow-500" : ""}>{completedCount} de {totalCount} ternas</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {QUESTIONS.map((q) => (
          <VoteCard
            key={q.id}
            question={q}
            candidates={randomizedCandidates}
            selectedCandidate={votes[q.id]}
            onSelect={handleSelect}
          />
        ))}
      </main>

      {/* Floating Action Button / Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-30">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform ${
              isComplete
                ? "bg-yellow-500 hover:bg-yellow-400 text-slate-900 hover:scale-[1.02] shadow-yellow-500/25 cursor-pointer"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Procesando votos...
              </>
            ) : (
              <>
                <Send size={20} className={isComplete ? "animate-pulse" : ""} />
                {isComplete ? "Enviar Votos" : `Completa ${totalCount - completedCount} faltantes`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Question, Candidate } from '../types';
import { ChevronDown, Trophy, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

interface VoteCardProps {
  question: Question;
  candidates: Candidate[];
  selectedCandidate: Candidate | undefined;
  onSelect: (questionId: number, candidate: Candidate) => void;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  question,
  candidates,
  selectedCandidate,
  onSelect,
}) => {
  const isText = question.type === 'text';
  // Check if the question has a valid answer
  const isAnswered = selectedCandidate && selectedCandidate.toString().trim().length > 0;

  return (
    <div 
      className={`
        rounded-xl p-6 shadow-lg border transition-all duration-300 group relative overflow-hidden
        ${isAnswered 
          ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'bg-slate-800 border-slate-700 hover:border-yellow-500/50'
        }
      `}
    >
      {/* Background decoration for completed items */}
      {isAnswered && (
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <CheckCircle2 size={100} className="text-emerald-500 transform rotate-12" />
        </div>
      )}

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className={`
          p-2 rounded-lg transition-colors mt-1 shrink-0
          ${isAnswered 
            ? 'bg-emerald-500/20 text-emerald-500' 
            : 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-900'
          }
        `}>
          {isText ? <MessageSquareQuote size={20} /> : <Trophy size={20} />}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`text-lg font-semibold leading-tight transition-colors ${isAnswered ? 'text-emerald-50' : 'text-white'}`}>
              {question.id}. {question.text}
            </h3>
          </div>
          
          {isAnswered && (
            <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 size={12} />
              <span>Completado</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10">
        {isText ? (
          <input
            type="text"
            className={`
              w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder-slate-500
              ${isAnswered 
                ? 'bg-slate-900/50 border-emerald-500/50 text-white focus:ring-emerald-500 focus:border-transparent' 
                : 'bg-slate-900 border-slate-600 text-white focus:ring-yellow-500 focus:border-transparent hover:bg-slate-950'
              }
            `}
            placeholder="Escribí tu respuesta acá..."
            value={selectedCandidate || ""}
            onChange={(e) => onSelect(question.id, e.target.value)}
          />
        ) : (
          <div className="relative">
            <select
              className={`
                w-full appearance-none py-3 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 cursor-pointer transition-colors
                ${isAnswered
                  ? 'bg-slate-900/50 border-emerald-500/50 text-emerald-100 focus:ring-emerald-500 focus:border-transparent'
                  : 'bg-slate-900 border-slate-600 text-white focus:ring-yellow-500 focus:border-transparent hover:bg-slate-950'
                }
              `}
              value={selectedCandidate || ""}
              onChange={(e) => onSelect(question.id, e.target.value)}
            >
              <option value="" disabled className="text-slate-500">
                Seleccioná un candidato...
              </option>
              {candidates.map((candidate) => (
                <option key={candidate} value={candidate} className="text-slate-900 bg-white">
                  {candidate}
                </option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${isAnswered ? 'text-emerald-500' : 'text-slate-400'}`}>
              <ChevronDown size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
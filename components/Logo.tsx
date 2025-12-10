import React, { useState, useEffect } from 'react';
import { Cat } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'lg';
  customSrc?: string | null;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'lg', customSrc }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state if source changes
  useEffect(() => {
    setImgError(false);
  }, [customSrc]);

  const iconSize = size === 'lg' ? 80 : 40;
  const titleSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  const subtitleSize = size === 'lg' ? 'text-xl' : 'text-xs';
  
  // Prioritize customSrc, fallback to default file, then to icon
  const imageSource = customSrc || "/logo.png";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {!imgError ? (
        <img 
          src={imageSource}
          alt="Vladicamp 2025" 
          className={`${size === 'lg' ? 'w-48 h-48' : 'w-10 h-10'} object-contain mb-4`}
          onError={() => setImgError(true)} 
        />
      ) : (
        <div className="flex flex-col items-center animate-in fade-in duration-500">
           {/* Visual approximation of the logo */}
           <div className="relative mb-2">
             <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
             <Cat size={iconSize} className="text-yellow-500 relative z-10" strokeWidth={1.5} />
           </div>
           {size === 'lg' && (
             <>
               <h1 className={`${titleSize} font-bold text-yellow-500 tracking-widest uppercase drop-shadow-lg font-[Inter]`}>
                 Vladimiux
               </h1>
               <h2 className={`${subtitleSize} font-bold text-yellow-600 tracking-[0.6em] uppercase mt-1`}>
                 Team
               </h2>
             </>
           )}
        </div>
      )}
    </div>
  );
};
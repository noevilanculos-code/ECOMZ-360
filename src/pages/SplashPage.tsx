import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Sparkles } from 'lucide-react';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 12;
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-center p-6 sm:p-10 select-none overflow-hidden text-white">
      {/* Background Image: Mozambican Coastal Landscape */}
      {/* Background Image from official mockups */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-3000 scale-105 opacity-35"
        style={{
          backgroundImage: `url('/assets/img/imagens/imagem/ChatGPT Image 21 de set. de 2026, 12_18_15 (2).png'), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85')`
        }}
      />

      {/* Deep Blue solid overlay matching official institutional branding */}
      <div className="absolute inset-0 bg-[#062B3D]/95" />

      {/* Top spacer */}
      <div className="relative z-10 pt-8 sm:pt-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-semibold backdrop-blur-md shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#00B956]" />
          <span>Moçambique • Projeto ECO-MZ 360</span>
        </div>
      </div>

      {/* Central Branding Section - Clean Logo without circular border */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl my-auto space-y-6 animate-in fade-in zoom-in duration-500 px-4">
        {/* Official Logo prominently displayed */}
        <div className="flex items-center justify-center py-3">
          <img
            src="/assets/img/imagens/logo/ECOMZ-LOGO_ORIGINAL.png"
            alt="ECO-MZ 360"
            className="w-72 sm:w-96 md:w-[460px] max-w-full h-auto max-h-80 object-contain transition-transform duration-300 drop-shadow-2xl hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ORIGINAL.svg';
            }}
          />
        </div>

        {/* Title & Description */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ECO-MZ <span className="text-[#00B956]">360</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium px-2 leading-relaxed">
            Plataforma Inteligente de Observação, Diagnóstico, Simulação e Gestão Ambiental de Moçambique
          </p>
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#07364A]/80 backdrop-blur-md border border-[#0a4861] text-xs sm:text-sm text-slate-200 shadow-xs">
          <Leaf className="w-4 h-4 text-[#00B956]" />
          <span className="font-semibold">
            Um ambiente mais seguro, para um futuro sustentável.
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress & Navigation */}
      <div className="relative z-10 w-full max-w-sm pb-8 space-y-4">
        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-[#04202e] rounded-full overflow-hidden border border-[#07364A] p-0.5">
            <div
              className="h-full bg-[#00A651] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <span>A carregar módulos territoriais...</span>
            <span className="text-[#00B956] font-bold">{Math.min(progress, 100)}%</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#00A651] hover:bg-[#00B956] active:bg-[#008f45] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
        >
          <span>Aceder ao ECO-MZ 360</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

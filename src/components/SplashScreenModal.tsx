import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface SplashScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onContinue?: () => void;
}

export const SplashScreenModal: React.FC<SplashScreenModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onContinue
}) => {
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setLoadProgress(0);
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#062B3D] rounded-3xl shadow-2xl border border-[#07364A] overflow-hidden text-white p-8 text-center flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-[#07364A] rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcome Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BEM-VINDO AO ECO-MZ 360</span>
        </div>

        {/* System Logo - Prominently sized */}
        <div className="mb-6 flex items-center justify-center mx-auto">
          <img
            src="/assets/img/imagens/logo/ECOMZ-LOGO_ORIGINAL.png"
            alt="Logotipo Oficial ECO-MZ 360"
            className="w-64 sm:w-80 md:w-96 max-w-full h-auto max-h-60 object-contain mx-auto drop-shadow-xl hover:scale-102 transition-transform"
            onError={(e) => {
              e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO-09.png';
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
          ECO-MZ 360
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Plataforma Inteligente de Observação, Diagnóstico, Simulação e Gestão Ambiental de Moçambique
        </p>

        {/* Official Project Quote from Section 7 of text doc */}
        <div className="mt-4 p-3 bg-[#07364A]/60 rounded-2xl border border-[#0a4861] text-[11px] text-slate-300 italic leading-relaxed text-left">
          "O ECO-MZ 360 é uma plataforma web inteligente que integra dados ambientais, informação geográfica, participação cidadã, educação, voluntariado, financiamento, diagnóstico, simulação e gestão de projetos para transformar informação dispersa em conhecimento, ação e resultado ambiental."
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>A carregar os 21 módulos do sistema...</span>
            <span className="font-mono font-bold text-[#00B956]">{loadProgress}%</span>
          </div>
          <div className="w-full bg-[#04202e] h-2 rounded-full overflow-hidden border border-[#07364A]">
            <div
              className="h-full bg-[#00A651] rounded-full transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>

        {/* Team Credits */}
        <div className="mt-6 pt-4 border-t border-[#07364A] text-[11px] text-slate-400 w-full">
          <p className="font-bold text-slate-300">Líder: Noé Samuel Vilanculos</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Integrantes: Elias Félix Mufunde · Roque Armando Maurício · Joel Ali Viano
          </p>
          <p className="text-[10px] text-[#00B956] mt-1">
            Versão 1.1 • República de Moçambique • MTA / INGD Alinhado
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            if (onContinue) {
              onContinue();
            } else {
              onClose();
            }
          }}
          className="mt-6 w-full py-3 bg-[#00A651] hover:bg-[#00B956] text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center space-x-2"
        >
          <span>Aceder à Plataforma</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

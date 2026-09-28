import React from 'react';
import { EcoCertData } from '../components/EcoCertData';
import { useApp } from '../context/AppContext';
import { Award, ShieldCheck, CheckCircle2, Building, Sparkles } from 'lucide-react';

export const CertPage: React.FC = () => {
  const { occurrences } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <Award className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Certificação e Selo Verde Moçambique</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Selo Verde & Conformidade Ambiental
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Reconhecimento institucional e empresarial para entidades que adotam práticas comprovadas de gestão de resíduos, energias limpas e proteção de ecossistemas em Moçambique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-amber-400">Ouro · Prata · Bronze</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Graus de Certificação</div>
            </div>
          </div>
        </div>
      </div>

      <EcoCertData occurrences={occurrences} />
    </div>
  );
};

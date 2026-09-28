import React from 'react';
import { EcoEdu } from '../components/EcoEdu';
import { GraduationCap, BookOpen, Award, Sparkles, Users } from 'lucide-react';

export const EducationPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Educação Ambiental de Moçambique</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Educação e Conscientização Ambiental
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Transformando cada diagnóstico e ocorrência em oportunidade de aprendizagem prática para escolas, universidades e cidadãos de todo o território moçambicano.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-lg font-black text-[#00B956]">6 Trilhas</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Temáticas</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-lg font-black text-amber-400">100% Gratuito</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Certificado Oficial</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Educational Module */}
      <EcoEdu />
    </div>
  );
};

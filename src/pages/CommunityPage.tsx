import React from 'react';
import { EcoCommunity } from '../components/EcoCommunity';
import { MessageSquare, Users, HeartHandshake, Shield } from 'lucide-react';

export const CommunityPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <MessageSquare className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Diálogo Comunitário e Boas Práticas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Fórum Socioambiental & Rede Comunitária
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Espaço estruturado para cidadãos, líderes comunitários de machambas, pescadores e técnicos debaterem soluções práticas, partilharem avisos de terreno e responderem a dúvidas ambientais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-[#00B956]">11 Províncias</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Comunidades Ativas</div>
            </div>
          </div>
        </div>
      </div>

      <EcoCommunity />
    </div>
  );
};

import React from 'react';
import { EcoFund } from '../components/EcoFund';
import { useApp } from '../context/AppContext';
import { DollarSign, ShieldCheck, TrendingUp, Heart } from 'lucide-react';

export const FundPage: React.FC = () => {
  const { projects } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <DollarSign className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Apoio Financeiro & Prestação de Contas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Transparência e Apoio Financeiro a Projetos
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Canal auditado e transparente para instituições, parceiros bilaterais e cidadãos apoiarem projetos de reflorestamento, conservação de mangais e infraestruturas ecológicas em Moçambique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-[#00B956]">7.620.000 MZN</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Fundos Captados</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-amber-400">100% Auditado</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">AQUA & Parceiros</div>
            </div>
          </div>
        </div>
      </div>

      <EcoFund projects={projects} />
    </div>
  );
};

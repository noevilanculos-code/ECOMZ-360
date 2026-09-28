import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EcoPulse } from '../components/EcoPulse';
import { useApp } from '../context/AppContext';
import { Activity, Radio, ArrowLeft } from 'lucide-react';

export const PulsePage: React.FC = () => {
  const navigate = useNavigate();
  const { occurrences } = useApp();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#07364A] border border-[#0a4861] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Activity className="w-6 h-6 text-[#00B956]" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-[11px] font-bold mb-1">
                <Radio className="w-3 h-3 text-[#00B956] animate-pulse" />
                <span>Transmissão em Tempo Real</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Feed Vivo & Monitorização Ambiental
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Feed dinâmico de telemetria ambiental, eventos instantâneos, deteções de satélite e intervenções comunitárias em Moçambique.
              </p>
            </div>
          </div>
        </div>
      </div>

      <EcoPulse
        occurrences={occurrences}
        onSelectOccurrence={(occ) => navigate(`/ocorrencias/${occ.id}`)}
      />
    </div>
  );
};

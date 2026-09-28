import React from 'react';
import { EcoMobileSimulator } from '../components/EcoMobileSimulator';
import { useApp } from '../context/AppContext';
import { Smartphone, WifiOff, MapPin, Camera, RefreshCw } from 'lucide-react';

export const MobileModePage: React.FC = () => {
  const { addOccurrence } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <Smartphone className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Modo Sem Conexão para Zonas Rurais</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Simulador Móvel & Modo Sem Conexão
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Desenvolvido especialmente para zonas rurais e florestais de Moçambique com conectividade instável. Permite registar coordenadas GPS e fotografias em fila local, sincronizando automaticamente assim que houver rede.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-amber-400">Offline-First</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">IndexedDB / LocalStorage</div>
            </div>
          </div>
        </div>
      </div>

      <EcoMobileSimulator onAddOccurrence={addOccurrence} />
    </div>
  );
};

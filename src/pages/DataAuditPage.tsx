import React from 'react';
import { EcoDataAudit } from '../components/EcoDataAudit';
import { useApp } from '../context/AppContext';
import { Database, ShieldCheck, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const DataAuditPage: React.FC = () => {
  const { occurrences, addOccurrence } = useApp();

  const handleAddBatch = (batch: any[]) => {
    batch.forEach((item) => addOccurrence(item));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <Database className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Histórico de Alterações e Auditoria</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Trilha de Auditoria & Importação em Lote
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Registo imutável de todas as alterações feitas no sistema, detetor automatizado de denúncias duplicadas e importador de séries históricas (CSV/Excel) para aceleração operacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
              <div className="text-xl font-black text-[#00B956]">Audit Trail</div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Histórico Rastreável</div>
            </div>
          </div>
        </div>
      </div>

      <EcoDataAudit occurrences={occurrences} onAddBatchOccurrences={handleAddBatch} />
    </div>
  );
};

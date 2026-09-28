import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  UserCheck,
  Trees,
  Flame,
  Droplets,
  Trash2,
  Filter,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Occurrence, EnvironmentalCategory } from '../types';

interface EcoPulseProps {
  occurrences: Occurrence[];
  onSelectOccurrence: (occ: Occurrence) => void;
}

export const EcoPulse: React.FC<EcoPulseProps> = ({ occurrences, onSelectOccurrence }) => {
  const [filterType, setFilterType] = useState<'todos' | 'em_intervencao' | 'resolvidos' | 'criticos'>('todos');

  const filtered = occurrences.filter((occ) => {
    if (filterType === 'em_intervencao') return occ.status === 'Em Intervenção';
    if (filterType === 'resolvidos') return occ.status === 'Resolvido';
    if (filterType === 'criticos') return occ.severity === 'Crítico';
    return true;
  });

  const resolvedCount = occurrences.filter((o) => o.status === 'Resolvido').length;
  const inActionCount = occurrences.filter((o) => o.status === 'Em Intervenção').length;
  const validatedCount = occurrences.filter((o) => o.status === 'Validado').length;

  return (
    <div className="space-y-6">
      {/* Live Pulse Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-base font-bold text-slate-900">ECO-PULSE • Fluxo em Tempo Real</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitorização contínua das ocorrências ambientais, respostas distritais e validações em Moçambique.
            </p>
          </div>

          {/* Real-time counters */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
              <span className="block text-[10px] text-emerald-600 font-semibold">Resolvidas</span>
              <strong className="text-sm">{resolvedCount}</strong>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
              <span className="block text-[10px] text-blue-600 font-semibold">Em Intervenção</span>
              <strong className="text-sm">{inActionCount}</strong>
            </div>
            <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
              <span className="block text-[10px] text-amber-600 font-semibold">Validadas</span>
              <strong className="text-sm">{validatedCount}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 pt-3 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar pulso:</span>
          </span>
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1 rounded-md font-semibold ${
              filterType === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos os Eventos ({occurrences.length})
          </button>
          <button
            onClick={() => setFilterType('criticos')}
            className={`px-3 py-1 rounded-md font-semibold ${
              filterType === 'criticos' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Casos Críticos
          </button>
          <button
            onClick={() => setFilterType('em_intervencao')}
            className={`px-3 py-1 rounded-md font-semibold ${
              filterType === 'em_intervencao' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Equipas em Campo
          </button>
          <button
            onClick={() => setFilterType('resolvidos')}
            className={`px-3 py-1 rounded-md font-semibold ${
              filterType === 'resolvidos' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Impacto Resolvido
          </button>
        </div>
      </div>

      {/* Pulse Timeline Feed */}
      <div className="space-y-3">
        {filtered.map((occ) => (
          <div
            key={occ.id}
            onClick={() => onSelectOccurrence(occ)}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                {occ.category.includes('Mangais') || occ.category.includes('Desmatamento') ? (
                  <Trees className="w-5 h-5 text-emerald-600" />
                ) : occ.category.includes('Queimadas') ? (
                  <Flame className="w-5 h-5 text-orange-600" />
                ) : occ.category.includes('Hídrica') ? (
                  <Droplets className="w-5 h-5 text-blue-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{occ.protocol}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      occ.severity === 'Crítico'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : occ.severity === 'Alto'
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {occ.severity}
                  </span>
                  <span className="text-slate-400 text-[10px]">•</span>
                  <span className="text-slate-500 text-[11px] font-medium">{occ.category}</span>
                </div>

                <h3 className="text-xs font-bold text-slate-800">{occ.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{occ.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{occ.district}, {occ.province}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{occ.timestamp}</span>
                  </span>
                  {occ.assignedTeam && (
                    <span className="flex items-center space-x-1 text-blue-600 font-medium">
                      <UserCheck className="w-3 h-3" />
                      <span>{occ.assignedTeam}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:self-center shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  occ.status === 'Resolvido'
                    ? 'bg-emerald-100 text-emerald-800'
                    : occ.status === 'Em Intervenção'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {occ.status}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

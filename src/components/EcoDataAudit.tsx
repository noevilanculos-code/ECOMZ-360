import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Layers,
  Sparkles
} from 'lucide-react';
import { Occurrence } from '../types';

interface EcoDataAuditProps {
  occurrences: Occurrence[];
  onAddBatchOccurrences?: (batch: Occurrence[]) => void;
}

export const EcoDataAudit: React.FC<EcoDataAuditProps> = ({
  occurrences,
  onAddBatchOccurrences
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'auditoria' | 'importacao' | 'duplicados'>('auditoria');
  const [searchFilter, setSearchFilter] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [duplicateScanResults, setDuplicateScanResults] = useState<
    Array<{ id1: string; id2: string; title: string; similarity: number; reason: string }>
  >([]);
  const [isScanning, setIsScanning] = useState(false);

  // Audit trail records based on real events
  const auditLogs = [
    {
      id: 'aud-1',
      recordId: 'occ-1',
      recordType: 'Ocorrência',
      user: 'Elias Félix Mufunde (Gestor)',
      action: 'Atualização de Estado',
      oldValue: 'Em Validação',
      newValue: 'Validado',
      timestamp: '2026-09-22 14:12:05',
      ip: '197.249.12.8'
    },
    {
      id: 'aud-2',
      recordId: 'proj-1',
      recordType: 'Projeto',
      user: 'Noé Samuel Vilanculos (Admin)',
      action: 'Aprovação de Orçamento',
      oldValue: '4.200.000 MZN',
      newValue: '5.000.000 MZN',
      timestamp: '2026-09-22 11:30:19',
      ip: '197.249.10.42'
    },
    {
      id: 'aud-3',
      recordId: 'occ-2',
      recordType: 'Ocorrência',
      user: 'Roque Armando Maurício (Técnico)',
      action: 'Atribuição de Brigada de Terreno',
      oldValue: 'Pendente',
      newValue: 'Brigada AQUA Centro #2',
      timestamp: '2026-09-22 09:45:00',
      ip: '197.249.15.11'
    },
    {
      id: 'aud-4',
      recordId: 'cert-88',
      recordType: 'Certificação',
      user: 'Noé Samuel Vilanculos (Admin)',
      action: 'Emissão de Selo Verde (ECO-CERT)',
      oldValue: 'Em Análise',
      newValue: 'Selo Ouro Aprovado',
      timestamp: '2026-09-21 16:22:40',
      ip: '197.249.10.42'
    }
  ];

  const handleRunDuplicateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Simulate intelligent duplicate & incoherency scan
      setDuplicateScanResults([
        {
          id1: 'occ-1',
          id2: 'occ-sim-9',
          title: 'Corte Clandestino de Mangal na Praia Nova',
          similarity: 94,
          reason: 'Mesma localização GPS (raio < 50m) e descrição textual com 94% de concordância'
        }
      ]);
      setIsScanning(false);
    }, 1000);
  };

  const handleSimulateCSVImport = () => {
    setImportStatus('reading');
    setTimeout(() => {
      setImportStatus('success');
      setTimeout(() => setImportStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Demonstração • Qualidade dos Registos</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Simulação de Auditoria e Verificação de Denúncias
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe as validações feitas pela equipa técnica e evite denúncias repetidas da mesma ocorrência.
          </p>
        </div>

        {/* SubTab switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'auditoria'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico de Ações
          </button>
          <button
            onClick={() => setActiveSubTab('duplicados')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'duplicados'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Denúncias Semelhantes
          </button>
        </div>
      </div>

      {/* Subtab 1: Audit Trail */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Registo Oficial de Intervenções e Validações</span>
              </h3>
              <p className="text-xs text-slate-500">
                Histórico transparente de todas as atualizações realizadas por técnicos e gestores.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar por responsável ou ação..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                title="Pesquisar histórico"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data & Hora</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Ação Realizada</th>
                  <th className="p-3">Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3 text-[11px] text-slate-600">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900">{log.user}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-bold">
                        {log.recordType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-emerald-800">{log.action}</td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      <span className="line-through text-slate-400">{log.oldValue}</span> →{' '}
                      <span className="font-bold text-slate-800">{log.newValue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Batch CSV Import */}
      {activeSubTab === 'importacao' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Importação em Lote de Séries Históricas (CSV / Excel)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Carga rápida de registos de ocorrências, reflorestamentos e dados meteorológicos recolhidos por parceiros (MTA, AQUA, ONGs).
            </p>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center space-y-3">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <p className="font-bold text-xs text-slate-800">
                Arraste o seu ficheiro CSV / XLSX aqui ou clique para selecionar
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Formatos aceites: .csv, .xlsx (colunas: protocolo, titulo, categoria, provincia, distrito, lat, lng)
              </p>
            </div>

            <button
              onClick={handleSimulateCSVImport}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Simular Carga de 150 Registos do Arquivo Histórico</span>
            </button>
          </div>

          {importStatus === 'reading' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>A analisar integridade de colunas, formatação de coordenadas e UTF-8...</span>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                150 registos históricos importados e validados com sucesso no ECO-DATA! 0 erros detetados.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Duplicate Detection */}
      {activeSubTab === 'duplicados' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Algoritmo de Deteção de Registos Duplicados ou Incoerentes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compara proximidade geográfica (buffer &lt; 100m), carimbo temporal (&lt; 24h) e similaridade textual de denúncias cidadãs.
              </p>
            </div>

            <button
              onClick={handleRunDuplicateScan}
              disabled={isScanning}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'A analisar registos...' : 'Executar Varredura'}</span>
            </button>
          </div>

          {duplicateScanResults.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-xs text-slate-800">
                Nenhum conflito detetado na base ativa
              </p>
              <p className="text-[11px] text-slate-500">
                Clique em "Executar Varredura" para processar as 243 ocorrências com o motor analítico.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Possíveis Registos Duplicados Encontrados:
              </span>
              {duplicateScanResults.map((dup, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dup.title}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                      {dup.similarity}% Similaridade
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{dup.reason}</p>
                  <div className="flex items-center space-x-2 pt-2 border-t border-amber-200/60">
                    <button className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px]">
                      Fundir Ocorrências (Merge)
                    </button>
                    <button className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold text-[11px]">
                      Manter como Ocorrências Distintas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

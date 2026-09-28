import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Building,
  ShieldCheck,
  TrendingUp,
  X,
  Layers,
  ArrowRight,
  Eye,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MozambiqueProvince } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import {
  calculateMonthlyReportMetrics,
  generateMonthlyImpactPdf,
  MonthlyReportConfig
} from '../utils/generateMonthlyReportPdf';

const MONTHS = [
  { value: 1, name: 'Janeiro' },
  { value: 2, name: 'Fevereiro' },
  { value: 3, name: 'Março' },
  { value: 4, name: 'Abril' },
  { value: 5, name: 'Maio' },
  { value: 6, name: 'Junho' },
  { value: 7, name: 'Julho' },
  { value: 8, name: 'Agosto' },
  { value: 9, name: 'Setembro' },
  { value: 10, name: 'Outubro' },
  { value: 11, name: 'Novembro' },
  { value: 12, name: 'Dezembro' }
];

const YEARS = [2026, 2025, 2024];

interface MonthlyImpactReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (title: string) => void;
}

export const MonthlyImpactReportModal: React.FC<MonthlyImpactReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated
}) => {
  const { occurrences, projects, addReport } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(9); // Setembro
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedProvince, setSelectedProvince] = useState<MozambiqueProvince | 'Todas'>('Todas');
  const [preparedBy, setPreparedBy] = useState<string>('Direcção Nacional do Ambiente / ECO-MZ');
  const [includeCompleted, setIncludeCompleted] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const monthObj = MONTHS.find((m) => m.value === selectedMonth) || MONTHS[8];

  const reportConfig: MonthlyReportConfig = useMemo(
    () => ({
      month: selectedMonth,
      monthName: monthObj.name,
      year: selectedYear,
      province: selectedProvince,
      preparedBy,
      includeCompletedProjects: includeCompleted
    }),
    [selectedMonth, monthObj, selectedYear, selectedProvince, preparedBy, includeCompleted]
  );

  // Live metrics preview
  const { filteredOccurrences, filteredProjects, metrics } = useMemo(() => {
    return calculateMonthlyReportMetrics(occurrences, projects, reportConfig);
  }, [occurrences, projects, reportConfig]);

  if (!isOpen) return null;

  const handleGeneratePdf = () => {
    setIsGenerating(true);

    try {
      // Execute jsPDF generation
      const { doc, filename } = generateMonthlyImpactPdf(occurrences, projects, reportConfig);

      // Trigger browser download via jsPDF
      doc.save(filename);

      // Also register into AppContext reports so it shows in the table
      const reportTitle = `Resumo Mensal de Impacto Ambiental (${monthObj.name} ${selectedYear})`;
      if (addReport) {
        addReport({
          title: reportTitle,
          category: 'Gerais',
          type: 'Impacto Mensal',
          date: new Date().toLocaleDateString('pt-PT'),
          time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          status: 'Concluído',
          format: 'PDF',
          description: `Documento oficial consolidado em PDF gerado via jsPDF com ${metrics.totalOccurrences} ocorrências e ${metrics.totalProjects} projetos de impacto na província: ${selectedProvince}.`
        });
      }

      setSuccessToast(`PDF gerado e transferido com sucesso: ${filename}!`);
      if (onReportCreated) onReportCreated(reportTitle);

      setTimeout(() => {
        setSuccessToast(null);
        setIsGenerating(false);
      }, 3000);
    } catch (err) {
      console.error('Error generating PDF with jsPDF:', err);
      setIsGenerating(false);
      setSuccessToast('Ocorreu um erro ao gerar o PDF. Verifique o console.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#062B3D] text-white p-6 sm:p-7 relative border-b border-[#07364A]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Gerador Oficial jsPDF · ECO-MZ 360</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Resumo Mensal de Impacto Ambiental
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
            Configure o período e o território para sintetizar automaticamente as ocorrências registadas e o progresso dos projetos de conservação em documento PDF oficial com tabelas estruturadas.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Success Banner */}
          {successToast && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Configuration Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Month Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mês de Referência:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ano:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Territory / Province */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Território / Província:
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Todas">Todas as Províncias (Nacional)</option>
                {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prepared By and Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Responsável / Entidade Emissora:
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="Ex: Gabinete de Gestão Ambiental"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="includeCompleted"
                checked={includeCompleted}
                onChange={(e) => setIncludeCompleted(e.target.checked)}
                className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="includeCompleted" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                Incluir projetos já concluídos no período
              </label>
            </div>
          </div>

          {/* Real-Time Live Metrics Preview before generating */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prévia dos Dados que Serão Compilados no PDF:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {monthObj.name} {selectedYear} · {selectedProvince}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">Ocorrências</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {metrics.totalOccurrences}
                </div>
                <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                  {metrics.criticalOccurrences} Críticas
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">Taxa Resolução</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">
                  {metrics.resolutionRatePct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {metrics.resolvedOccurrences} concluídas
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">Projetos Ativos</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {metrics.activeProjects}
                </div>
                <div className="text-[10px] text-sky-600 font-bold mt-0.5">
                  {metrics.avgProjectProgress}% progresso
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">Fundo Mobilizado</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {(metrics.totalBudgetMZN / 1000000).toFixed(1)}M
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Meticais (MZN)</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>
                Tipologia mais recorrente: <strong className="text-slate-800 dark:text-slate-200">{metrics.topCategory}</strong>
              </span>
              <span>
                Província com maior demanda: <strong className="text-slate-800 dark:text-slate-200">{metrics.mostAffectedProvince}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Formato: PDF 1.4 A4 · Biblioteca jsPDF & autoTable</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/30 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>{isGenerating ? 'A compilar jsPDF...' : 'Gerar Resumo Mensal (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

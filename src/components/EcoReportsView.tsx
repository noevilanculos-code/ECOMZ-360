import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Printer,
  Share2,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthlyImpactReportModal } from './MonthlyImpactReportModal';
import { generateMonthlyImpactPdf } from '../utils/generateMonthlyReportPdf';
import { AccessRestrictedView } from './AccessRestrictedView';

export const EcoReportsView: React.FC = () => {
  const { occurrences, projects, activeRole } = useApp();
  const [activeTab, setActiveTab] = useState<'gerais' | 'ocorrencias' | 'projetos' | 'simulacoes'>('gerais');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user is a Citizen, restrict direct report generation and show role restriction view
  if (activeRole === 'cidadao') {
    return (
      <AccessRestrictedView
        featureName="Geração de Relatórios Oficiais & Boletins"
        requiredRoles={['tecnico', 'admin']}
        description="A emissão de relatórios consolidados em PDF e acesso ao histórico detalhado de auditoria ambiental é restrito a Inspectores Ambientais e Administradores."
      />
    );
  }

  const reportsList = [
    {
      id: 'rep-monthly',
      title: 'Resumo Mensal de Impacto Ambiental',
      date: 'Setembro 2026',
      category: 'gerais',
      size: '1.8 MB',
      format: 'PDF',
      description: 'Síntese oficial com tabelas detalhadas das ocorrências apuradas e progresso dos projetos de conservação.'
    },
    {
      id: 'rep-1',
      title: 'Relatório Ambiental 2024',
      date: '12/05/2025',
      category: 'gerais',
      size: '4.2 MB',
      format: 'PDF',
      description: 'Balanço consolidado anual do estado do ambiente e conservação da biodiversidade em Moçambique.'
    },
    {
      id: 'rep-2',
      title: 'Ocorrências por Região',
      date: '10/05/2025',
      category: 'ocorrencias',
      size: '2.8 MB',
      format: 'PDF',
      description: 'Mapeamento espacial das denúncias validadas, focos de desmatamento e queimadas sazonais.'
    },
    {
      id: 'rep-3',
      title: 'Projetos em Execução',
      date: '08/05/2025',
      category: 'projetos',
      size: '3.1 MB',
      format: 'PDF',
      description: 'Relatório físico-financeiro dos programas de reflorestamento, conservação de mangais e bacias.'
    },
    {
      id: 'rep-4',
      title: 'Indicadores Ambientais',
      date: '05/05/2025',
      category: 'simulacoes',
      size: '1.9 MB',
      format: 'PDF',
      description: 'Painel comparativo da qualidade do ar, índice hídrico e cobertura florestal por província.'
    },
    {
      id: 'rep-5',
      title: 'Resumo Anual de Atividades Ambientais',
      date: '01/05/2025',
      category: 'gerais',
      size: '1.5 MB',
      format: 'Excel',
      description: 'Registo completo de atividades verificadas, intervenções concluídas e evolução anual.'
    },
    {
      id: 'rep-6',
      title: 'Impacto das Brigadas no Terreno',
      date: '28/04/2025',
      category: 'projetos',
      size: '3.7 MB',
      format: 'PDF',
      description: 'Registo fotográfico e resultados das intervenções em Manica, Sofala e Zambézia.'
    }
  ];

  const filtered = reportsList.filter((r) => activeTab === 'gerais' || r.category === activeTab);

  const handleDownload = (title: string) => {
    try {
      const { doc, filename } = generateMonthlyImpactPdf(occurrences, projects, {
        month: 9,
        monthName: 'Setembro',
        year: 2026,
        province: 'Todas',
        preparedBy: 'Gabinete Técnico Ambiental ECO-MZ 360'
      });
      doc.save(filename);
      setDownloadSuccess(`Transferência concluída com sucesso via jsPDF: ${filename}`);
    } catch (e) {
      setDownloadSuccess(`Transferência iniciada: ${title}`);
    }
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Relatórios Oficiais
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Documentos Públicos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consulta e transferência de documentos ambientais prontos para leitura, impressão e partilha comunitária.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#00B956] hover:bg-[#009c48] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <FileCheck className="w-4 h-4 text-emerald-100" />
            <span>Gerar Resumo Mensal (jsPDF)</span>
          </button>

          <button
            onClick={() => handleDownload('Resumo Mensal de Impacto Ambiental')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Baixar Rápido (PDF)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Tabs matching Tela 8: Gerais, Ocorrências, Projetos, Simulações */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'gerais', label: 'Gerais' },
          { id: 'ocorrencias', label: 'Ocorrências' },
          { id: 'projetos', label: 'Projetos' },
          { id: 'simulacoes', label: 'Simulações' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {rep.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{rep.date}</span>
                      <span>•</span>
                      <span>{rep.size}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-600 font-bold">{rep.format}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {rep.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Oficial MTA / INGD
              </span>
              <button
                onClick={() => handleDownload(rep.title)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Impact Report Modal (jsPDF) */}
      <MonthlyImpactReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportCreated={(title) => {
          setDownloadSuccess(`Relatório criado e adicionado à lista: ${title}`);
          setTimeout(() => setDownloadSuccess(null), 4000);
        }}
      />
    </div>
  );
};

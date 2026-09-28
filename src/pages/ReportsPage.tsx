import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Leaf,
  Map,
  PlusCircle,
  HelpCircle,
  Calendar,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InteractiveLeafletMap } from '../components/InteractiveLeafletMap';
import { ConversationalReportWizard } from '../components/ConversationalReportWizard';
import { MonthlyImpactReportModal } from '../components/MonthlyImpactReportModal';
import { generateMonthlyImpactPdf } from '../utils/generateMonthlyReportPdf';
import { AccessRestrictedView } from '../components/AccessRestrictedView';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, occurrences, projects, activeRole } = useApp();

  // Role Access Control: Only Environmental Inspector (tecnico) and Administrator (admin, gestor)
  if (activeRole === 'cidadao') {
    return (
      <AccessRestrictedView
        featureName="Relatórios Oficiais & Boletins Ambientais"
        requiredRoles={['tecnico', 'admin']}
        description="O acesso à emissão, compilação de relatórios técnicos em PDF (jsPDF) e boletins institucionais está reservado a Inspectores Ambientais (AQUA) e Administradores."
        fallbackAction={() => navigate('/dashboard')}
      />
    );
  }

  const [activeCategory, setActiveCategory] = useState<'Gerais' | 'Ocorrências' | 'Projetos' | 'Simulações'>('Gerais');
  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Todos');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [showSpatialMap, setShowSpatialMap] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);

  const filteredReports = reports.filter((rep) => {
    const matchCategory = activeCategory === 'Gerais' ? true : rep.category === activeCategory;
    const matchSearch = rep.title.toLowerCase().includes(search.toLowerCase()) || rep.description.toLowerCase().includes(search.toLowerCase());
    const matchFormat =
      selectedFormat === 'Todos' ||
      rep.format === selectedFormat ||
      (selectedFormat === 'Excel' && rep.format === 'CSV');
    return matchCategory && matchSearch && matchFormat;
  });

  const handleDownload = (repTitle: string, format: string) => {
    const friendlyFormat = format === 'CSV' ? 'Excel / Tabela' : format;
    setDownloadToast(`A preparar ${repTitle} (${friendlyFormat})...`);

    if (format === 'PDF' || repTitle.toLowerCase().includes('resumo') || repTitle.toLowerCase().includes('impacto')) {
      try {
        const { doc, filename } = generateMonthlyImpactPdf(occurrences, projects, {
          month: 9,
          monthName: 'Setembro',
          year: 2026,
          province: 'Todas',
          preparedBy: 'Gabinete Técnico Ambiental ECO-MZ 360'
        });
        doc.save(filename);
      } catch (err) {
        console.error('Error generating PDF:', err);
      }
    }

    setTimeout(() => {
      setDownloadToast(`Transferência concluída: ${repTitle}`);
      setTimeout(() => setDownloadToast(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) with Conversational Call-to-Action */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#07364A] border border-[#0a4861] flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileText className="w-6 h-6 text-[#00B956]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Documentos & Histórico Oficial
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Relatórios Ambientais
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Consulte documentos oficiais do Ministério da Terra e Ambiente ou use o nosso assistente amigável para criar um relatório personalizado da sua província em minutos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowMonthlyModal(true)}
              className="px-4 py-2.5 bg-[#00B956] hover:bg-[#009c48] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-100" />
              <span>Gerar Resumo Mensal (jsPDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWizard(!showWizard)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-2xl border border-white/10 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{showWizard ? 'Ver Lista de Documentos' : 'Assistente Passo a Passo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {downloadToast && (
        <div className="p-4 rounded-2xl bg-[#00A651] text-white font-bold text-xs flex items-center space-x-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Conversational Report Wizard (When active) */}
      {showWizard && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ConversationalReportWizard
            onClose={() => setShowWizard(false)}
            onReportCreated={() => {
              setDownloadToast('Novo relatório oficial gerado e adicionado à lista com sucesso!');
              setTimeout(() => setDownloadToast(null), 4000);
            }}
          />
        </div>
      )}

      {/* Friendly Guide Callout Card (When wizard is hidden) */}
      {!showWizard && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-blue-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Precisa de um documento com os dados da sua região?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                O nosso assistente faz 4 perguntas simples em português claro e monta um documento oficial em PDF pronto para reuniões ou partilha comunitária.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="self-start sm:self-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Iniciar Assistente →
          </button>
        </div>
      )}

      {/* Category Tabs below banner */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {(['Gerais', 'Ocorrências', 'Projetos', 'Simulações'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
              activeCategory === cat
                ? 'bg-[#00A651] text-white shadow-emerald-700/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar relatórios pelo nome ou descrição..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Buscar relatórios"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="Todos">Todos os formatos</option>
            <option value="PDF">Documento PDF</option>
            <option value="Excel">Folha de Cálculo / Excel</option>
          </select>

          <select className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            <option>Todos os períodos</option>
            <option>Últimos 30 dias</option>
            <option>Ano 2026</option>
            <option>Ano 2025</option>
          </select>

          <select className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            <option>Todos os estados</option>
            <option>Concluído</option>
            <option>Em processamento</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedFormat('Todos');
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Geospatial Environmental Incident Reports Leaflet Map */}
      {activeCategory === 'Ocorrências' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Mapeamento Geográfico de Ocorrências</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    {occurrences.length} Ocorrências no Sistema
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualização geográfica com marcadores coloridos por gravidade em todo o território nacional.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowSpatialMap(!showSpatialMap)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {showSpatialMap ? 'Ocultar Mapa' : 'Expandir Mapa'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ocorrencias?mapa=true')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Abrir Ecrã Completo →
              </button>
            </div>
          </div>

          {showSpatialMap && (
            <InteractiveLeafletMap
              occurrences={occurrences}
              height="450px"
              onSelectOccurrence={(occ) => navigate(`/ocorrencias/${occ.id}`)}
              showLayerControls={true}
              showBottomRibbon={true}
            />
          )}
        </div>
      )}

      {/* Main Content Layout: Left Table (8 cols) + Right Widgets (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Table of Reports */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="p-4 pl-6">Documento</th>
                  <th className="p-4">Assunto</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] flex items-center justify-center shrink-0 mt-0.5">
                          {rep.format === 'Excel' || rep.format === 'CSV' ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#00A651]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {rep.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {rep.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        {rep.type}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 font-medium">
                      {rep.date} {rep.time}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{rep.status}</span>
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleDownload(rep.title, rep.format)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                          title="Descarregar documento"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descarregar</span>
                        </button>
                        <button
                          onClick={() => setDownloadToast(`Documento: ${rep.title} • Formato: ${rep.format === 'CSV' ? 'Excel' : rep.format} • ${rep.downloadsCount} descargas`)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 pl-6 pr-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>A mostrar {filteredReports.length} documentos disponíveis</span>
            <div className="flex items-center space-x-1">
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-[#00A651] text-white font-bold text-xs">
                1
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Resumo, Exportações Recentes & Motivational Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Resumo de Relatórios */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Resumo Geral
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total de documentos</span>
                <span className="font-bold text-slate-900 dark:text-white">{reports.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transferências este mês</span>
                <span className="font-bold text-emerald-600">48</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Regiões abrangidas</span>
                <span className="font-bold text-slate-900 dark:text-white">11 Províncias</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Autenticidade oficial</span>
                <span className="font-bold text-emerald-600">100% Verificado</span>
              </div>
            </div>
          </div>

          {/* Card 2: Documentos Frequentes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Mais Solicitados
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">Oficiais</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Relatório Ambiental Nacional', format: 'PDF' },
                { title: 'Ocorrências por Região', format: 'Excel' },
                { title: 'Ações de Reflorestamento', format: 'PDF' },
                { title: 'Indicadores Ecológicos de Moçambique', format: 'Excel' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDownload(item.title, item.format)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {item.format}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Destaque Resumo Mensal jsPDF */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5" /> Destaque Mensal
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">jsPDF</span>
            </div>

            <h4 className="text-base font-black leading-snug">
              Resumo Mensal de Impacto Ambiental
            </h4>
            <p className="text-xs text-emerald-50 leading-relaxed">
              Consolidação automática dos dados de ocorrências validadas e do avanço físico dos projetos ecológicos em formato A4 oficial.
            </p>

            <button
              onClick={() => setShowMonthlyModal(true)}
              className="w-full mt-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Personalizar & Baixar PDF</span>
            </button>
          </div>

          {/* Card 3: Institutional Card */}
          <div className="relative rounded-3xl overflow-hidden p-6 text-white bg-[#062B3D] shadow-xs border border-[#07364A]">
            <div className="relative z-10 space-y-3">
              <img
                src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                alt="ECO-MZ 360"
                className="w-8 h-8 object-contain"
              />
              <h4 className="text-sm font-bold text-white">
                Informação Transparente para Todos
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todos os dados e documentos emitidos pelo ECO-MZ 360 são de acesso público e comunitário para apoiar a preservação ambiental de Moçambique.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Impact Report Modal (jsPDF) */}
      <MonthlyImpactReportModal
        isOpen={showMonthlyModal}
        onClose={() => setShowMonthlyModal(false)}
        onReportCreated={(title) => {
          setDownloadToast(`Relatório adicionado: ${title}`);
          setTimeout(() => setDownloadToast(null), 4000);
        }}
      />
    </div>
  );
};

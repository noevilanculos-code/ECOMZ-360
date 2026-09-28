import React, { useState } from 'react';
import {
  TreePine,
  ShieldAlert,
  Users,
  FolderKanban,
  ArrowUpRight,
  MapPin,
  Plus,
  ArrowRight,
  Droplets,
  Wind,
  Thermometer,
  Flame,
  Trash2,
  Waves,
  Sun,
  Activity,
  FileText,
  Compass,
  Leaf,
  Layers,
  BarChart3,
  FileDown
} from 'lucide-react';
import { Occurrence, EnvironmentalProject } from '../types';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import { OccurrenceSummaryWidget } from './OccurrenceSummaryWidget';
import { ProvinceOccurrencesBarChart } from './ProvinceOccurrencesBarChart';
import { DashboardWidget } from './DashboardWidget';
import { FeaturedHighlightsSlider } from './FeaturedHighlightsSlider';
import { ReforestationEmissionsChart } from './ReforestationEmissionsChart';
import { MonthlyCategoryTrendChart } from './MonthlyCategoryTrendChart';
import { CitizenReportTour } from './CitizenReportTour';
import { exportToPDF } from '../utils/pdfExport';
import { generateMonthlyImpactPdf } from '../utils/generateMonthlyReportPdf';
import { useApp } from '../context/AppContext';
import { Lock } from 'lucide-react';

interface EcoMainDashboardProps {
  occurrences: Occurrence[];
  projects: EnvironmentalProject[];
  onSelectOccurrence: (occ: Occurrence) => void;
  onSelectProject: (proj: EnvironmentalProject) => void;
  onNewOccurrence: () => void;
  onNewProject: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenEcoBot: () => void;
}

export const EcoMainDashboard: React.FC<EcoMainDashboardProps> = ({
  occurrences,
  projects,
  onSelectOccurrence,
  onSelectProject,
  onNewOccurrence,
  onNewProject,
  onNavigateToTab,
  onOpenEcoBot
}) => {
  const { activeRole } = useApp();
  const [dashboardSideView, setDashboardSideView] = useState<'recharts' | 'recentes'>('recharts');

  // Recent occurrences matching reference image
  const recentOccurrences = [
    {
      id: 'occ-1',
      title: 'Poluição do rio',
      location: 'Rio Inhamana - Manica',
      date: 'Hoje, 10:24',
      status: 'Em análise',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: Droplets,
      iconColor: 'bg-blue-500 text-white',
      category: 'Poluição Hídrica'
    },
    {
      id: 'occ-2',
      title: 'Desmatamento',
      location: 'Tete',
      date: 'Hoje, 09:17',
      status: 'Validada',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: Leaf,
      iconColor: 'bg-emerald-500 text-white',
      category: 'Desmatamento'
    },
    {
      id: 'occ-3',
      title: 'Queimadas',
      location: 'Zambézia',
      date: 'Hoje, 08:45',
      status: 'Atribuída',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: Flame,
      iconColor: 'bg-rose-500 text-white',
      category: 'Queimadas'
    },
    {
      id: 'occ-4',
      title: 'Resíduos sólidos',
      location: 'Maputo',
      date: 'Hoje, 07:32',
      status: 'Resolvida',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: Trash2,
      iconColor: 'bg-teal-600 text-white',
      category: 'Resíduos Sólidos'
    },
    {
      id: 'occ-5',
      title: 'Erosão costeira',
      location: 'Inhambane',
      date: 'Ontem, 16:20',
      status: 'Em intervenção',
      statusColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      icon: Waves,
      iconColor: 'bg-blue-700 text-white',
      category: 'Erosão Costeira'
    }
  ];

  // Featured projects matching reference image
  const featuredProjects = [
    {
      id: 'proj-1',
      title: 'Reflorestamento de áreas degradadas',
      region: 'Zambézia',
      period: '01/03/2025 - 28/02/2026',
      progress: 65,
      status: 'Em execução',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80'
    },
    {
      id: 'proj-2',
      title: 'Proteção da Costa de Inhambane',
      region: 'Inhambane',
      period: '10/01/2025 - 31/12/2025',
      progress: 0,
      status: 'Planeado',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
      image: '/assets/img/eco/mangais.jpg'
    },
    {
      id: 'proj-3',
      title: 'Gestão de Resíduos Sólidos',
      region: 'Maputo',
      period: '01/06/2025 - 28/02/2026',
      progress: 100,
      status: 'Concluído',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
      image: '/assets/img/eco/residuos.jpg'
    }
  ];

  // Simulation scenarios matching reference image
  const simulationsList = [
    {
      title: 'Cenário de reflorestamento',
      region: 'Zambézia',
      date: '12/05/2025',
      status: 'Concluída',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
    },
    {
      title: 'Impacto da urbanização',
      region: 'Maputo',
      date: '05/05/2025',
      status: 'Em análise',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
    },
    {
      title: 'Gestão de resíduos',
      region: 'Nampula',
      date: '28/04/2025',
      status: 'Concluída',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
    }
  ];

  // News items matching reference image
  const latestNews = [
    {
      title: 'Moçambique reforça compromisso com a conservação ambiental',
      date: '12 de Maio de 2025',
      image: '/assets/img/eco/mangais.jpg'
    },
    {
      title: 'Lançado projeto de reflorestamento em Gaza',
      date: '10 de Maio de 2025',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80'
    },
    {
      title: 'Alerta de risco de inundações em Nampula',
      date: '08 de Maio de 2025',
      image: '/assets/img/eco/erosao.jpg'
    }
  ];

  const handleExportDashboardPDF = () => {
    try {
      const { doc, filename } = generateMonthlyImpactPdf(occurrences, projects, {
        month: 9,
        monthName: 'Setembro',
        year: 2026,
        province: 'Todas',
        preparedBy: 'Painel Central ECO-MZ 360'
      });
      doc.save(filename);
    } catch (err) {
      console.error('Error generating jsPDF monthly impact report:', err);
      // Fallback
      exportToPDF({
        title: 'Relatório Resumo Nacional — Painel Principal ECO-MZ 360',
        subtitle: 'Síntese de Ocorrências, Projetos de Conservação e Indicadores Ambientais',
        category: 'Relatório Executivo PDF',
        region: 'Moçambique (11 Províncias)',
        summary:
          'Panorama consolidado das ações de monitorização cidadã, resposta técnica no terreno e projetos de restauração ecológica em execução a nível nacional.',
        metrics: [
          { label: 'Total de Ocorrências Registadas', value: `${occurrences.length} registos` },
          { label: 'Projetos Ambientais Ativos', value: `${projects.length} projetos` },
          { label: 'Ocorrências Resolvidas / Em Intervenção', value: `${occurrences.filter((o) => o.status === 'Resolvido' || o.status === 'Em Intervenção').length} casos` },
          { label: 'Cobertura Territorial', value: '11 Províncias / 154 Distritos' }
        ],
        tableHeaders: ['Protocolo', 'Título da Ocorrência', 'Província', 'Gravidade', 'Estado'],
        tableRows: occurrences.slice(0, 12).map((o) => [
          o.protocol,
          o.title,
          `${o.district}, ${o.province}`,
          o.severity,
          o.status
        ]),
        filename: 'resumo-nacional-ecomz360.pdf'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. MASTER UPPER SECTION (Full Width: HERO + KPIS + MAP)                   */}
      {/* ========================================================================= */}
      <div className="space-y-5">
          {/* Clean Interactive 3-Step Citizen Guide Banner */}
          <CitizenReportTour variant="banner" onStartReport={onNewOccurrence} />

          {/* A. Hero Welcome Banner - Institutional Deep Blue (#062B3D, #07364A) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#062B3D] text-white p-6 sm:p-7 shadow-sm border border-[#07364A] flex flex-col justify-between min-h-[190px]">
            {/* Subtle institutional atmospheric texture */}
            <div
              className="absolute inset-0 opacity-15 mix-blend-screen bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url('/assets/img/eco/mangais.jpg')`
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center space-x-4 sm:space-x-5">
                {/* Prominent official emblem with bold sizing */}
                <div className="relative shrink-0">
                  <img
                    src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                    alt="ECO-MZ 360"
                    className="w-18 h-18 sm:w-22 sm:h-22 lg:w-24 lg:h-24 object-contain shrink-0 drop-shadow-xl hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">
                      Observatório Nacional • Moçambique
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mt-0.5">
                    ECO-MZ <span className="text-[#00B956]">360</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl font-medium leading-relaxed">
                    Plataforma Inteligente de Observação, Diagnóstico, Simulação e Gestão Ambiental de Moçambique
                  </p>
                </div>
              </div>

              {/* Floating slogan pill */}
              <div className="shrink-0 bg-[#07364A]/90 border border-[#0a4861] rounded-xl py-2 px-3.5 text-white flex items-center space-x-2.5 shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-[#00A651] flex items-center justify-center text-white shrink-0">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-[#00B956]">Cuidar do ambiente</span>
                  <p className="text-slate-300">é investir no nosso futuro.</p>
                </div>
              </div>
            </div>

            {/* Slogan bullet tags and primary actions */}
            <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#07364A] mt-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <span>Mais dados</span>
                <span>•</span>
                <span>Melhores decisões</span>
                <span>•</span>
                <span className="text-[#00B956]">Um ambiente mais seguro</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('mapa')}
                  className="px-4 py-2 bg-[#00A651] hover:bg-[#00B956] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Explorar Mapa</span>
                </button>
                <button
                  onClick={onNewOccurrence}
                  className="px-3.5 py-2 bg-[#00A651] hover:bg-[#009c48] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registar Ocorrência</span>
                </button>
                {activeRole !== 'cidadao' ? (
                  <button
                    onClick={handleExportDashboardPDF}
                    className="px-3.5 py-2 bg-[#07364A] hover:bg-[#094761] text-emerald-300 border border-[#0a4861] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Descarregar Resumo Executivo em PDF (jsPDF)"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Exportar PDF Oficial</span>
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 text-[11px] font-medium border border-white/10">
                    <span>Visão Pública de Cidadão</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* B. 4 KPI Indicator Cards (Exact metrics from reference) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Ocorrências */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#00A651] flex items-center justify-center text-white shadow-xs shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Ocorrências
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                    243
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 12%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">este mês</span>
              </div>
            </div>

            {/* KPI 2: Projetos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-xs shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Projetos
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                    18
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 5%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">este mês</span>
              </div>
            </div>

            {/* KPI 3: Alertas Ativos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#f59e0b] flex items-center justify-center text-white shadow-xs shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Alertas Ativos
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                    7
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 2%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">este mês</span>
              </div>
            </div>

            {/* KPI 4: Cidadãos Participantes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center text-white shadow-xs shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Cidadãos Participantes
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                    1.246
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 18%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">este mês</span>
              </div>
            </div>
          </div>

          {/* Environmental Metrics Real-Time Dashboard Widget with Google Search Grounding */}
          <DashboardWidget
            defaultProvince="Maputo Cidade"
            onSelectProvince={() => {}}
          />

          {/* Destaques Estratégicos & Ações em Slide Interativo */}
          <FeaturedHighlightsSlider
            projects={projects}
            onNavigateToTab={onNavigateToTab}
            onSelectProject={onSelectProject}
          />

          {/* C. Mapa Ambiental & Ocorrências Recentes (Grid 7 / 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Mapa Ambiental Card (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Mapa Ambiental
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateToTab('mapa')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  <span>Ver mapa completo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Map Canvas with Floating Legend on Bottom Right */}
              <div className="relative flex-1 min-h-[380px] bg-slate-950 overflow-hidden flex flex-col">
                <InteractiveLeafletMap
                  occurrences={occurrences}
                  onSelectOccurrence={onSelectOccurrence}
                  height="100%"
                  className="flex-1 w-full h-full min-h-[380px]"
                  showLayerControls={true}
                  showBottomRibbon={false}
                  initialZoom={5.5}
                />

                {/* Floating Map Legend (matching reference image) */}
                <div className="absolute bottom-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md text-[11px] font-semibold space-y-1.5 pointer-events-auto">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Ocorrências</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Projetos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Áreas protegidas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Alertas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ocorrências Recentes & Resumo Recharts Card (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header with Switcher Tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDashboardSideView('recharts')}
                      className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                        dashboardSideView === 'recharts'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Resumo Geral</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardSideView('recentes')}
                      className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                        dashboardSideView === 'recentes'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Recentes</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToTab('ocorrencias')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                  >
                    <span>Ver todas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Content based on selected tab */}
                {dashboardSideView === 'recharts' ? (
                  <OccurrenceSummaryWidget
                    occurrences={occurrences}
                    onSelectCategory={() => onNavigateToTab('mapa')}
                    onSelectSeverity={() => onNavigateToTab('mapa')}
                    className="border-0 p-0 shadow-none"
                  />
                ) : (
                  /* List of 5 Occurrences */
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-1">
                    {recentOccurrences.map((occ) => {
                      const Icon = occ.icon;
                      return (
                        <div
                          key={occ.id}
                          onClick={() => {
                            const real = occurrences.find((o) => o.category === occ.category) || occurrences[0];
                            if (real) onSelectOccurrence(real);
                          }}
                          className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${occ.iconColor} shadow-2xs`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                {occ.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {occ.location}
                              </p>
                              <span className="text-[10px] text-slate-400 block">
                                {occ.date}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${occ.statusColor}`}>
                            {occ.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={onNewOccurrence}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registar Ocorrência</span>
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROVINCIAL ENVIRONMENTAL OCCURRENCES SECTION (RECHARTS BAR CHART)      */}
      {/* ========================================================================= */}
      <ProvinceOccurrencesBarChart
        occurrences={occurrences}
        onSelectProvince={(prov) => {
          // Find occurrence in that province and focus
          if (prov !== 'Todas') {
            const occ = occurrences.find((o) => o.province === prov);
            if (occ) onSelectOccurrence(occ);
          }
        }}
        onNavigateToMap={(prov) => {
          onNavigateToTab('mapa');
        }}
      />

      {/* ========================================================================= */}
      {/* 2B. ANNUAL REFORESTATION & EMISSIONS REDUCTION (RECHARTS COMPOSED CHART) */}
      {/* ========================================================================= */}
      <ReforestationEmissionsChart
        onNavigateToProjects={() => onNavigateToTab('projetos')}
        onNavigateToReports={() => onNavigateToTab('relatorios')}
      />

      {/* ========================================================================= */}
      {/* 2C. MONTHLY CATEGORY TRENDS (RECHARTS TEMPORAL EVOLUTION CHART)           */}
      {/* ========================================================================= */}
      <MonthlyCategoryTrendChart occurrences={occurrences} />

      {/* ========================================================================= */}
      {/* 3. BOTTOM 3-COLUMN GRID (Projetos, Cenários, Últimas Notícias)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
        {/* Coluna 1: Projetos em Destaque */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-1.5">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Projetos em Destaque
                </h4>
              </div>
              <button
                onClick={() => onNavigateToTab('projetos')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {featuredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigateToTab('projetos')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5 cursor-pointer hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {p.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${p.statusColor}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.region} | {p.period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Progresso</span>
                    <span className="font-bold font-mono text-blue-600">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Cenários & Previsões */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Cenários & Previsões
                </h4>
              </div>
              <button
                onClick={() => onNavigateToTab('simulacoes')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {simulationsList.map((sim, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToTab('simulacoes')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center space-x-2.5 cursor-pointer hover:border-emerald-200 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sim.iconBg}`}>
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {sim.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${sim.statusColor}`}>
                        {sim.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {sim.region} | {sim.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 3: Últimas Notícias */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Últimas Notícias
                </h4>
              </div>
              <button
                onClick={() => onNavigateToTab('noticias')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {latestNews.map((news, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToTab('noticias')}
                  className="flex items-center space-x-2.5 text-xs group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-[11px] text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {news.title}
                    </h5>
                    <span className="text-[9px] text-slate-400">{news.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

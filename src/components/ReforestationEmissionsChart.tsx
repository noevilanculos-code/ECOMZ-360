import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TreePine,
  CloudRain,
  TrendingDown,
  TrendingUp,
  BarChart2,
  Layers,
  Filter,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Globe2,
  Table as TableIcon,
  FileDown
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

export interface AnnualClimateData {
  year: number;
  reforestedHectares: number; // in Hectares (ha)
  targetHectares: number;
  emissionsReducedMt: number; // in Million Metric Tons of CO2 equivalent (Mt CO2e)
  targetEmissionsMt: number;
  seedlingsPlantedThousands: number; // thousands of native seedlings
  survivalRatePercent: number; // %
  // Ecosystem breakdown in Hectares
  mangrovesHa: number;
  miomboHa: number;
  mountainForestHa: number;
  aridSavannaHa: number;
  // Emissions balance
  grossEmissionsMt: number;
  carbonSinkMt: number;
  netEmissionsMt: number;
  keyInitiatives: string[];
}

export const MOZAMBIQUE_ANNUAL_DATA: AnnualClimateData[] = [
  {
    year: 2019,
    reforestedHectares: 8400,
    targetHectares: 8000,
    emissionsReducedMt: 1.45,
    targetEmissionsMt: 1.20,
    seedlingsPlantedThousands: 620,
    survivalRatePercent: 74,
    mangrovesHa: 1800,
    miomboHa: 4600,
    mountainForestHa: 1200,
    aridSavannaHa: 800,
    grossEmissionsMt: 38.4,
    carbonSinkMt: 6.2,
    netEmissionsMt: 32.2,
    keyInitiatives: ['Início do Programa Nacional de Florestas Comunitárias', 'Mapeamento inicial de mangais de Sofala']
  },
  {
    year: 2020,
    reforestedHectares: 11800,
    targetHectares: 11000,
    emissionsReducedMt: 2.15,
    targetEmissionsMt: 1.90,
    seedlingsPlantedThousands: 940,
    survivalRatePercent: 76,
    mangrovesHa: 2600,
    miomboHa: 6100,
    mountainForestHa: 1800,
    aridSavannaHa: 1300,
    grossEmissionsMt: 37.1,
    carbonSinkMt: 7.4,
    netEmissionsMt: 29.7,
    keyInitiatives: ['Brigadas de recuperação pós-Ciclone Idai', 'Viveiros comunitários no Dondo e Nhamatanda']
  },
  {
    year: 2021,
    reforestedHectares: 16200,
    targetHectares: 15000,
    emissionsReducedMt: 3.10,
    targetEmissionsMt: 2.80,
    seedlingsPlantedThousands: 1380,
    survivalRatePercent: 79,
    mangrovesHa: 3900,
    miomboHa: 8200,
    mountainForestHa: 2400,
    aridSavannaHa: 1700,
    grossEmissionsMt: 35.8,
    carbonSinkMt: 8.9,
    netEmissionsMt: 26.9,
    keyInitiatives: ['Adesão formal à iniciativa AFR100', 'Muralha Verde comunitária no vale do Limpopo']
  },
  {
    year: 2022,
    reforestedHectares: 21500,
    targetHectares: 20000,
    emissionsReducedMt: 4.45,
    targetEmissionsMt: 4.00,
    seedlingsPlantedThousands: 1950,
    survivalRatePercent: 81,
    mangrovesHa: 5300,
    miomboHa: 10600,
    mountainForestHa: 3200,
    aridSavannaHa: 2400,
    grossEmissionsMt: 34.2,
    carbonSinkMt: 10.8,
    netEmissionsMt: 23.4,
    keyInitiatives: ['Corredor ecológico da Gorongosa', 'Restauração do Delta do Zambeze com apoio do MTA']
  },
  {
    year: 2023,
    reforestedHectares: 28900,
    targetHectares: 27000,
    emissionsReducedMt: 6.20,
    targetEmissionsMt: 5.80,
    seedlingsPlantedThousands: 2640,
    survivalRatePercent: 83,
    mangrovesHa: 7400,
    miomboHa: 13800,
    mountainForestHa: 4500,
    aridSavannaHa: 3200,
    grossEmissionsMt: 32.5,
    carbonSinkMt: 13.1,
    netEmissionsMt: 19.4,
    keyInitiatives: ['Consolidação do Selo Verde Empresarial', 'Sistema Integrado de Alerta Precoce de Queimadas']
  },
  {
    year: 2024,
    reforestedHectares: 37400,
    targetHectares: 35000,
    emissionsReducedMt: 8.35,
    targetEmissionsMt: 7.90,
    seedlingsPlantedThousands: 3520,
    survivalRatePercent: 85,
    mangrovesHa: 9800,
    miomboHa: 17600,
    mountainForestHa: 5800,
    aridSavannaHa: 4200,
    grossEmissionsMt: 30.7,
    carbonSinkMt: 15.9,
    netEmissionsMt: 14.8,
    keyInitiatives: ['Pacto de Reflorestamento de Niassa e Zambézia', 'Monitoramento com sensores de satélite AQUA']
  },
  {
    year: 2025,
    reforestedHectares: 47200,
    targetHectares: 45000,
    emissionsReducedMt: 10.80,
    targetEmissionsMt: 10.20,
    seedlingsPlantedThousands: 4600,
    survivalRatePercent: 86,
    mangrovesHa: 12600,
    miomboHa: 21900,
    mountainForestHa: 7300,
    aridSavannaHa: 5400,
    grossEmissionsMt: 28.6,
    carbonSinkMt: 19.2,
    netEmissionsMt: 9.4,
    keyInitiatives: ['Plataforma ECO-MZ 360 em produção', 'Rede de fiscalização comunitária com telemetria']
  },
  {
    year: 2026,
    reforestedHectares: 58500,
    targetHectares: 55000,
    emissionsReducedMt: 13.60,
    targetEmissionsMt: 12.80,
    seedlingsPlantedThousands: 5850,
    survivalRatePercent: 88,
    mangrovesHa: 16100,
    miomboHa: 26700,
    mountainForestHa: 9100,
    aridSavannaHa: 6600,
    grossEmissionsMt: 26.1,
    carbonSinkMt: 22.8,
    netEmissionsMt: 3.3,
    keyInitiatives: ['Meta NDC 2026 superada em 6.3%', 'Maior recuperação contínua de mangal da África Oriental']
  }
];

type ChartViewMode = 'integrated' | 'ecosystems' | 'emissions_balance';
type RegionScope = 'national' | 'north' | 'center' | 'south';

const regionLabel: Record<RegionScope, string> = {
  national: 'Âmbito Nacional (Todo Moçambique)',
  north: 'Região Norte (Cabo Delgado, Niassa, Nampula)',
  center: 'Região Centro (Zambézia, Sofala, Manica, Tete)',
  south: 'Região Sul (Inhambane, Gaza, Maputo)'
};

interface ReforestationEmissionsChartProps {
  className?: string;
  onNavigateToProjects?: () => void;
  onNavigateToReports?: () => void;
}

export const ReforestationEmissionsChart: React.FC<ReforestationEmissionsChartProps> = ({
  className = '',
  onNavigateToProjects,
  onNavigateToReports
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('integrated');
  const [regionScope, setRegionScope] = useState<RegionScope>('national');
  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(2026);

  // Region multiplier to simulate provincial splits when filtered
  const regionMultiplier = useMemo(() => {
    switch (regionScope) {
      case 'north':
        return 0.38; // Niassa, Cabo Delgado, Nampula
      case 'center':
        return 0.44; // Zambézia, Sofala, Manica, Tete
      case 'south':
        return 0.18; // Inhambane, Gaza, Maputo
      default:
        return 1.0;
    }
  }, [regionScope]);

  // Prepared data adjusted by region filter
  const chartData = useMemo(() => {
    return MOZAMBIQUE_ANNUAL_DATA.map((d) => ({
      year: d.year,
      reforestedHectares: Math.round(d.reforestedHectares * regionMultiplier),
      targetHectares: Math.round(d.targetHectares * regionMultiplier),
      emissionsReducedMt: Number((d.emissionsReducedMt * regionMultiplier).toFixed(2)),
      targetEmissionsMt: Number((d.targetEmissionsMt * regionMultiplier).toFixed(2)),
      seedlingsPlantedThousands: Math.round(d.seedlingsPlantedThousands * regionMultiplier),
      survivalRatePercent: d.survivalRatePercent,
      mangrovesHa: Math.round(d.mangrovesHa * regionMultiplier),
      miomboHa: Math.round(d.miomboHa * regionMultiplier),
      mountainForestHa: Math.round(d.mountainForestHa * regionMultiplier),
      aridSavannaHa: Math.round(d.aridSavannaHa * regionMultiplier),
      grossEmissionsMt: Number((d.grossEmissionsMt * regionMultiplier).toFixed(2)),
      carbonSinkMt: Number((d.carbonSinkMt * regionMultiplier).toFixed(2)),
      netEmissionsMt: Number((d.netEmissionsMt * regionMultiplier).toFixed(2)),
      keyInitiatives: d.keyInitiatives
    }));
  }, [regionMultiplier]);

  // Cumulative totals and current year highlights
  const summary = useMemo(() => {
    const totalReforested = chartData.reduce((acc, curr) => acc + curr.reforestedHectares, 0);
    const totalEmissionsReduced = chartData.reduce((acc, curr) => acc + curr.emissionsReducedMt, 0);
    const latestYear = chartData[chartData.length - 1];
    const prevYear = chartData[chartData.length - 2];
    const annualGrowthHectares = ((latestYear.reforestedHectares - prevYear.reforestedHectares) / prevYear.reforestedHectares) * 100;
    const annualGrowthEmissions = ((latestYear.emissionsReducedMt - prevYear.emissionsReducedMt) / prevYear.emissionsReducedMt) * 100;

    return {
      totalReforested,
      totalEmissionsReduced: Number(totalEmissionsReduced.toFixed(1)),
      latestHectares: latestYear.reforestedHectares,
      latestEmissions: latestYear.emissionsReducedMt,
      survivalRate: latestYear.survivalRatePercent,
      annualGrowthHectares: Number(annualGrowthHectares.toFixed(1)),
      annualGrowthEmissions: Number(annualGrowthEmissions.toFixed(1))
    };
  }, [chartData]);

  // Selected year detail
  const activeYearDetail = useMemo(() => {
    return chartData.find((d) => d.year === selectedYear) || chartData[chartData.length - 1];
  }, [chartData, selectedYear]);

  // PDF Export handler
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Relatorio Anual de Reflorestamento e Reducao de Emissoes (2019-2026)',
      subtitle: `Escopo Territorial: ${regionLabel[regionScope]}`,
      category: 'Clima & Restauracao Florestal',
      region: regionLabel[regionScope],
      summary: `Balanco plurianual das areas florestais recuperadas (${summary.totalReforested.toLocaleString('pt-PT')} ha) e emissoes evitadas (${summary.totalEmissionsReduced} Mt CO2e) em Mocambique.`,
      metrics: [
        { label: 'Area Total Restaurada', value: `${summary.totalReforested.toLocaleString('pt-PT')} ha` },
        { label: 'Emissoes Evitadas (CO2e)', value: `${summary.totalEmissionsReduced} Mt CO2e` },
        { label: 'Taxa de Sobrevivencia', value: `${summary.survivalRate}%` },
        { label: 'Crescimento Anual', value: `+${summary.annualGrowthHectares}% a.a.` }
      ],
      tableHeaders: ['Ano', 'Area Restaurada (ha)', 'Meta (ha)', 'Emissoes Evitadas (Mt)', 'Taxa Sobrevivencia'],
      tableRows: chartData.map((r) => [
        String(r.year),
        `${r.reforestedHectares.toLocaleString('pt-PT')} ha`,
        `${r.targetHectares.toLocaleString('pt-PT')} ha`,
        `${r.emissionsReducedMt} Mt CO2e`,
        `${r.survivalRatePercent}%`
      ]),
      filename: `reflorestamento-emissoes-${regionScope}.pdf`
    });
  };

  return (
    <div
      className={`w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all ${className}`}
    >
      {/* 1. Top Institutional Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <TreePine className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Impacto Positivo • Clima & Restauração Florestal
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Progresso Anual de Reflorestamento e Redução de Emissões
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Acompanhe o crescimento das áreas florestais recuperadas pelas comunidades e o impacto direto na qualidade ambiental de Moçambique (2019–2026).
          </p>
        </div>

        {/* Global Controls & Scope */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region filter */}
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              type="button"
              onClick={() => setRegionScope('national')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                regionScope === 'national'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Nacional
            </button>
            <button
              type="button"
              onClick={() => setRegionScope('north')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                regionScope === 'north'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Norte
            </button>
            <button
              type="button"
              onClick={() => setRegionScope('center')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                regionScope === 'center'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Centro
            </button>
            <button
              type="button"
              onClick={() => setRegionScope('south')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                regionScope === 'south'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Sul
            </button>
          </div>

          {/* Toggle Table view */}
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              showTable
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Alternar entre Gráfico e Tabela de Dados"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showTable ? 'Ver Gráficos' : 'Ver Tabela'}</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Exportar Relatório de Reflorestamento em PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Área Total Restaurada</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{summary.annualGrowthHectares}% a.a.
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalReforested.toLocaleString('pt-PT')}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">hectares</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Meta 2026: {summary.latestHectares.toLocaleString('pt-PT')} ha no ano corrente
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Emissões Evitadas (CO₂e)</span>
            <span className="flex items-center text-blue-600 dark:text-blue-400 font-bold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />-{summary.annualGrowthEmissions}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {summary.totalEmissionsReduced}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Mt CO₂eq</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Acumulado absorvido por biomassa e conservação
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Taxa de Sobrevivência</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Auditoria de Campo
            </span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {summary.survivalRate}%
            </span>
            <span className="text-xs font-medium text-slate-400">vigor médio</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Espécies nativas (Mangais, Miombo e Mafurras)
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Compromisso NDC 2030</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              78.4%
            </span>
            <span className="text-xs font-medium text-slate-400">atingido</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Classificação: Desempenho Excepcional pelo MTA
          </p>
        </div>
      </div>

      {/* 3. View Mode Switcher Tabs */}
      <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('integrated')}
            className={`py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'integrated'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visão Integrada (Área & Emissões)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ecosystems')}
            className={`py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'ecosystems'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Por Ecossistema / Bioma</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('emissions_balance')}
            className={`py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'emissions_balance'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span>Balanço Líquido de Carbono</span>
          </button>
        </div>

        {/* Legend / Tip */}
        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Clique nas barras ou pontos para inspecionar os detalhes anuais</span>
        </div>
      </div>

      {/* 4. Chart Stage or Data Table */}
      <div className="p-4 sm:p-6 flex-1 min-h-[380px]">
        {showTable ? (
          /* Tabular Data View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
                  <th className="py-2.5 px-3">Ano</th>
                  <th className="py-2.5 px-3">Área Restaurada (ha)</th>
                  <th className="py-2.5 px-3">Meta Anual (ha)</th>
                  <th className="py-2.5 px-3">Desvio Meta</th>
                  <th className="py-2.5 px-3">Emissões Evitadas (Mt CO₂e)</th>
                  <th className="py-2.5 px-3">Mudas (Milhares)</th>
                  <th className="py-2.5 px-3">Sobrevivência</th>
                  <th className="py-2.5 px-3">Iniciativas Chave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chartData.map((row) => {
                  const diff = row.reforestedHectares - row.targetHectares;
                  const isPositive = diff >= 0;
                  return (
                    <tr
                      key={row.year}
                      onClick={() => setSelectedYear(row.year)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        selectedYear === row.year ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {row.year}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {row.reforestedHectares.toLocaleString('pt-PT')} ha
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {row.targetHectares.toLocaleString('pt-PT')} ha
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}
                        >
                          {isPositive ? `+${diff.toLocaleString('pt-PT')}` : diff.toLocaleString('pt-PT')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                        {row.emissionsReducedMt} Mt
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {row.seedlingsPlantedThousands.toLocaleString('pt-PT')} mil
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {row.survivalRatePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
                        {row.keyInitiatives[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Interactive Recharts Canvas */
          <div className="w-full h-[360px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'integrated' ? (
                /* 1. ComposedChart: Reforested Area (Bar) + Emissions Reduction (Line) */
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const yr = e.activePayload[0].payload.year;
                      setSelectedYear(yr);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorReforest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A651" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" opacity={0.6} />

                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />

                  {/* Left Y Axis: Hectares */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k ha`}
                    tick={{ fontSize: 11, fill: '#059669' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  {/* Right Y Axis: Emissions Mt CO2e */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `${val} Mt`}
                    tick={{ fontSize: 11, fill: '#2563eb' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    content={<CustomIntegratedTooltip />}
                    cursor={{ fill: 'rgba(0, 166, 81, 0.06)' }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => {
                      const mapLabels: Record<string, string> = {
                        reforestedHectares: 'Área Restaurada (ha)',
                        targetHectares: 'Meta Anual NDC (ha)',
                        emissionsReducedMt: 'Redução de Emissões (Mt CO₂e)'
                      };
                      return (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {mapLabels[value] || value}
                        </span>
                      );
                    }}
                  />

                  {/* Bars: Hectares Reflorestados */}
                  <Bar
                    yAxisId="left"
                    dataKey="reforestedHectares"
                    name="reforestedHectares"
                    fill="url(#colorReforest)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.year}`}
                        fill={entry.year === selectedYear ? '#00A651' : 'url(#colorReforest)'}
                        stroke={entry.year === selectedYear ? '#062B3D' : 'none'}
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>

                  {/* Bar: Meta NDC */}
                  <Bar
                    yAxisId="left"
                    dataKey="targetHectares"
                    name="targetHectares"
                    fill="url(#colorTarget)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />

                  {/* Line: Emissions Reduction (Mt CO2e) */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="emissionsReducedMt"
                    name="emissionsReducedMt"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
                  />

                  {/* Paris Agreement Milestone Line */}
                  <ReferenceLine
                    yAxisId="right"
                    y={10.0}
                    label={{
                      value: 'Marco NDC Moçambique (10 Mt)',
                      position: 'top',
                      fill: '#3b82f6',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                  />
                </ComposedChart>
              ) : viewMode === 'ecosystems' ? (
                /* 2. Stacked BarChart: Ecosystem/Biome breakdown */
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      setSelectedYear(e.activePayload[0].payload.year);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" opacity={0.6} />

                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k ha`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomEcosystemTooltip />} />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        mangrovesHa: 'Mangais Costeiros',
                        miomboHa: 'Matas de Miombo',
                        mountainForestHa: 'Florestas de Montanha',
                        aridSavannaHa: 'Savanas e Áridas do Sul'
                      };
                      return (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {labels[value] || value}
                        </span>
                      );
                    }}
                  />

                  <Bar dataKey="mangrovesHa" name="mangrovesHa" stackId="a" fill="#0d9488" />
                  <Bar dataKey="miomboHa" name="miomboHa" stackId="a" fill="#00A651" />
                  <Bar dataKey="mountainForestHa" name="mountainForestHa" stackId="a" fill="#2563eb" />
                  <Bar dataKey="aridSavannaHa" name="aridSavannaHa" stackId="a" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                /* 3. AreaChart: Net Emissions Balance */
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      setSelectedYear(e.activePayload[0].payload.year);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorSink" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" opacity={0.6} />

                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={(val) => `${val} Mt`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomBalanceTooltip />} />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        grossEmissionsMt: 'Emissões Brutas de GEE',
                        carbonSinkMt: 'Captação Florestal (Sumidouro)',
                        netEmissionsMt: 'Emissões Líquidas Nacionais'
                      };
                      return (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {labels[value] || value}
                        </span>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="grossEmissionsMt"
                    name="grossEmissionsMt"
                    stroke="#ef4444"
                    fill="url(#colorGross)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="carbonSinkMt"
                    name="carbonSinkMt"
                    stroke="#10b981"
                    fill="url(#colorSink)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="netEmissionsMt"
                    name="netEmissionsMt"
                    stroke="#1e3a8a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#1e3a8a' }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. Interactive Year Deep-Dive Card (Highlights for Selected Year) */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            {activeYearDetail.year}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Destaque Anual de {activeYearDetail.year} em Moçambique:
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                {activeYearDetail.reforestedHectares.toLocaleString('pt-PT')} ha restaurados
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {activeYearDetail.keyInitiatives.map((init, idx) => (
                <li key={idx} className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{init}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Link to Project Management */}
        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToProjects && (
            <button
              type="button"
              onClick={onNavigateToProjects}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <TreePine className="w-3.5 h-3.5" />
              <span>Ver Projetos Vinculados</span>
            </button>
          )}

          {onNavigateToReports && (
            <button
              type="button"
              onClick={onNavigateToReports}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Relatório Completo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// CUSTOM TOOLTIP COMPONENTS FOR RECHARTS
// =========================================================================

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: AnnualClimateData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const CustomIntegratedTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const isTargetAchieved = data.reforestedHectares >= data.targetHectares;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md max-w-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-bold text-sm text-emerald-400">Ano {data.year}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isTargetAchieved ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
          }`}
        >
          {isTargetAchieved ? 'Meta Atingida' : 'Em Andamento'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-slate-300">
          <span>Área Restaurada:</span>
          <span className="font-black text-white">{data.reforestedHectares.toLocaleString('pt-PT')} ha</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Meta Oficial NDC:</span>
          <span>{data.targetHectares.toLocaleString('pt-PT')} ha</span>
        </div>
        <div className="flex items-center justify-between text-blue-300 pt-1 border-t border-slate-800/80">
          <span>Redução de Emissões:</span>
          <span className="font-black text-blue-400">{data.emissionsReducedMt} Mt CO₂eq</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Mudas Plantadas:</span>
          <span>{data.seedlingsPlantedThousands.toLocaleString('pt-PT')} mil</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Sobrevivência:</span>
          <span>{data.survivalRatePercent}%</span>
        </div>
      </div>

      {data.keyInitiatives && data.keyInitiatives[0] && (
        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300">
          <span className="text-slate-400 font-semibold block">Iniciativa Destacada:</span>
          <span className="italic">{data.keyInitiatives[0]}</span>
        </div>
      )}
    </div>
  );
};

const CustomEcosystemTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const total = data.mangrovesHa + data.miomboHa + data.mountainForestHa + data.aridSavannaHa;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md max-w-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-bold text-sm text-emerald-400">Ecossistemas {data.year}</span>
        <span className="text-[10px] text-slate-400 font-mono">Total: {total.toLocaleString('pt-PT')} ha</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Mangais Costeiros:
          </span>
          <span className="font-bold">{data.mangrovesHa.toLocaleString('pt-PT')} ha</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-[#00A651]" />
            Matas de Miombo:
          </span>
          <span className="font-bold">{data.miomboHa.toLocaleString('pt-PT')} ha</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Florestas de Montanha:
          </span>
          <span className="font-bold">{data.mountainForestHa.toLocaleString('pt-PT')} ha</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Savanas e Áridas do Sul:
          </span>
          <span className="font-bold">{data.aridSavannaHa.toLocaleString('pt-PT')} ha</span>
        </div>
      </div>
    </div>
  );
};

const CustomBalanceTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md max-w-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-bold text-sm text-blue-400">Balanço de Carbono {data.year}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-rose-300">
          <span>Emissões Brutas:</span>
          <span className="font-bold">{data.grossEmissionsMt} Mt CO₂e</span>
        </div>
        <div className="flex items-center justify-between text-emerald-300">
          <span>Sumidouros Florestais:</span>
          <span className="font-bold">-{data.carbonSinkMt} Mt CO₂e</span>
        </div>
        <div className="flex items-center justify-between text-blue-300 pt-1 border-t border-slate-800 font-bold">
          <span>Emissões Líquidas:</span>
          <span className="text-white">{data.netEmissionsMt} Mt CO₂e</span>
        </div>
      </div>
    </div>
  );
};

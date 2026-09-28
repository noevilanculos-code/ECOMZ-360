import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  BarChart3,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ArrowUpDown,
  Table as TableIcon,
  Compass,
  ArrowRight,
  ShieldAlert,
  Info,
  ExternalLink,
  Flame,
  Droplets,
  Activity
} from 'lucide-react';
import { Occurrence, MozambiqueProvince, SeverityLevel } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

export interface ProvinceOccurrencesBarChartProps {
  occurrences: Occurrence[];
  selectedProvince?: MozambiqueProvince | 'Todas';
  onSelectProvince?: (province: MozambiqueProvince | 'Todas') => void;
  onNavigateToMap?: (province?: MozambiqueProvince) => void;
  className?: string;
}

export type ProvinceRegion = 'Norte' | 'Centro' | 'Sul';

export const PROVINCE_REGIONS: Record<MozambiqueProvince, ProvinceRegion> = {
  'Cabo Delgado': 'Norte',
  'Niassa': 'Norte',
  'Nampula': 'Norte',
  'Zambézia': 'Centro',
  'Tete': 'Centro',
  'Manica': 'Centro',
  'Sofala': 'Centro',
  'Inhambane': 'Sul',
  'Gaza': 'Sul',
  'Maputo Província': 'Sul',
  'Maputo Cidade': 'Sul'
};

const REGION_COLORS: Record<ProvinceRegion, { bar: string; light: string; text: string }> = {
  'Norte': { bar: '#0d9488', light: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300' },
  'Centro': { bar: '#0284c7', light: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300' },
  'Sul': { bar: '#7c3aed', light: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' }
};

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  'Crítico': '#e11d48',
  'Alto': '#ea580c',
  'Médio': '#d97706',
  'Baixo': '#10b981'
};

const STATUS_COLORS: Record<string, string> = {
  'Resolvido': '#10b981',
  'Em Intervenção': '#0284c7',
  'Validado': '#8b5cf6',
  'Em Análise': '#f59e0b'
};

export const ProvinceOccurrencesBarChart: React.FC<ProvinceOccurrencesBarChartProps> = ({
  occurrences,
  selectedProvince = 'Todas',
  onSelectProvince,
  onNavigateToMap,
  className = ''
}) => {
  const [activeRegion, setActiveRegion] = useState<ProvinceRegion | 'Todas'>('Todas');
  const [metricMode, setMetricMode] = useState<'total' | 'severity' | 'status' | 'resolutionRate'>('severity');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'critical' | 'rate'>('count');
  const [viewFormat, setViewFormat] = useState<'chart' | 'table'>('chart');
  const [hoveredProvince, setHoveredProvince] = useState<MozambiqueProvince | null>(null);
  const [activeDrilldownProvince, setActiveDrilldownProvince] = useState<MozambiqueProvince | null>(
    selectedProvince !== 'Todas' ? selectedProvince : null
  );

  // Group occurrences by province
  const aggregatedProvinces = useMemo(() => {
    const provinceList = Object.keys(MOZAMBIQUE_PROVINCES) as MozambiqueProvince[];

    const data = provinceList.map((provinceName) => {
      const provOccurrences = occurrences.filter((o) => o.province === provinceName);
      const total = provOccurrences.length;
      const critical = provOccurrences.filter((o) => o.severity === 'Crítico').length;
      const high = provOccurrences.filter((o) => o.severity === 'Alto').length;
      const medium = provOccurrences.filter((o) => o.severity === 'Médio').length;
      const low = provOccurrences.filter((o) => o.severity === 'Baixo').length;

      const resolved = provOccurrences.filter((o) => o.status === 'Resolvido').length;
      const inIntervention = provOccurrences.filter((o) => o.status === 'Em Intervenção').length;
      const validated = provOccurrences.filter((o) => o.status === 'Validado').length;
      const underReview = provOccurrences.filter(
        (o) => o.status === 'Recebido' || o.status === 'Em Validação'
      ).length;

      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      // Find dominant category in this province
      const catCount: Record<string, number> = {};
      provOccurrences.forEach((o) => {
        catCount[o.category] = (catCount[o.category] || 0) + 1;
      });
      let dominantCategory = 'Diversas';
      let maxCatCount = 0;
      Object.entries(catCount).forEach(([cat, count]) => {
        if (count > maxCatCount) {
          maxCatCount = count;
          dominantCategory = cat;
        }
      });

      const info = MOZAMBIQUE_PROVINCES[provinceName];
      const region = PROVINCE_REGIONS[provinceName];

      return {
        province: provinceName,
        shortName: provinceName.replace(' Província', '').replace(' Cidade', ' Cid.'),
        region,
        total,
        critical,
        high,
        medium,
        low,
        resolved,
        inIntervention,
        validated,
        underReview,
        resolutionRate,
        dominantCategory,
        capital: info?.capital || '',
        vulnerabilityIndex: info?.vulnerabilityIndex || 50,
        population: info?.population || '',
        occurrences: provOccurrences
      };
    });

    return data;
  }, [occurrences]);

  // Apply Region Filter
  const filteredData = useMemo(() => {
    let result = [...aggregatedProvinces];
    if (activeRegion !== 'Todas') {
      result = result.filter((d) => d.region === activeRegion);
    }

    // Apply Sorting
    result.sort((a, b) => {
      if (sortBy === 'count') return b.total - a.total;
      if (sortBy === 'name') return a.province.localeCompare(b.province);
      if (sortBy === 'critical') return b.critical - a.critical || b.high - a.high;
      if (sortBy === 'rate') return b.resolutionRate - a.resolutionRate;
      return 0;
    });

    return result;
  }, [aggregatedProvinces, activeRegion, sortBy]);

  // National Summary KPIs
  const totalNationalOccurrences = occurrences.length;
  const totalCritical = occurrences.filter((o) => o.severity === 'Crítico').length;
  const totalResolved = occurrences.filter((o) => o.status === 'Resolvido').length;
  const nationalResolutionRate = totalNationalOccurrences > 0
    ? Math.round((totalResolved / totalNationalOccurrences) * 100)
    : 0;

  const highestIncidentProvince = useMemo(() => {
    if (!aggregatedProvinces.length) return null;
    return [...aggregatedProvinces].sort((a, b) => b.total - a.total)[0];
  }, [aggregatedProvinces]);

  const handleSelectProvinceInternal = (prov: MozambiqueProvince) => {
    setActiveDrilldownProvince(prov);
    onSelectProvince?.(prov);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header & Title Section */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="uppercase tracking-wider">Panorama Provincial • Moçambique</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Ocorrências Ambientais por Província</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredData.length} províncias)
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            Acompanhe onde estão concentradas as ocorrências e a percentagem de casos já resolvidos em cada província.
          </p>
        </div>

        {/* Top Action / View Mode Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart or Table View */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewFormat('chart')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewFormat === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gráfico</span>
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewFormat === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Tabela</span>
            </button>
          </div>

          {/* Orientation Switcher (Only in Chart Mode) */}
          {viewFormat === 'chart' && (
            <button
              type="button"
              onClick={() => setOrientation((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={orientation === 'vertical' ? 'Alternar para Barras Horizontais' : 'Alternar para Barras Verticais'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {orientation === 'vertical' ? 'Barras Horizontais' : 'Barras Verticais'}
              </span>
            </button>
          )}

          {/* Link to Map View */}
          {onNavigateToMap && (
            <button
              type="button"
              onClick={() => onNavigateToMap(activeDrilldownProvince || undefined)}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ver no Mapa</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
        <div className="p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Total Ocorrências
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <strong className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalNationalOccurrences}
            </strong>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              11 Províncias
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
            100% de cobertura territorial
          </span>
        </div>

        <div className="p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Província com Maior Incidência
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <strong className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 truncate">
              {highestIncidentProvince?.province || 'N/A'}
            </strong>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {highestIncidentProvince?.total || 0} casos
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
            Ameaça: {highestIncidentProvince?.dominantCategory || 'N/A'}
          </span>
        </div>

        <div className="p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Severidade Crítica
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <strong className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {totalCritical}
            </strong>
            <span className="text-[11px] font-semibold text-rose-500">
              {totalNationalOccurrences > 0
                ? Math.round((totalCritical / totalNationalOccurrences) * 100)
                : 0}
              % do total
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
            Prioridade máxima de intervenção
          </span>
        </div>

        <div className="p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Taxa Média de Resolução
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <strong className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {nationalResolutionRate}%
            </strong>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              {totalResolved} resolvidas
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
            Ações com intervenção concluída
          </span>
        </div>
      </div>

      {/* 3. Interactive Toolbar Controls (Filters & Segmentation) */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metric Mode Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Dimensão:</span>
          </span>
          <button
            type="button"
            onClick={() => setMetricMode('severity')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metricMode === 'severity'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Por Gravidade (Empilhada)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('total')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metricMode === 'total'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Total de Ocorrências
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('status')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metricMode === 'status'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Por Estado
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('resolutionRate')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metricMode === 'resolutionRate'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Taxa de Resolução (%)
          </button>
        </div>

        {/* Region & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Região:</span>
            {(['Todas', 'Norte', 'Centro', 'Sul'] as const).map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setActiveRegion(reg)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeRegion === reg
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="count">Ordenar: Mais Ocorrências</option>
            <option value="critical">Ordenar: Maior Severidade</option>
            <option value="rate">Ordenar: Maior Resolução</option>
            <option value="name">Ordenar: Alfabética</option>
          </select>
        </div>
      </div>

      {/* 4. Chart Canvas or Data Table */}
      <div className="p-4 sm:p-6">
        {viewFormat === 'chart' ? (
          <div className="relative">
            {/* Legend summary top right */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
                {metricMode === 'severity' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#e11d48]" /> Crítico
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#ea580c]" /> Alto
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" /> Médio
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" /> Baixo
                    </span>
                  </>
                ) : metricMode === 'status' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" /> Resolvido
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7]" /> Em Intervenção
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#8b5cf6]" /> Validado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]" /> Em Análise
                    </span>
                  </>
                ) : metricMode === 'resolutionRate' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> ≥ 60%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> 30% - 59%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> &lt; 30%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-teal-600" /> Região Norte
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-sky-600" /> Região Centro
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-purple-600" /> Região Sul
                    </span>
                  </>
                )}
              </div>

              <span className="text-[10px] text-slate-400 italic">
                Clique numa barra para inspecionar os detalhes da província
              </span>
            </div>

            {/* Recharts BarChart */}
            <div className="w-full h-[360px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {orientation === 'vertical' ? (
                  <BarChart
                    data={filteredData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 40 }}
                    onClick={(e) => {
                      const activePayload = (e as any)?.activePayload;
                      if (activePayload && activePayload.length > 0) {
                        const prov = activePayload[0].payload.province as MozambiqueProvince;
                        handleSelectProvinceInternal(prov);
                      }
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="shortName"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={50}
                      tick={{
                        fill: 'currentColor',
                        fontSize: 11,
                        className: 'text-slate-600 dark:text-slate-400 font-medium'
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      unit={metricMode === 'resolutionRate' ? '%' : ''}
                      tick={{
                        fill: 'currentColor',
                        fontSize: 11,
                        className: 'text-slate-600 dark:text-slate-400 font-mono'
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 max-w-xs pointer-events-none">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1.5">
                              <div>
                                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{data.province}</span>
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  Capital: {data.capital} • Região {data.region}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                {data.total} casos
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between text-slate-300">
                                <span>Ameaça principal:</span>
                                <strong className="text-white truncate max-w-[150px]">{data.dominantCategory}</strong>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Taxa de resolução:</span>
                                <strong className="text-emerald-400">{data.resolutionRate}% ({data.resolved} resolvidos)</strong>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Casos Críticos:</span>
                                <strong className="text-rose-400">{data.critical} ocorrência(s)</strong>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Índice Vulnerabilidade:</span>
                                <span className="text-amber-300 font-mono">{data.vulnerabilityIndex}/100</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                              <span>População: {data.population}</span>
                              <span className="text-emerald-400 font-semibold">Clique para inspecionar</span>
                            </div>
                          </div>
                        );
                      }}
                    />

                    {/* Dynamic Bar Types */}
                    {metricMode === 'severity' && (
                      <>
                        <Bar
                          dataKey="critical"
                          name="Crítico"
                          stackId="a"
                          fill={SEVERITY_COLORS['Crítico']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="high"
                          name="Alto"
                          stackId="a"
                          fill={SEVERITY_COLORS['Alto']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="medium"
                          name="Médio"
                          stackId="a"
                          fill={SEVERITY_COLORS['Médio']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="low"
                          name="Baixo"
                          stackId="a"
                          fill={SEVERITY_COLORS['Baixo']}
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    )}

                    {metricMode === 'status' && (
                      <>
                        <Bar
                          dataKey="resolved"
                          name="Resolvido"
                          stackId="s"
                          fill={STATUS_COLORS['Resolvido']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="inIntervention"
                          name="Em Intervenção"
                          stackId="s"
                          fill={STATUS_COLORS['Em Intervenção']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="validated"
                          name="Validado"
                          stackId="s"
                          fill={STATUS_COLORS['Validado']}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="underReview"
                          name="Em Análise"
                          stackId="s"
                          fill={STATUS_COLORS['Em Análise']}
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    )}

                    {metricMode === 'total' && (
                      <Bar dataKey="total" name="Total Ocorrências" radius={[6, 6, 0, 0]}>
                        {filteredData.map((entry, index) => {
                          const isSelected = activeDrilldownProvince === entry.province;
                          const regionColor = REGION_COLORS[entry.region]?.bar || '#059669';
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={regionColor}
                              opacity={isSelected ? 1 : 0.85}
                              stroke={isSelected ? '#ffffff' : 'none'}
                              strokeWidth={isSelected ? 2 : 0}
                              className="cursor-pointer transition-all hover:opacity-100"
                            />
                          );
                        })}
                      </Bar>
                    )}

                    {metricMode === 'resolutionRate' && (
                      <Bar dataKey="resolutionRate" name="Taxa Resolução (%)" radius={[6, 6, 0, 0]}>
                        {filteredData.map((entry, index) => {
                          const color =
                            entry.resolutionRate >= 60
                              ? '#10b981'
                              : entry.resolutionRate >= 30
                              ? '#f59e0b'
                              : '#e11d48';
                          return (
                            <Cell
                              key={`cell-rate-${index}`}
                              fill={color}
                              className="cursor-pointer transition-all hover:opacity-100"
                            />
                          );
                        })}
                      </Bar>
                    )}
                  </BarChart>
                ) : (
                  /* Horizontal Bar Chart */
                  <BarChart
                    data={filteredData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                    onClick={(e) => {
                      const activePayload = (e as any)?.activePayload;
                      if (activePayload && activePayload.length > 0) {
                        const prov = activePayload[0].payload.province as MozambiqueProvince;
                        handleSelectProvinceInternal(prov);
                      }
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      unit={metricMode === 'resolutionRate' ? '%' : ''}
                      tick={{
                        fill: 'currentColor',
                        fontSize: 11,
                        className: 'text-slate-600 dark:text-slate-400 font-mono'
                      }}
                    />
                    <YAxis
                      dataKey="shortName"
                      type="category"
                      width={90}
                      tick={{
                        fill: 'currentColor',
                        fontSize: 11,
                        className: 'text-slate-600 dark:text-slate-400 font-semibold'
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <strong className="text-emerald-400 block">{data.province} ({data.region})</strong>
                            <p className="text-slate-300">Total: {data.total} ocorrências</p>
                            <p className="text-slate-300">Resolução: {data.resolutionRate}%</p>
                            <p className="text-slate-300">Críticos: {data.critical}</p>
                          </div>
                        );
                      }}
                    />

                    {metricMode === 'severity' && (
                      <>
                        <Bar dataKey="critical" name="Crítico" stackId="ha" fill={SEVERITY_COLORS['Crítico']} />
                        <Bar dataKey="high" name="Alto" stackId="ha" fill={SEVERITY_COLORS['Alto']} />
                        <Bar dataKey="medium" name="Médio" stackId="ha" fill={SEVERITY_COLORS['Médio']} />
                        <Bar dataKey="low" name="Baixo" stackId="ha" fill={SEVERITY_COLORS['Baixo']} radius={[0, 4, 4, 0]} />
                      </>
                    )}

                    {metricMode === 'status' && (
                      <>
                        <Bar dataKey="resolved" name="Resolvido" stackId="hs" fill={STATUS_COLORS['Resolvido']} />
                        <Bar dataKey="inIntervention" name="Em Intervenção" stackId="hs" fill={STATUS_COLORS['Em Intervenção']} />
                        <Bar dataKey="validated" name="Validado" stackId="hs" fill={STATUS_COLORS['Validado']} />
                        <Bar dataKey="underReview" name="Em Análise" stackId="hs" fill={STATUS_COLORS['Em Análise']} radius={[0, 4, 4, 0]} />
                      </>
                    )}

                    {metricMode === 'total' && (
                      <Bar dataKey="total" name="Total Ocorrências" radius={[0, 6, 6, 0]}>
                        {filteredData.map((entry, index) => (
                          <Cell
                            key={`h-cell-${index}`}
                            fill={REGION_COLORS[entry.region]?.bar || '#059669'}
                            className="cursor-pointer"
                          />
                        ))}
                      </Bar>
                    )}

                    {metricMode === 'resolutionRate' && (
                      <Bar dataKey="resolutionRate" name="Taxa Resolução (%)" radius={[0, 6, 6, 0]}>
                        {filteredData.map((entry, index) => {
                          const color =
                            entry.resolutionRate >= 60
                              ? '#10b981'
                              : entry.resolutionRate >= 30
                              ? '#f59e0b'
                              : '#e11d48';
                          return <Cell key={`h-cell-rate-${index}`} fill={color} className="cursor-pointer" />;
                        })}
                      </Bar>
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Accessibility Detailed Data Table */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Província</th>
                  <th className="py-2.5 px-3">Região</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center">Crítico</th>
                  <th className="py-2.5 px-3 text-center">Alto</th>
                  <th className="py-2.5 px-3 text-center">Médio / Baixo</th>
                  <th className="py-2.5 px-3 text-center">Resolvidas</th>
                  <th className="py-2.5 px-3 text-center">Taxa Resolução</th>
                  <th className="py-2.5 px-3">Ameaça Dominante</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400">
                {filteredData.map((row) => {
                  const isSelected = activeDrilldownProvince === row.province;
                  return (
                    <tr
                      key={row.province}
                      onClick={() => handleSelectProvinceInternal(row.province)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{row.province}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${REGION_COLORS[row.region]?.light} ${REGION_COLORS[row.region]?.text}`}>
                          {row.region}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {row.total}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-rose-600">
                        {row.critical}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-orange-600">
                        {row.high}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-amber-600">
                        {row.medium + row.low}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-emerald-600">
                        {row.resolved}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${row.resolutionRate}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {row.resolutionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 truncate max-w-[140px] text-slate-700 dark:text-slate-300">
                        {row.dominantCategory}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProvinceInternal(row.province);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Selected Province Quick Drilldown Card */}
      {activeDrilldownProvince && (
        <div className="m-4 sm:m-6 mt-0 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition-all">
          {(() => {
            const current = aggregatedProvinces.find((p) => p.province === activeDrilldownProvince);
            if (!current) return null;

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      Província Selecionada
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {current.province}
                    </h4>
                    <span className="text-xs text-slate-400">
                      • Capital: {current.capital} • Região {current.region}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>
                      Ocorrências: <strong className="text-slate-900 dark:text-white">{current.total}</strong>
                    </span>
                    <span>
                      Casos Críticos: <strong className="text-rose-600">{current.critical}</strong>
                    </span>
                    <span>
                      Taxa de Resolução: <strong className="text-emerald-600">{current.resolutionRate}%</strong>
                    </span>
                    <span>
                      Ameaça Dominante: <strong className="text-slate-800 dark:text-slate-200">{current.dominantCategory}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToMap?.(current.province)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Ver no Mapa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDrilldownProvince(null)}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ProvinceOccurrencesBarChart;

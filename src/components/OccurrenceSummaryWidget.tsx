import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  AlertTriangle,
  Flame,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Filter,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Occurrence, EnvironmentalCategory, SeverityLevel } from '../types';

interface OccurrenceSummaryWidgetProps {
  occurrences: Occurrence[];
  selectedCategory?: string;
  selectedSeverity?: string;
  onSelectCategory?: (category: string) => void;
  onSelectSeverity?: (severity: string) => void;
  className?: string;
  compact?: boolean;
}

// Official color palettes
const SEVERITY_COLORS: Record<SeverityLevel, { fill: string; border: string; bg: string; text: string }> = {
  'Crítico': {
    fill: '#e11d48',
    border: 'border-rose-500/40',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400'
  },
  'Alto': {
    fill: '#ea580c',
    border: 'border-orange-500/40',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400'
  },
  'Médio': {
    fill: '#d97706',
    border: 'border-amber-500/40',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400'
  },
  'Baixo': {
    fill: '#10b981',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400'
  }
};

const CATEGORY_COLORS: Record<string, string> = {
  'Desmatamento': '#059669',
  'Queimadas Descontroladas': '#ea580c',
  'Poluição Hídrica': '#0284c7',
  'Destruição de Mangais': '#0d9488',
  'Resíduos Sólidos Urbanos': '#d97706',
  'Erosão Costeira/Pluvial': '#7c3aed',
  'Caça Furtiva & Biodiversidade': '#e11d48',
  'Mineração Ilegal': '#475569'
};

const SHORT_CATEGORY_NAMES: Record<string, string> = {
  'Desmatamento': 'Desmate',
  'Queimadas Descontroladas': 'Queimadas',
  'Poluição Hídrica': 'Pol. Hídrica',
  'Destruição de Mangais': 'Mangais',
  'Resíduos Sólidos Urbanos': 'Resíduos',
  'Erosão Costeira/Pluvial': 'Erosão',
  'Caça Furtiva & Biodiversidade': 'Caça Furtiva',
  'Mineração Ilegal': 'Mineração'
};

export const OccurrenceSummaryWidget: React.FC<OccurrenceSummaryWidgetProps> = ({
  occurrences,
  selectedCategory = 'Todas',
  selectedSeverity = 'Todas',
  onSelectCategory,
  onSelectSeverity,
  className = '',
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'tipos' | 'gravidade'>('geral');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Aggregated data for Severity
  const severityData = useMemo(() => {
    const total = occurrences.length || 1;
    const levels: SeverityLevel[] = ['Crítico', 'Alto', 'Médio', 'Baixo'];

    return levels.map((level) => {
      const count = occurrences.filter((o) => o.severity === level).length;
      const percentage = Math.round((count / total) * 100);
      return {
        level,
        count,
        percentage,
        fill: SEVERITY_COLORS[level].fill
      };
    });
  }, [occurrences]);

  // Aggregated data for Occurrence Types / Categories
  const categoryData = useMemo(() => {
    const total = occurrences.length || 1;
    const categoryCounts: Record<string, number> = {};

    occurrences.forEach((occ) => {
      categoryCounts[occ.category] = (categoryCounts[occ.category] || 0) + 1;
    });

    const entries = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat,
      shortName: SHORT_CATEGORY_NAMES[cat] || cat,
      count,
      percentage: Math.round((count / total) * 100),
      fill: CATEGORY_COLORS[cat] || '#059669'
    }));

    // Sort descending by count
    return entries.sort((a, b) => b.count - a.count);
  }, [occurrences]);

  // Critical items count
  const criticalCount = useMemo(() => {
    return occurrences.filter((o) => o.severity === 'Crítico').length;
  }, [occurrences]);

  // High items count
  const highCount = useMemo(() => {
    return occurrences.filter((o) => o.severity === 'Alto').length;
  }, [occurrences]);

  // Custom Tooltip for Recharts
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const title = item.category || item.level;
      const count = item.count;
      const percentage = item.percentage;
      const color = item.fill;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs z-50 pointer-events-none">
          <div className="flex items-center space-x-2 font-bold mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{title}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-[11px] text-slate-300 font-mono">
            <span>Ocorrências:</span>
            <span className="font-bold text-white">{count}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-[11px] text-slate-300 font-mono">
            <span>Proporção:</span>
            <span className="font-bold text-emerald-400">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col ${className}`}
    >
      {/* Header with Title and Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                Resumo de Ocorrências
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                {occurrences.length} registos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tipos de ocorrência e níveis de urgência
            </p>
          </div>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tipos')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tipos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tipos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gravidade')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'gravidade'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gravidade
          </button>
        </div>
      </div>

      {/* KPI Severity Badges (Quick Metrics) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-3">
        {severityData.map((item) => {
          const isSelected = selectedSeverity === item.level;
          const conf = SEVERITY_COLORS[item.level as SeverityLevel];

          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onSelectSeverity && onSelectSeverity(isSelected ? 'Todas' : item.level)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${conf.bg} ${
                isSelected ? 'ring-2 ring-emerald-500 shadow-xs border-transparent' : conf.border
              } hover:scale-102`}
              title={`Filtrar por gravidade ${item.level}`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: conf.fill }} />
                <span className={`text-[10px] font-bold ${conf.text} truncate`}>{item.level}</span>
              </div>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {item.count}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-400 font-mono">
                  {item.percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area based on Active Tab */}
      <div className="flex-1 flex flex-col justify-center">
        {/* TAB 1: GERAL (Dual Recharts view) */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            {/* Top: Recharts Severity Distribution Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Distribuição por Gravidade</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {criticalCount + highCount} de alta prioridade
                </span>
              </div>

              {/* Recharts Bar Chart for Severity */}
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={severityData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="level"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                    >
                      {severityData.map((entry, index) => (
                        <Cell
                          key={`cell-sev-${index}`}
                          fill={entry.fill}
                          opacity={selectedSeverity === 'Todas' || selectedSeverity === entry.level ? 1 : 0.35}
                          className="cursor-pointer transition-opacity"
                          onClick={() => onSelectSeverity && onSelectSeverity(entry.level)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom: Recharts Horizontal Top Categories */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Principais Tipos de Agressão</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {categoryData.length} categorias ativas
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={categoryData.slice(0, 5)}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#64748b', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                    >
                      {categoryData.slice(0, 5).map((entry, index) => (
                        <Cell
                          key={`cell-cat-${index}`}
                          fill={entry.fill}
                          opacity={selectedCategory === 'Todas' || selectedCategory === entry.category ? 1 : 0.35}
                          className="cursor-pointer transition-opacity"
                          onClick={() => onSelectCategory && onSelectCategory(entry.category)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIPOS DE OCORRÊNCIA (Full Breakdown) */}
        {activeTab === 'tipos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ocorrências por Categoria
              </span>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Barras
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    chartType === 'pie' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Pizza
                </button>
              </div>
            </div>

            {chartType === 'bar' ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={categoryData}
                    margin={{ top: 5, right: 25, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={78}
                    />
                    <Tooltip content={<CustomRechartsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-full-${index}`}
                          fill={entry.fill}
                          opacity={selectedCategory === 'Todas' || selectedCategory === entry.category ? 1 : 0.35}
                          className="cursor-pointer transition-opacity"
                          onClick={() => onSelectCategory && onSelectCategory(entry.category)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-pie-${index}`}
                          fill={entry.fill}
                          opacity={selectedCategory === 'Todas' || selectedCategory === entry.category ? 1 : 0.35}
                          className="cursor-pointer transition-opacity"
                          onClick={() => onSelectCategory && onSelectCategory(entry.category)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category legend pills */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryData.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(selectedCategory === cat.category ? 'Todas' : cat.category)}
                  className={`text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1 transition-all cursor-pointer ${
                    selectedCategory === cat.category
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                  <span>{cat.shortName}</span>
                  <span className="opacity-70 font-mono">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NÍVEIS DE GRAVIDADE (Detailed Breakdown) */}
        {activeTab === 'gravidade' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Análise de Risco e Severidade
              </span>
              <span className="text-[10px] text-slate-500">
                Protocolo MICOA / INGD
              </span>
            </div>

            {/* Recharts Column BarChart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={severityData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="level"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomRechartsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-sev-detailed-${index}`}
                        fill={entry.fill}
                        opacity={selectedSeverity === 'Todas' || selectedSeverity === entry.level ? 1 : 0.35}
                        className="cursor-pointer transition-opacity"
                        onClick={() => onSelectSeverity && onSelectSeverity(entry.level)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Severity explanation breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span className="font-bold text-rose-900 dark:text-rose-200">Crítico:</span>
                  <span className="text-rose-700 dark:text-rose-300">Danos imediatos à biodiversidade ou risco de vida</span>
                </div>
                <span className="font-bold text-rose-800 dark:text-rose-200 font-mono">
                  {severityData.find((s) => s.level === 'Crítico')?.count || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
                  <span className="font-bold text-orange-900 dark:text-orange-200">Alto:</span>
                  <span className="text-orange-700 dark:text-orange-300">Desmatamento ou poluição em expansão rápida</span>
                </div>
                <span className="font-bold text-orange-800 dark:text-orange-200 font-mono">
                  {severityData.find((s) => s.level === 'Alto')?.count || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info with Active Filters and Reset */}
      {(selectedCategory !== 'Todas' || selectedSeverity !== 'Todas') && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-600" />
            <span>Filtro ativo no mapa</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Todas');
              if (onSelectSeverity) onSelectSeverity('Todas');
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

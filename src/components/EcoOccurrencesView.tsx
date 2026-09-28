import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Map,
  List,
  Flame,
  Radio,
  Layers,
  Sparkles,
  Info,
  FileDown
} from 'lucide-react';
import { Occurrence, OccurrenceStatus, MozambiqueProvince, SeverityLevel } from '../types';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { detectCriticalZones, CriticalZone } from '../lib/leafletHeatmap';
import { CitizenReportTour } from './CitizenReportTour';
import { exportToPDF } from '../utils/pdfExport';

interface EcoOccurrencesViewProps {
  occurrences: Occurrence[];
  onSelectOccurrence: (occ: Occurrence) => void;
  onNewOccurrence: () => void;
  onUpdateStatus?: (id: string, status: OccurrenceStatus) => void;
  defaultViewMode?: 'tabela' | 'mapa';
}

export const EcoOccurrencesView: React.FC<EcoOccurrencesViewProps> = ({
  occurrences,
  onSelectOccurrence,
  onNewOccurrence,
  onUpdateStatus,
  defaultViewMode = 'tabela'
}) => {
  const [viewMode, setViewMode] = useState<'tabela' | 'mapa'>(defaultViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todas');
  const [provinceFilter, setProvinceFilter] = useState<string>('Todas');
  const [severityFilter, setSeverityFilter] = useState<string>('Todas');
  const [mapRenderMode, setMapRenderMode] = useState<'marcadores' | 'calor'>('marcadores');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Severity metrics calculation for dynamic summary bar
  const severityCounts = useMemo(() => {
    return {
      total: occurrences.length,
      critico: occurrences.filter((o) => o.severity === 'Crítico').length,
      alto: occurrences.filter((o) => o.severity === 'Alto').length,
      medio: occurrences.filter((o) => o.severity === 'Médio').length,
      baixo: occurrences.filter((o) => o.severity === 'Baixo').length
    };
  }, [occurrences]);

  // Filtered occurrences
  const filtered = useMemo(() => {
    return occurrences.filter((occ) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        occ.title.toLowerCase().includes(q) ||
        occ.district.toLowerCase().includes(q) ||
        occ.province.toLowerCase().includes(q) ||
        occ.id.toLowerCase().includes(q) ||
        occ.protocol.toLowerCase().includes(q) ||
        occ.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'Todas' || occ.status === statusFilter;
      const matchesProvince = provinceFilter === 'Todas' || occ.province === provinceFilter;
      const matchesSeverity = severityFilter === 'Todas' || occ.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesProvince && matchesSeverity;
    });
  }, [occurrences, searchTerm, statusFilter, provinceFilter, severityFilter]);

  // Detected Critical Zones for Authorities
  const detectedCriticalZones = useMemo(() => {
    return detectCriticalZones(filtered);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: OccurrenceStatus) => {
    switch (status) {
      case 'Recebido':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
      case 'Em Validação':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60';
      case 'Validado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'Em Intervenção':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60';
      case 'Resolvido':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Crítico':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      case 'Alto':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800';
      case 'Médio':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      case 'Baixo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportOccurrencesPDF = () => {
    exportToPDF({
      title: 'Relatorio Oficial de Ocorrencias Ambientais — ECO-MZ 360',
      subtitle: `Filtro: Provincia (${provinceFilter}) | Gravidade (${severityFilter}) | Estado (${statusFilter})`,
      category: 'Ocorrencias Ambientais',
      region: provinceFilter === 'Todas' ? 'Mocambique (11 Provincias)' : provinceFilter,
      summary: `Listagem consolidada de ${filtered.length} ocorrencias ambientais registadas e monitorizadas na plataforma ECO-MZ 360.`,
      metrics: [
        { label: 'Total Filtrado', value: `${filtered.length} ocorrencias` },
        { label: 'Nivel Critico', value: `${filtered.filter((o) => o.severity === 'Crítico').length}` },
        { label: 'Nivel Alto', value: `${filtered.filter((o) => o.severity === 'Alto').length}` },
        { label: 'Casos Resolvidos', value: `${filtered.filter((o) => o.status === 'Resolvido').length}` }
      ],
      tableHeaders: ['Protocolo', 'Titulo / Categoria', 'Localizacao', 'Gravidade', 'Estado'],
      tableRows: filtered.map((occ) => [
        occ.protocol,
        `${occ.title} (${occ.category})`,
        `${occ.district}, ${occ.province}`,
        occ.severity,
        occ.status
      ]),
      filename: 'relatorio-ocorrencias-ambientais.pdf'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with View Switcher (Tabela vs Mapa Leaflet) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Denúncias e Ocorrências Ambientais
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Participação Cidadã
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comunique problemas ambientais na sua comunidade ou acompanhe o estado das ocorrências em todo o país.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interactive 3-Step Citizen Tour Button */}
          <CitizenReportTour variant="compact" onStartReport={onNewOccurrence} />

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportOccurrencesPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Exportar lista de ocorrências em PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar PDF</span>
          </button>

          {/* View Mode Switcher Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('tabela')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'tabela'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ver em Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mapa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'mapa'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Ver no Mapa</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
            </button>
          </div>

          <button
            onClick={onNewOccurrence}
            id="btn-new-occurrence"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Comunicar Problema</span>
          </button>
        </div>
      </div>

      {/* Clean Interactive 3-Step Guide Banner for Citizens */}
      <CitizenReportTour variant="banner" onStartReport={onNewOccurrence} />

      {/* Severity Metrics Bar & Interactive Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => {
            setSeverityFilter('Todas');
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            severityFilter === 'Todas'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-slate-800 dark:border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">Todas</div>
          <div className="text-xl font-black mt-0.5">{severityCounts.total}</div>
          <div className="text-[10px] opacity-70">Ocorrências registadas</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSeverityFilter(severityFilter === 'Crítico' ? 'Todas' : 'Crítico');
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            severityFilter === 'Crítico'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/50'
              : 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">Crítico</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-xl font-black mt-0.5">{severityCounts.critico}</div>
          <div className="text-[10px] opacity-80">Risco severo / imediato</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSeverityFilter(severityFilter === 'Alto' ? 'Todas' : 'Alto');
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            severityFilter === 'Alto'
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm ring-2 ring-orange-500/50'
              : 'bg-orange-50/60 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-900/60 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">Alto</span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="text-xl font-black mt-0.5">{severityCounts.alto}</div>
          <div className="text-[10px] opacity-80">Ameaça em progressão</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSeverityFilter(severityFilter === 'Médio' ? 'Todas' : 'Médio');
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            severityFilter === 'Médio'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/50'
              : 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">Médio</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-black mt-0.5">{severityCounts.medio}</div>
          <div className="text-[10px] opacity-80">Impacto localizado</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSeverityFilter(severityFilter === 'Baixo' ? 'Todas' : 'Baixo');
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            severityFilter === 'Baixo'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/50'
              : 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">Baixo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-black mt-0.5">{severityCounts.baixo}</div>
          <div className="text-[10px] opacity-80">Baixo risco inicial</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Pesquisar por ID, título, distrito..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Buscar ocorrências"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Province selector */}
          <select
            value={provinceFilter}
            onChange={(e) => {
              setProvinceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none font-medium"
          >
            <option value="Todas">Todas as Províncias</option>
            {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['Todas', 'Recebido', 'Em Validação', 'Validado', 'Em Intervenção', 'Resolvido'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: LEAFLET INTERACTIVE MAP */}
      {viewMode === 'mapa' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Map Top Indicator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                Mapa de Ocorrências • {filtered.length} Registo(s)
              </span>
              {severityFilter !== 'Todas' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-emerald-200">
                  Filtro: {severityFilter}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Modo do Mapa:</span>
              <button
                type="button"
                onClick={() => setMapRenderMode('marcadores')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  mapRenderMode === 'marcadores'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Marcadores Dinâmicos
              </button>
              <button
                type="button"
                onClick={() => setMapRenderMode('calor')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                  mapRenderMode === 'calor'
                    ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-xs ring-2 ring-rose-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-200" />
                <span>Mancha de Calor</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Component with Dynamic Severity Markers & Heatmap Layer */}
          <InteractiveLeafletMap
            occurrences={filtered}
            selectedProvince={provinceFilter as any}
            activeFilterSeverity={severityFilter}
            onSelectOccurrence={onSelectOccurrence}
            mode={mapRenderMode}
            showHeatmapDefault={mapRenderMode === 'calor'}
            height="580px"
            showLayerControls={true}
            showBottomRibbon={true}
          />

          {/* Strategic Decision Panel for Environmental Authorities */}
          {detectedCriticalZones.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 text-white shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <span>Painel de Apoio à Decisão das Autoridades • Zonas Críticas Identificadas</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {detectedCriticalZones.length} {detectedCriticalZones.length === 1 ? 'Zona Ativa' : 'Zonas Ativas'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      O modelo térmico de densidade correlaciona focos georreferenciados e severidade para priorizar despachos de fiscalização.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span>SIG Moçambique</span>
                  <span>•</span>
                  <span className="text-emerald-400">MTA / AQUA / ANAC</span>
                </div>
              </div>

              {/* Critical Zones Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {detectedCriticalZones.map((zone) => {
                  const isExtreme = zone.riskLevel === 'Crítico Extremo';
                  return (
                    <div
                      key={zone.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                        isExtreme
                          ? 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400'
                          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isExtreme
                                ? 'bg-rose-600 text-white'
                                : 'bg-orange-600 text-white'
                            }`}
                          >
                            {zone.riskLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Índice: <strong className="text-white">{zone.riskScore}</strong>
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white leading-snug">
                          {zone.name}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ameaça predominante: <strong className="text-slate-200">{zone.dominantCategory}</strong>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-white">
                            {zone.totalIncidents} focos no raio de {zone.radiusKm}km
                          </span>
                          {zone.criticalCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold text-[9px]">
                              {zone.criticalCount} críticos
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-300 mt-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                          <strong className="text-amber-300 block mb-0.5">Ação Recomendada:</strong>
                          {zone.recommendedAction}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400">
                          {zone.province}
                        </span>
                        {zone.occurrences[0] && (
                          <button
                            type="button"
                            onClick={() => onSelectOccurrence(zone.occurrences[0])}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                          >
                            Inspecionar Dossiê →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: TABLE CONTAINER */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">ID / Protocolo</th>
                  <th className="px-5 py-3.5">Tipo / Título</th>
                  <th className="px-5 py-3.5">Gravidade</th>
                  <th className="px-5 py-3.5">Localização</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginated.length > 0 ? (
                  paginated.map((occ) => (
                    <tr
                      key={occ.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectOccurrence(occ)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {occ.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {occ.protocol}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                          <span>{occ.title}</span>
                          {occ.imageUrl && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500" title="Possui evidência fotográfica">
                              📷
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {occ.category}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                            occ.severity
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              occ.severity === 'Crítico'
                                ? 'bg-rose-500 animate-pulse'
                                : occ.severity === 'Alto'
                                ? 'bg-orange-500'
                                : occ.severity === 'Médio'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{occ.severity}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{occ.district} — {occ.province}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {occ.timestamp}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            occ.status
                          )}`}
                        >
                          {occ.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div
                          className="flex items-center justify-end space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Eye Button - View Details */}
                          <button
                            onClick={() => onSelectOccurrence(occ)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                            title="Visualizar Dossiê Completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit Button - Fast Status Advance */}
                          <button
                            onClick={() => {
                              if (onUpdateStatus) {
                                const nextStatus: OccurrenceStatus =
                                  occ.status === 'Recebido'
                                    ? 'Em Validação'
                                    : occ.status === 'Em Validação'
                                    ? 'Validado'
                                    : occ.status === 'Validado'
                                    ? 'Em Intervenção'
                                    : 'Resolvido';
                                onUpdateStatus(occ.id, nextStatus);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                            title="Avançar Estado"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Nenhuma ocorrência encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              de <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> registos
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

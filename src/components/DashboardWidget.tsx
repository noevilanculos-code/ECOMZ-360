import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Gauge,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { MozambiqueProvince } from '../types';

export interface EnvironmentalMetricsData {
  province: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  aqi: number;
  aqiStatus: 'Boa' | 'Moderada' | 'Pouco Saudável' | 'Muito Pouco Saudável' | 'Crítica' | string;
  pm25: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  pressure: number;
  alert: string | null;
  summary: string;
  inhabitantsImpact: string;
  isGrounded: boolean;
  groundingSources: Array<{ type: 'web'; title: string; uri: string }>;
  searchQueries: string[];
  lastUpdated: string;
  dataSource: string;
}

const PROVINCE_OPTIONS: Array<{ id: MozambiqueProvince; name: string; region: string; capital: string }> = [
  { id: 'Maputo Cidade', name: 'Maputo Cidade', region: 'Sul', capital: 'Maputo' },
  { id: 'Maputo Província', name: 'Maputo Província', region: 'Sul', capital: 'Matola' },
  { id: 'Sofala', name: 'Sofala', region: 'Centro', capital: 'Beira' },
  { id: 'Nampula', name: 'Nampula', region: 'Norte', capital: 'Nampula' },
  { id: 'Cabo Delgado', name: 'Cabo Delgado', region: 'Norte', capital: 'Pemba' },
  { id: 'Tete', name: 'Tete', region: 'Centro', capital: 'Tete' },
  { id: 'Zambézia', name: 'Zambézia', region: 'Centro', capital: 'Quelimane' },
  { id: 'Inhambane', name: 'Inhambane', region: 'Sul', capital: 'Inhambane' },
  { id: 'Gaza', name: 'Gaza', region: 'Sul', capital: 'Xai-Xai' },
  { id: 'Manica', name: 'Manica', region: 'Centro', capital: 'Chimoio' },
  { id: 'Niassa', name: 'Niassa', region: 'Norte', capital: 'Lichinga' }
];

const clientMetricsCache = new Map<string, { data: EnvironmentalMetricsData; time: number }>();

interface DashboardWidgetProps {
  defaultProvince?: MozambiqueProvince;
  onSelectProvince?: (province: MozambiqueProvince) => void;
  className?: string;
  showProvincePills?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  defaultProvince = 'Maputo Cidade',
  onSelectProvince,
  className = '',
  showProvincePills = true
}) => {
  const [selectedProvince, setSelectedProvince] = useState<MozambiqueProvince>(defaultProvince);
  const [metrics, setMetrics] = useState<EnvironmentalMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  // Fetch Environmental Metrics from server endpoint with Google Search Grounding and client caching
  const fetchMetrics = useCallback(async (provinceName: string, forceRefresh = false) => {
    // If cached within 10 minutes and not force refreshing, use cached
    const cached = clientMetricsCache.get(provinceName);
    if (!forceRefresh && cached && Date.now() - cached.time < 10 * 60 * 1000) {
      setMetrics(cached.data);
      setLastRefreshedAt(new Date(cached.time));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/environmental-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ province: provinceName })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao obter dados meteorológicos`);
      }

      const data: EnvironmentalMetricsData = await response.json();
      setMetrics(data);
      clientMetricsCache.set(provinceName, { data, time: Date.now() });
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.warn('Erro ao carregar métricas ambientais:', err);
      setError('Não foi possível carregar os dados em tempo real. A exibir estimativa meteorológica local.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(selectedProvince, false);
  }, [selectedProvince, fetchMetrics]);

  const handleProvinceChange = (province: MozambiqueProvince) => {
    setSelectedProvince(province);
    onSelectProvince?.(province);
  };

  // Helper for AQI styling
  const getAqiBadge = (aqi: number, status: string) => {
    if (aqi <= 50) {
      return {
        bg: 'bg-emerald-500/15 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-700',
        dot: 'bg-emerald-500',
        label: 'Qualidade do Ar Excelente / Boa'
      };
    }
    if (aqi <= 100) {
      return {
        bg: 'bg-amber-500/15 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-700',
        dot: 'bg-amber-500',
        label: 'Qualidade do Ar Moderada'
      };
    }
    if (aqi <= 150) {
      return {
        bg: 'bg-orange-500/15 dark:bg-orange-950/60',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-300 dark:border-orange-700',
        dot: 'bg-orange-500',
        label: 'Pouco Saudável para Grupos Sensíveis'
      };
    }
    return {
      bg: 'bg-rose-500/15 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700',
      dot: 'bg-rose-500 animate-pulse',
      label: 'Crítica / Muito Pouco Saudável'
    };
  };

  const aqiInfo = metrics ? getAqiBadge(metrics.aqi, metrics.aqiStatus) : null;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all ${className}`}
      id="dashboard-environmental-widget"
    >
      {/* 1. Header Bar with Institutional Green & Deep Navy Touch */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#062B3D] via-[#07364A] to-[#0A4861] text-white flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                Monitorização Climática em Tempo Real
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>Condições Ambientais e Qualidade do Ar</span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Consulte a temperatura, humidade, qualidade do ar e recomendações de saúde para a sua província
            </p>
          </div>
        </div>

        {/* Controls: Province Selector & Live Refresh */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value as MozambiqueProvince)}
              aria-label="Selecionar Província de Moçambique"
              className="appearance-none bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white pl-8 pr-8 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all cursor-pointer"
            >
              {PROVINCE_OPTIONS.map((prov) => (
                <option key={prov.id} value={prov.id} className="bg-slate-900 text-white">
                  {prov.name} ({prov.region})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => fetchMetrics(selectedProvince, true)}
            disabled={isLoading}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
            title="Atualizar métricas agora via Google Search Grounding"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Province Pills Slider */}
      {showProvincePills && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center space-x-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-600" />
            <span>Província:</span>
          </span>
          {PROVINCE_OPTIONS.map((prov) => {
            const isSelected = selectedProvince === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => handleProvinceChange(prov.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-bold scale-102'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {prov.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Metrics Grid */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Alerts Banner (if present) */}
        {metrics?.alert && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start space-x-2.5 text-amber-900 dark:text-amber-200 animate-in fade-in duration-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold block text-amber-800 dark:text-amber-300">
                Aviso Oficial do Instituto Nacional de Meteorologia (INAM):
              </span>
              <p className="mt-0.5 leading-relaxed">{metrics.alert}</p>
            </div>
          </div>
        )}

        {/* 3 Primary Metric Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* CARD 1: TEMPERATURA */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Temperatura
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300">
                {metrics?.condition || 'Tempo Atual'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {metrics?.temperature ?? '--'}
                </span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">°C</span>
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <span>Sensação: </span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {metrics?.feelsLike ?? metrics?.temperature ?? '--'}°C
                </strong>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-blue-500 font-bold">Min:</span> {metrics?.tempMin ?? '--'}°C
              </span>
              <span className="flex items-center gap-1">
                <span className="text-rose-500 font-bold">Máx:</span> {metrics?.tempMax ?? '--'}°C
              </span>
              <span className="text-[10px] text-slate-400">
                UV: {metrics?.uvIndex ?? '--'}
              </span>
            </div>
          </div>

          {/* CARD 2: HUMIDADE RELATIVA */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-200/80 dark:border-blue-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Humidade do Ar
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                {(metrics?.humidity ?? 0) > 75 ? 'Humidade Elevada' : (metrics?.humidity ?? 0) < 45 ? 'Ar Seco' : 'Equilibrada'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {metrics?.humidity ?? '--'}
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">%</span>
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <span>Vento: </span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {metrics?.windSpeed ?? '--'} km/h {metrics?.windDirection ?? ''}
                </strong>
              </div>
            </div>

            {/* Visual humidity bar */}
            <div className="mt-3 pt-2.5 border-t border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, metrics?.humidity || 50))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0% Seco</span>
                <span>Pressão: {metrics?.pressure ?? 1013} hPa</span>
                <span>100% Saturado</span>
              </div>
            </div>
          </div>

          {/* CARD 3: QUALIDADE DO AR (AQI) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/80 dark:border-emerald-900/40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Qualidade do Ar (AQI)
                </span>
              </div>
              {aqiInfo && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiInfo.bg} ${aqiInfo.text} ${aqiInfo.border} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${aqiInfo.dot}`} />
                  <span>{metrics?.aqiStatus}</span>
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {metrics?.aqi ?? '--'}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">Índice AQI</span>
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <span>PM2.5: </span>
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {metrics?.pm25 ?? '--'} µg/m³
                </strong>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="truncate max-w-[200px]">
                {aqiInfo?.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Padrão OMS/AQUA
              </span>
            </div>
          </div>
        </div>

        {/* 4. Descriptive Summary & Community Recommendations */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnóstico Agroecológico & Condições Locais ({metrics?.province || selectedProvince}):</span>
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lastRefreshedAt.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {metrics?.summary || 'A compilar relatório ambiental fundamentado em tempo real...'}
          </p>

          {metrics?.inhabitantsImpact && (
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Recomendação para a Comunidade:</strong> {metrics.inhabitantsImpact}</span>
            </div>
          )}
        </div>

        {/* 5. Official Weather & Environmental Sources (Clean & Optional) */}
        {metrics?.groundingSources && metrics.groundingSources.length > 0 && (
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Fontes meteorológicas verificadas:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {metrics.groundingSources.slice(0, 3).map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <span className="truncate max-w-[160px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

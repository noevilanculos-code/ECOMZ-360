import React, { useState, useMemo } from 'react';
import {
  Waves,
  Wind,
  Mountain,
  AlertTriangle,
  Shield,
  ShieldCheck,
  Droplets,
  MapPin,
  Play,
  RotateCcw,
  Download,
  Info,
  Building2,
  Users,
  Flame,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { MOZAMBIQUE_TIDE_STATIONS, MOZAMBIQUE_TOPOGRAPHY_FEATURES } from '../lib/leafletEnvironmentalDynamics';

export interface CoastalLocationPreset {
  id: string;
  name: string;
  province: string;
  normalHighTideM: number;
  criticalSurgeThresholdM: number;
  averageElevationM: number;
  vulnerablePopulation: number;
  mangroveAreaHa: number;
  description: string;
  historicEvent: string;
}

export const COASTAL_PRESETS: CoastalLocationPreset[] = [
  {
    id: 'loc-beira',
    name: 'Baía de Sofala & Búzios (Porto da Beira)',
    province: 'Sofala',
    normalHighTideM: 6.9,
    criticalSurgeThresholdM: 7.5,
    averageElevationM: 2.4,
    vulnerablePopulation: 320000,
    mangroveAreaHa: 14500,
    description: 'Estuário hiper-mareal com uma das maiores amplitudes do Oceano Índico. Bairros da Praia Nova, Munhava e Manga situam-se abaixo da cota de maré máxima de sizígia.',
    historicEvent: 'Ciclone Idai (2019) gerou sobreelevação de +4.8m sobre a preia-mar, submergindo 90% da malha urbana costeira.'
  },
  {
    id: 'loc-quelimane',
    name: 'Foz do Rio dos Bons Sinais (Quelimane)',
    province: 'Zambézia',
    normalHighTideM: 4.8,
    criticalSurgeThresholdM: 5.4,
    averageElevationM: 3.1,
    vulnerablePopulation: 185000,
    mangroveAreaHa: 22000,
    description: 'Rede dendrítica de esteiros e mangais protegendo a foz do Licungo. O corte de mangais aumentou a vulnerabilidade a inundações de maré salina.',
    historicEvent: 'Ciclone Freddy (2023) causou remanso fluvial e invasão das machambas de arroz por água salgada.'
  },
  {
    id: 'loc-maputo',
    name: 'Baía de Maputo & Costa do Sol (KaMavota/KaTembe)',
    province: 'Maputo Cidade',
    normalHighTideM: 3.8,
    criticalSurgeThresholdM: 4.5,
    averageElevationM: 4.2,
    vulnerablePopulation: 140000,
    mangroveAreaHa: 6800,
    description: 'Avenida Marginal e estuário do Espírito Santo vulneráveis a ressacas de tempestade do quadrante Sul e subida secular do mar.',
    historicEvent: 'Tempestades de 2021 causaram destruição de paredões na Costa do Sol e erosão de dunas na Macaneta.'
  },
  {
    id: 'loc-angoche',
    name: 'Costa de Angoche & Ilhas Primeiras',
    province: 'Nampula',
    normalHighTideM: 4.2,
    criticalSurgeThresholdM: 4.9,
    averageElevationM: 3.5,
    vulnerablePopulation: 95000,
    mangroveAreaHa: 11000,
    description: 'Comunidades piscatórias artesanais vivendo em bancos de areia e ilhas de barreira com baixíssima elevação topográfica.',
    historicEvent: 'Ciclone Gombe (2022) isolou aldeias costeiras e destruiu viveiros de bivalves e caranguejo.'
  },
  {
    id: 'loc-pemba',
    name: 'Baía de Pemba & Arquipélago das Quirimbas',
    province: 'Cabo Delgado',
    normalHighTideM: 4.3,
    criticalSurgeThresholdM: 5.1,
    averageElevationM: 5.8,
    vulnerablePopulation: 75000,
    mangroveAreaHa: 8900,
    description: 'A terceira maior baía natural do mundo com relevo costeiro íngreme em partes, mas praias e estuários com comunidades muito vulneráveis.',
    historicEvent: 'Ciclone Kenneth (2019) atingiu a costa com ventos de 220 km/h e maré violenta no Ibo e Quissanga.'
  }
];

export const CoastalInundationTideSim: React.FC = () => {
  const [selectedLocId, setSelectedLocId] = useState<string>('loc-beira');
  const [astronomicalTideType, setAstronomicalTideType] = useState<'morta' | 'media' | 'sizigia'>('sizigia');
  const [windStormSurgeM, setWindStormSurgeM] = useState<number>(1.8);
  const [seaLevelRiseCm, setSeaLevelRiseCm] = useState<number>(35); // 0 to 150 cm
  const [mangroveDefenseStatus, setMangroveDefenseStatus] = useState<'degradado' | 'atual' | 'restaurado'>('atual');
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);

  const loc = COASTAL_PRESETS.find((l) => l.id === selectedLocId) || COASTAL_PRESETS[0];

  // Astronomical Tide Height calculation
  const astroTideHeight = useMemo(() => {
    if (astronomicalTideType === 'morta') return loc.normalHighTideM * 0.72;
    if (astronomicalTideType === 'media') return loc.normalHighTideM * 0.88;
    return loc.normalHighTideM; // Sizígia / Spring Tide
  }, [astronomicalTideType, loc.normalHighTideM]);

  // Mangrove Attenuation Factor (healthy mangroves reduce wave energy by up to 55-65%)
  const mangroveAttenuationM = useMemo(() => {
    if (mangroveDefenseStatus === 'degradado') return 0.15; // Barely any reduction
    if (mangroveDefenseStatus === 'atual') return 0.65; // Moderate reduction
    return 1.35; // Dense restored mangrove forest absorbs surge
  }, [mangroveDefenseStatus]);

  // Sea level rise in meters
  const slrM = seaLevelRiseCm / 100;

  // Net Peak Water Elevation (relative to baseline chart datum)
  const netWaterLevelM = useMemo(() => {
    const rawPeak = astroTideHeight + windStormSurgeM + slrM;
    const attenuated = Math.max(astroTideHeight, rawPeak - mangroveAttenuationM);
    return Number(attenuated.toFixed(2));
  }, [astroTideHeight, windStormSurgeM, slrM, mangroveAttenuationM]);

  // Overflow depth over average coastal terrain elevation
  const overflowDepthM = useMemo(() => {
    const depth = netWaterLevelM - loc.averageElevationM;
    return Number(Math.max(0, depth).toFixed(2));
  }, [netWaterLevelM, loc.averageElevationM]);

  // Impact Calculations
  const impacts = useMemo(() => {
    const severityFactor = overflowDepthM / 2.5; // Normalized
    const clampedFactor = Math.min(1.0, Math.max(0.05, severityFactor));

    const displacedPeople = Math.round(loc.vulnerablePopulation * clampedFactor * (overflowDepthM > 0 ? 1 : 0.05));
    const floodedUrbanKm2 = Number((overflowDepthM * 18.4).toFixed(1));
    const floodedMachambasHa = Math.round(overflowDepthM * 4200);
    const salinizedWells = Math.round(overflowDepthM * 280);
    const estimatedLossMZN = Math.round(overflowDepthM * 850) * 1000000; // in MZN

    const riskLevel =
      overflowDepthM > 2.5
        ? 'Catastrófico (Nível 5)'
        : overflowDepthM > 1.5
        ? 'Crítico Extremo (Nível 4)'
        : overflowDepthM > 0.8
        ? 'Alerta Alto (Nível 3)'
        : overflowDepthM > 0.2
        ? 'Aviso Moderado (Nível 2)'
        : 'Sob Controlo (Nível 1)';

    return {
      displacedPeople,
      floodedUrbanKm2,
      floodedMachambasHa,
      salinizedWells,
      estimatedLossMZN,
      riskLevel
    };
  }, [overflowDepthM, loc.vulnerablePopulation]);

  const handleExportPDF = () => {
    const reportData = {
      title: `Simulação de Inundação Costeira & Dinâmica de Maré — ${loc.name}`,
      date: new Date().toLocaleDateString('pt-MZ'),
      summary: `Relatório Técnico de Modelagem Hidrodinâmica Costeira e Risco de Galgamento por Sobreelevação de Vento e Maré de Sizígia em ${loc.province}.`,
      indicators: [
        { label: 'Local Costeiro Analisado', value: loc.name },
        { label: 'Cota Máxima de Água Modelada', value: `${netWaterLevelM} metros` },
        { label: 'Lâmina de Inundação no Solo', value: `${overflowDepthM} metros acima da cota` },
        { label: 'Maré Astronómica de Sizígia', value: `${astroTideHeight.toFixed(2)} m` },
        { label: 'Sobreelevação de Vento / Vaga', value: `+${windStormSurgeM} m` },
        { label: 'Subida do Nível Médio do Mar', value: `+${seaLevelRiseCm} cm` },
        { label: 'Estado do Cinturão de Mangais', value: mangroveDefenseStatus.toUpperCase() },
        { label: 'População em Risco de Desalojamento', value: `${impacts.displacedPeople.toLocaleString('pt-MZ')} pessoas` },
        { label: 'Área Urbana Inundada', value: `${impacts.floodedUrbanKm2} km²` },
        { label: 'Machambas Agrícolas Salinizadas', value: `${impacts.floodedMachambasHa.toLocaleString('pt-MZ')} ha` },
        { label: 'Fontes de Água Doce Contaminadas', value: `${impacts.salinizedWells} poços/furos` },
        { label: 'Prejuízo Económico Estimado', value: `${(impacts.estimatedLossMZN / 1000000).toFixed(1)} Milhões MZN` }
      ]
    };
    exportToPDF(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-[#062B3D] via-[#09425E] to-[#0D5C75] text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-cyan-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 text-xs font-bold mb-3 shadow-xs">
              <Waves className="w-3.5 h-3.5 text-cyan-300" />
              <span>Simulador Hidrodinâmico & Relevo Costeiro de Moçambique</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Inundação Costeira, Vento & Maré de Sizígia
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100 mt-2 max-w-3xl leading-relaxed">
              Modela a interação física entre a topografia costeira moçambicana, o vento no Canal de Moçambique (storm surge), as marés vivas de sizígia e a proteção natural oferecida pelos cinturões de mangal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Exportar Relatório PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Location Selection Cards */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          1. Selecionar Zona Costeira / Estuário Alvo em Moçambique:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COASTAL_PRESETS.map((p) => {
            const isSelected = p.id === selectedLocId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedLocId(p.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.province}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {p.normalHighTideM}m maré
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Cota Média: {p.averageElevationM}m</span>
                  <span>{p.mangroveAreaHa.toLocaleString('pt-MZ')} ha mangal</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-600" />
              <span>Parâmetros Oceanográficos & Relevo</span>
            </h3>
            <button
              onClick={() => {
                setAstronomicalTideType('sizigia');
                setWindStormSurgeM(1.8);
                setSeaLevelRiseCm(35);
                setMangroveDefenseStatus('atual');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Redefinir</span>
            </button>
          </div>

          {/* Parameter 1: Maré Astronómica */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Ciclo da Maré Astronómica:</span>
              </span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {astroTideHeight.toFixed(2)} metros
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAstronomicalTideType('morta')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  astronomicalTideType === 'morta'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Maré Morta</div>
                <div className="text-[10px] opacity-80">Quarto Cresc./Ming.</div>
              </button>
              <button
                type="button"
                onClick={() => setAstronomicalTideType('media')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  astronomicalTideType === 'media'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Maré Média</div>
                <div className="text-[10px] opacity-80">Ciclo Regular</div>
              </button>
              <button
                type="button"
                onClick={() => setAstronomicalTideType('sizigia')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  astronomicalTideType === 'sizigia'
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs ring-2 ring-cyan-400/40'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Maré Viva</div>
                <div className="text-[10px] opacity-80">Sizígia (Lua Cheia/Nova)</div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Na Baía de Sofala, a sizígia atinge até 6.9m no Estuário do Púnguè devido ao afunilamento batimétrico.
            </p>
          </div>

          {/* Parameter 2: Sobreelevação por Vento (Storm Surge) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>Sobreelevação pelo Vento / Ciclone:</span>
              </span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                +{windStormSurgeM.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5.0"
              step="0.1"
              value={windStormSurgeM}
              onChange={(e) => setWindStormSurgeM(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0m (Calmaria)</span>
              <span>1.5m (Depressão)</span>
              <span>3.5m (Ciclone Cat 3)</span>
              <span>5.0m (Idai Cat 4+)</span>
            </div>
          </div>

          {/* Parameter 3: Subida do Nível Médio do Mar (SLR) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Cenário Climático IPCC (Subida do Mar):</span>
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                +{seaLevelRiseCm} cm (+{slrM.toFixed(2)} m)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={seaLevelRiseCm}
              onChange={(e) => setSeaLevelRiseCm(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 cm (Atual)</span>
              <span>35 cm (2050 RCP 4.5)</span>
              <span>80 cm (2100 RCP 8.5)</span>
              <span>150 cm (Extremo)</span>
            </div>
          </div>

          {/* Parameter 4: Barreira de Proteção de Mangais */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cinturão de Proteção de Mangais:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                -{mangroveAttenuationM.toFixed(2)}m na crista da onda
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMangroveDefenseStatus('degradado')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  mangroveDefenseStatus === 'degradado'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Degradado</div>
                <div className="text-[10px] opacity-80">-0.15m absorção</div>
              </button>
              <button
                type="button"
                onClick={() => setMangroveDefenseStatus('atual')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  mangroveDefenseStatus === 'atual'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Atual</div>
                <div className="text-[10px] opacity-80">-0.65m absorção</div>
              </button>
              <button
                type="button"
                onClick={() => setMangroveDefenseStatus('restaurado')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  mangroveDefenseStatus === 'restaurado'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>Restaurado</div>
                <div className="text-[10px] opacity-80">-1.35m absorção</div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Raízes aéreas (pneumatóforos) dissipam até 60% da energia da maré ciclónica e reduzem o assoreamento.
            </p>
          </div>
        </div>

        {/* Right Simulation Visualizer & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col">
          {/* Hydraulic Elevation Profile Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  Perfil de Relevo vs Lâmina de Água
                </span>
                <h4 className="font-bold text-sm text-white">{loc.name}</h4>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs bg-cyan-950/80 text-cyan-300 border-cyan-800">
                {impacts.riskLevel}
              </div>
            </div>

            {/* Visual Cross Section Diagram */}
            <div className="my-6 relative py-4 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
              <div className="flex items-end justify-between h-44 relative">
                {/* Ocean Basin */}
                <div className="w-1/3 flex flex-col justify-end h-full">
                  <div className="text-[10px] font-bold text-cyan-400 mb-1 flex items-center gap-1">
                    <Waves className="w-3 h-3" />
                    <span>Canal de Moçambique</span>
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-900 via-cyan-800 to-cyan-500 rounded-t-lg transition-all duration-700 relative overflow-hidden flex flex-col justify-between p-2 shadow-inner"
                    style={{ height: `${Math.min(100, Math.max(30, (netWaterLevelM / 10) * 100))}%` }}
                  >
                    <div className="text-[11px] font-black text-white font-mono drop-shadow">
                      Pico: {netWaterLevelM}m
                    </div>
                    <div className="text-[9px] text-cyan-200">
                      Sizígia + Vento
                    </div>
                  </div>
                </div>

                {/* Mangrove Buffer Zone */}
                <div className="w-1/4 flex flex-col justify-end h-full px-1">
                  <div className="text-[10px] font-bold text-emerald-400 mb-1 text-center">
                    🌿 Mangal ({mangroveDefenseStatus})
                  </div>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 relative flex items-center justify-center text-center p-1 border-t-2 ${
                      mangroveDefenseStatus === 'restaurado'
                        ? 'bg-emerald-800/90 border-emerald-400 text-emerald-100'
                        : mangroveDefenseStatus === 'atual'
                        ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}
                    style={{ height: '45%' }}
                  >
                    <span className="text-[9px] font-semibold leading-tight">
                      Amortecimento: -{mangroveAttenuationM}m
                    </span>
                  </div>
                </div>

                {/* Coastal Inundated Land / Machamba & Urban */}
                <div className="w-2/5 flex flex-col justify-end h-full">
                  <div className="text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Mountain className="w-3 h-3" />
                    <span>Relevo Costeiro (Cota {loc.averageElevationM}m)</span>
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-stone-800 to-amber-900/90 rounded-t-lg transition-all duration-500 relative p-2 flex flex-col justify-between border-t border-amber-600"
                    style={{ height: `${Math.min(90, Math.max(20, (loc.averageElevationM / 10) * 100))}%` }}
                  >
                    <div className="text-[10px] font-bold text-amber-200">
                      Cota Terrestre: {loc.averageElevationM}m
                    </div>

                    {overflowDepthM > 0 && (
                      <div className="absolute -top-6 left-0 right-0 py-0.5 px-1 bg-rose-600/90 text-white rounded text-[10px] font-black text-center animate-pulse border border-rose-400 shadow-md">
                        ⚠️ Lâmina de Água no Solo: +{overflowDepthM}m!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Threshold indicator line */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Limiar Crítico de Galgamento: <strong className="text-white">{loc.criticalSurgeThresholdM}m</strong></span>
                <span>
                  Sobreelevação Resultante: <strong className={overflowDepthM > 0 ? 'text-rose-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>
                    {netWaterLevelM}m ({overflowDepthM > 0 ? `+${overflowDepthM}m sobre cota` : 'Abaixo do dique'})
                  </strong>
                </span>
              </div>
            </div>

            {/* Impact Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-rose-400" />
                  <span>População Afetada</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {impacts.displacedPeople.toLocaleString('pt-MZ')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  habitantes sob risco
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1 mb-1">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  <span>Malha Urbana</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {impacts.floodedUrbanKm2} km²
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  bairros inundados
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1 mb-1">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>Machambas</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {impacts.floodedMachambasHa.toLocaleString('pt-MZ')} ha
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  intrusão salina
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1 mb-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Prejuízo Estimado</span>
                </div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {(impacts.estimatedLossMZN / 1000000).toFixed(0)}M
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Meticais (MZN)
                </div>
              </div>
            </div>
          </div>

          {/* Historical Precedent and Action Recommendation */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Contexto Histórico & Recomendações INGD / MTA:</span>
            </div>
            <p className="text-amber-800 dark:text-amber-200 leading-relaxed text-[11px]">
              {loc.historicEvent}
            </p>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100 text-[11px] font-medium">
              <strong>Plano de Ação Recomendado:</strong> Manter a restauração da barreira biológica de mangais na cota entre-marés; evacuação preventiva de bairros com cota &lt; 2.5m com 24h de antecedência quando tempestade coincidir com lua cheia/nova (sizígia); fechamento de comportas das valas de drenagem da Beira durante a preia-mar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

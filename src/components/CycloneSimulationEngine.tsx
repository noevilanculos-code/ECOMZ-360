import React, { useState } from 'react';
import {
  Wind,
  Waves,
  AlertTriangle,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Users,
  Building2,
  Droplets,
  Package,
  Calendar,
  Download,
  Flame,
  ArrowRight,
  TrendingDown,
  Activity,
  FileText
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

export interface CycloneScenario {
  id: string;
  name: string;
  categoryScale: 1 | 2 | 3 | 4 | 5;
  coastTarget: string;
  provinces: string[];
  maxWindKmh: number;
  gustsKmh: number;
  stormSurgeM: number;
  rainfall48hMm: number;
  description: string;
  historicReference: string;
}

export const CYCLONE_PRESETS: CycloneScenario[] = [
  {
    id: 'cyc-idai',
    name: 'Ciclone Tropical Intenso "Idai 2.0" (Sofala / Beira)',
    categoryScale: 4,
    coastTarget: 'Estuário da Beira & Foz do Rio Búzi',
    provinces: ['Sofala', 'Manica', 'Zambézia'],
    maxWindKmh: 195,
    gustsKmh: 240,
    stormSurgeM: 5.4,
    rainfall48hMm: 520,
    description: 'Impacto direto no corredor costeiro de Sofala com sobreelevação oceânica extrema (storm surge) coincidindo com maré viva, inundando a Beira e isolando o Búzi.',
    historicReference: 'Baseado no Ciclone Tropical Idai (Março 2019)'
  },
  {
    id: 'cyc-freddy',
    name: 'Ciclone de Trajetória Prolongada "Freddy" (Zambézia / Quelimane)',
    categoryScale: 3,
    coastTarget: 'Quelimane & Bacia do Licungo',
    provinces: ['Zambézia', 'Tete', 'Niassa'],
    maxWindKmh: 165,
    gustsKmh: 200,
    stormSurgeM: 3.8,
    rainfall48hMm: 680,
    description: 'Precipitação acumulada sem precedentes provocando transbordo violento do Rio Licungo, destruição de pontes e perda maciça de machambas agrícolas.',
    historicReference: 'Baseado no Ciclone Tropical Freddy (Março 2023)'
  },
  {
    id: 'cyc-kenneth',
    name: 'Super Ciclone "Kenneth" (Cabo Delgado / Quirimbas)',
    categoryScale: 4,
    coastTarget: 'Baía de Pemba, Ibo & Macomia',
    provinces: ['Cabo Delgado', 'Nampula'],
    maxWindKmh: 220,
    gustsKmh: 260,
    stormSurgeM: 4.8,
    rainfall48hMm: 450,
    description: 'Ventos ciclónicos devastadores sobre o arquipélago das Quirimbas e costa norte com destruição de infraestruturas comunitárias e habitações tradicionais.',
    historicReference: 'Baseado no Ciclone Tropical Kenneth (Abril 2019)'
  },
  {
    id: 'cyc-south',
    name: 'Ciclone Tropical Sul "Dineo / Guambe" (Inhambane / Gaza)',
    categoryScale: 2,
    coastTarget: 'Vilankulo, Maxixe & Xai-Xai',
    provinces: ['Inhambane', 'Gaza', 'Maputo Província'],
    maxWindKmh: 130,
    gustsKmh: 165,
    stormSurgeM: 2.9,
    rainfall48hMm: 380,
    description: 'Galgamento das dunas costeiras em Vilankulo e inundação da planície aluvial do Baixo Limpopo em Chókwè e Xai-Xai.',
    historicReference: 'Baseado no Ciclone Dineo (2017) e Tempestade Guambe (2021)'
  }
];

export const CycloneSimulationEngine: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cyc-idai');
  const [timelineStep, setTimelineStep] = useState<number>(2); // 0: -48h, 1: -24h, 2: 0h Landfall, 3: +24h, 4: +48h
  const [windMultiplier, setWindMultiplier] = useState<number>(1.0);
  const [tideCoefficient, setTideCoefficient] = useState<number>(92); // Maré Viva / Spring Tide

  const currentPreset = CYCLONE_PRESETS.find((p) => p.id === selectedPresetId) || CYCLONE_PRESETS[0];

  const timelineSteps = [
    { step: 0, label: 'T - 48h', title: 'Aproximação no Canal', desc: 'Depressão tropical em rota de colisão a 450 km da costa. Formação de ondas de 4 metros.' },
    { step: 1, label: 'T - 24h', title: 'Intensificação Rápida', desc: 'Ventos sustentados aumentam. Ordens de evacuação preventiva emitidas pelo INGD.' },
    { step: 2, label: 'T - 0h (Landfall)', title: 'Impacto Costeiro Máximo', desc: 'O olho do ciclone toca terra. Maré de tempestade extrema e rajadas violentas.' },
    { step: 3, label: 'T + 24h', title: 'Cheias Fluviais & Dilúvio', desc: 'Precipitação torrencial no interior. Transbordo de bacias e corte de pontes e estradas.' },
    { step: 4, label: 'T + 48h', title: 'Rescaldo & Assistência Humanitária', desc: 'Água estagnada, avaliação de danos, distribuição de kits de purificação e alimentos.' }
  ];

  // Dynamic calculations based on scenario and controls
  const effectiveWind = Math.round(currentPreset.maxWindKmh * windMultiplier);
  const effectiveGust = Math.round(currentPreset.gustsKmh * windMultiplier);
  const effectiveSurge = Number((currentPreset.stormSurgeM * (tideCoefficient / 85)).toFixed(1));

  // Step-dependent multiplier
  const stepIntensity = [0.35, 0.7, 1.0, 0.85, 0.45][timelineStep];

  const affectedPeople = Math.round(
    currentPreset.categoryScale * 280000 * windMultiplier * stepIntensity * (effectiveSurge / 4.0)
  );
  const submergedHa = Math.round(
    currentPreset.categoryScale * 35000 * (effectiveSurge / 3.5) * stepIntensity
  );
  const waterKitsNeeded = Math.round(affectedPeople * 0.12);
  const emergencySheltersNeeded = Math.round(affectedPeople / 350);
  const estimatedLossMZN = Math.round(
    currentPreset.categoryScale * 12500000000 * windMultiplier * stepIntensity
  );

  const handleExportCycloneReport = () => {
    exportToPDF({
      title: `Boletim de Simulação Ciclónica: ${currentPreset.name}`,
      subtitle: `Modelagem de Risco Hidrometeorológico e Plano de Contingência INGD`,
      summary: `${currentPreset.description}. Ponto de impacto simulado em ${currentPreset.coastTarget}. Fase da tempestade: ${timelineSteps[timelineStep].label} - ${timelineSteps[timelineStep].title}.`,
      metrics: [
        { label: 'População em Risco de Desalojamento', value: `${affectedPeople.toLocaleString('pt-MZ')} pessoas` },
        { label: 'Ventos Máximos Sustentados', value: `${effectiveWind} km/h (Rajadas ${effectiveGust} km/h)` },
        { label: 'Sobreelevação de Maré (Storm Surge)', value: `+${effectiveSurge} metros` },
        { label: 'Área Agrícola Inundada', value: `${submergedHa.toLocaleString('pt-MZ')} hectares` },
        { label: 'Kits de Água Potável Necessários', value: `${waterKitsNeeded.toLocaleString('pt-MZ')} kits` },
        { label: 'Perdas Económicas Estimadas', value: `${(estimatedLossMZN / 1000000).toFixed(0)} Milhões MZN` }
      ],
      tableHeaders: ['Fase Temporal', 'Estado do Ciclone', 'Vento (km/h)', 'Maré de Tempestade', 'Impacto Crítico Previsto'],
      tableRows: timelineSteps.map((s) => [
        s.label,
        s.title,
        `${Math.round(effectiveWind * [0.35, 0.7, 1.0, 0.85, 0.45][s.step])} km/h`,
        `+${(effectiveSurge * [0.3, 0.65, 1.0, 0.8, 0.35][s.step]).toFixed(1)} m`,
        s.desc
      ]),
      recommendations: [
        'Ativação imediata dos centros de acolhimento em cotas superiores a 12 metros de altitude',
        'Pré-posicionamento de fardos de purificação de água CERUM e geradores solares nos distritos de risco',
        'Corte preventivo de energia nas redes de baixa tensão para evitar choques em áreas alagadas',
        'Alerta às embarcações de pesca para suspensão total da atividade no Canal de Moçambique'
      ],
      filename: `simulador-ciclone-${currentPreset.id}-${Date.now()}.pdf`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Scenario Selector Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold mb-2">
              <Wind className="w-3.5 h-3.5 text-rose-600 animate-spin" />
              <span>SIMULADOR DE EVENTOS EXTREMOS • CANAL DE MOÇAMBIQUE</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Simulação de Ciclones Tropicais & Maré de Tempestade
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Modelagem preditiva de impacto costeiro e estuarino baseada na dinâmica de ventos, marés vivas do Índico e precipitação torrencial.
            </p>
          </div>

          <button
            onClick={handleExportCycloneReport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Plano de Resposta em PDF</span>
          </button>
        </div>

        {/* Preset Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {CYCLONE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedPresetId === preset.id
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-400/40 shadow-xs'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white">
                    Categoria {preset.categoryScale}
                  </span>
                  <span className="text-slate-400">{preset.maxWindKmh} km/h</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                  {preset.name}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  Alvo: {preset.coastTarget}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>Surge: +{preset.stormSurgeM}m</span>
                <span>Chuva: {preset.rainfall48hMm}mm</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Timeline Scrubber Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
              Linha Temporal da Tempestade
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {timelineSteps[timelineStep].label}: {timelineSteps[timelineStep].title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {timelineSteps[timelineStep].desc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimelineStep((prev) => (prev > 0 ? prev - 1 : 4))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Passo Anterior"
            >
              ←
            </button>
            <button
              onClick={() => setTimelineStep((prev) => (prev < 4 ? prev + 1 : 0))}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Avançar Fase</span>
            </button>
          </div>
        </div>

        {/* Scrubber Steps */}
        <div className="grid grid-cols-5 gap-2">
          {timelineSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setTimelineStep(s.step)}
              className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                timelineStep === s.step
                  ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] font-mono uppercase">{s.label}</div>
              <div className="text-[11px] font-bold truncate mt-0.5">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Sliders for Wind Intensity & Tide Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-rose-500" />
                <span>Intensidade dos Ventos Ciclónicos:</span>
              </span>
              <span className="font-mono font-bold text-rose-600">{effectiveWind} km/h (x{windMultiplier.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={windMultiplier}
              onChange={(e) => setWindMultiplier(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Menor (-25%)</span>
              <span>Nominal (100%)</span>
              <span>Extremo (+35%)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-500" />
                <span>Coeficiente da Maré (Sizígia / Maré Viva):</span>
              </span>
              <span className="font-mono font-bold text-cyan-600">+{effectiveSurge}m (Coef. {tideCoefficient})</span>
            </div>
            <input
              type="range"
              min="65"
              max="115"
              step="5"
              value={tideCoefficient}
              onChange={(e) => setTideCoefficient(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Maré Morta (65)</span>
              <span>Maré Média (85)</span>
              <span>Maré Viva de Sizígia (115)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Impact Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-rose-500" />
            <span>População Desalojada</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {affectedPeople.toLocaleString('pt-MZ')}
          </div>
          <div className="text-[10px] text-slate-500">hab. em zonas de inundação</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-cyan-500" />
            <span>Área Agrícola Submersa</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-600">
            {submergedHa.toLocaleString('pt-MZ')}
          </div>
          <div className="text-[10px] text-slate-500">hectares de culturas perdidas</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Kits de Água Potável</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            {waterKitsNeeded.toLocaleString('pt-MZ')}
          </div>
          <div className="text-[10px] text-slate-500">kits de purificação CERUM</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Abrigos Necessários</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {emergencySheltersNeeded.toLocaleString('pt-MZ')}
          </div>
          <div className="text-[10px] text-slate-500">centros de acolhimento INGD</div>
        </div>
      </div>
    </div>
  );
};

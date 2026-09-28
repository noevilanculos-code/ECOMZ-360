import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Waves,
  TreePine,
  Wind,
  Sun,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Building2,
  Users,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Calendar,
  Download,
  Info,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import {
  ClimateScenarioCategory,
  ClimateScenarioConfig,
  MozambiqueProvince,
  EnvironmentalProject
} from '../types';
import { CLIMATE_SCENARIOS, MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { exportToPDF } from '../utils/pdfExport';

interface ClimateSimulationMapProps {
  onExportToProject?: (draft: Partial<EnvironmentalProject>) => void;
  onNewOccurrence?: () => void;
  className?: string;
}

export const ClimateSimulationMap: React.FC<ClimateSimulationMapProps> = ({
  onExportToProject,
  onNewOccurrence,
  className = ''
}) => {
  // Scenario Category
  const [activeCategory, setActiveCategory] = useState<ClimateScenarioCategory>('sea_level_rise');
  
  // Available scenarios in category
  const categoryScenarios = useMemo(() => {
    return CLIMATE_SCENARIOS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    CLIMATE_SCENARIOS[0].id
  );

  // When category changes, auto-select first scenario of that category
  useEffect(() => {
    const firstOfCat = CLIMATE_SCENARIOS.find((s) => s.category === activeCategory);
    if (firstOfCat) {
      setSelectedScenarioId(firstOfCat.id);
    }
  }, [activeCategory]);

  const currentScenario = useMemo(() => {
    return CLIMATE_SCENARIOS.find((s) => s.id === selectedScenarioId) || CLIMATE_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Interactive fine-tuning slider
  const [sliderMultiplier, setSliderMultiplier] = useState<number>(1.0);

  // Toggled Layers
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [showCriticalInfra, setShowCriticalInfra] = useState<boolean>(true);
  const [showMitigationBelt, setShowMitigationBelt] = useState<boolean>(true);
  const [showPopConcentration, setShowPopConcentration] = useState<boolean>(true);

  // Selected Zone for detail modal/sheet
  const [selectedZone, setSelectedZone] = useState<ClimateScenarioConfig['keyZones'][0] | null>(null);

  // Target Year filter override
  const [selectedYear, setSelectedYear] = useState<number>(currentScenario.targetYear);

  useEffect(() => {
    setSelectedYear(currentScenario.targetYear);
    setSliderMultiplier(1.0);
  }, [currentScenario]);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const nativeFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic calculated metrics based on slider multiplier
  const calculatedMetrics = useMemo(() => {
    const mult = sliderMultiplier;
    return {
      affectedPopulation: Math.round(currentScenario.impactMetrics.affectedPopulation * mult),
      submergedOrDegradedAreaKm2: Math.round(currentScenario.impactMetrics.submergedOrDegradedAreaKm2 * mult),
      co2ImpactTonnes: Math.round(currentScenario.impactMetrics.co2EquivalentImpactTonnes * mult),
      economicRiskMZN: Math.round(currentScenario.impactMetrics.economicRiskMZNMillions * mult),
      infraRisk: Math.max(0, Math.round(currentScenario.impactMetrics.criticalInfrastructuresAtRisk * mult))
    };
  }, [currentScenario, sliderMultiplier]);

  // Projection curve data for Recharts
  const projectionTrendData = useMemo(() => {
    const basePop = currentScenario.impactMetrics.affectedPopulation;
    const baseEcon = currentScenario.impactMetrics.economicRiskMZNMillions;
    const isMitigated = currentScenario.id === 'scen-def-zero';

    if (isMitigated) {
      return [
        { ano: '2026', popRisco: Math.round(basePop * 0.9), riscoEcon: Math.abs(baseEcon * 0.2), co2: 8000 },
        { ano: '2028', popRisco: Math.round(basePop * 0.6), riscoEcon: Math.abs(baseEcon * 0.5), co2: 4500 },
        { ano: '2030', popRisco: Math.round(basePop * 0.3), riscoEcon: Math.abs(baseEcon * 0.8), co2: 1200 },
        { ano: '2035', popRisco: Math.round(basePop * 0.1), riscoEcon: Math.abs(baseEcon), co2: -6800 }
      ];
    }

    return [
      { ano: '2026', popRisco: Math.round(basePop * 0.4 * sliderMultiplier), riscoEcon: Math.round(baseEcon * 0.35 * sliderMultiplier), co2: 3200 },
      { ano: '2030', popRisco: Math.round(basePop * 0.7 * sliderMultiplier), riscoEcon: Math.round(baseEcon * 0.65 * sliderMultiplier), co2: 6800 },
      { ano: '2040', popRisco: Math.round(basePop * 1.0 * sliderMultiplier), riscoEcon: Math.round(baseEcon * 1.0 * sliderMultiplier), co2: 11400 },
      { ano: '2050', popRisco: Math.round(basePop * 1.45 * sliderMultiplier), riscoEcon: Math.round(baseEcon * 1.5 * sliderMultiplier), co2: 18200 }
    ];
  }, [currentScenario, sliderMultiplier]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-18.6656, 35.5295], // Centro geográfico balanceado de Moçambique
        zoom: 6,
        minZoom: 5,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      // OpenStreetMap tiles do not require an API key.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 22
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: 'ECO-MZ 360' }).addTo(map);

      // LayerGroup for dynamic simulation overlays
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive unless unmounted
    };
  }, []);

  // Update map overlays whenever scenario, slider, or layer toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const mult = sliderMultiplier;

    // Determine colors by category
    let fillColor = '#0284c7'; // Sea level blue
    let strokeColor = '#0369a1';
    let beaconColor = 'rgba(2, 132, 199, 0.4)';

    if (currentScenario.category === 'deforestation_rate') {
      if (currentScenario.id === 'scen-def-zero') {
        fillColor = '#10b981'; // Green for reforestation
        strokeColor = '#059669';
        beaconColor = 'rgba(16, 185, 129, 0.4)';
      } else {
        fillColor = '#f97316'; // Orange/red for deforestation
        strokeColor = '#c2410c';
        beaconColor = 'rgba(249, 115, 22, 0.4)';
      }
    } else if (currentScenario.category === 'cyclone_flooding') {
      fillColor = '#ef4444'; // Red for severe cyclone
      strokeColor = '#b91c1c';
      beaconColor = 'rgba(239, 68, 68, 0.4)';
    } else if (currentScenario.category === 'drought_water_stress') {
      fillColor = '#eab308'; // Amber for drought
      strokeColor = '#b45309';
      beaconColor = 'rgba(234, 179, 8, 0.4)';
    }

    // 1. Render Hazard Circles / Polygons
    if (showHazardZones) {
      currentScenario.keyZones.forEach((zone) => {
        const radius = zone.radiusMeters * Math.sqrt(mult);

        // Pulsing hazard circle
        const circle = L.circle([zone.lat, zone.lng], {
          radius: radius,
          color: strokeColor,
          weight: 2,
          opacity: 0.85,
          fillColor: fillColor,
          fillOpacity: 0.28,
          dashArray: currentScenario.id === 'scen-def-zero' ? '6, 6' : undefined
        });

        // Popup with realistic contextual information
        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 10px 12px; min-width: 240px; max-width: 300px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${strokeColor}; letter-spacing: 0.5px; margin-bottom: 2px;">
              ${currentScenario.category === 'sea_level_rise' ? '🌊 Faixa de Inundação Marinha' : currentScenario.category === 'deforestation_rate' ? '🌲 Dinâmica Florestal de Miombo' : currentScenario.category === 'cyclone_flooding' ? '🌀 Cone de Impacto Ciclónico' : '☀️ Stress Hídrico e Seca'}
            </div>
            <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.25;">
              ${zone.name}
            </h4>
            <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
              ${zone.riskDescription}
            </div>
            <div style="background: #f8fafc; border-left: 3px solid ${strokeColor}; padding: 6px 8px; border-radius: 4px; font-size: 10px; color: #334155; margin-bottom: 8px;">
              <strong>Infraestrutura Ameaçada:</strong><br/>${zone.criticalInfrastructure}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 10px; color: #64748b;">
              <span>Província: <strong>${zone.province}</strong></span>
              <span>Raio: <strong>${Math.round(radius / 1000)} km</strong></span>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, { maxWidth: 320 });
        circle.on('click', () => {
          setSelectedZone(zone);
        });

        circle.addTo(layerGroup);

        // Center Pulsing Pin
        const pulseHtml = `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${beaconColor}; animation: eco-radar-wave 2s infinite ease-out;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: ${strokeColor}; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `;

        const pulseIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: pulseHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: pulseIcon });
        marker.bindPopup(popupContent, { maxWidth: 320 });
        marker.addTo(layerGroup);
      });
    }

    // 2. Critical Infrastructure Markers
    if (showCriticalInfra) {
      currentScenario.keyZones.forEach((zone, idx) => {
        // Offset slightly to represent infrastructure point
        const infraLat = zone.lat + 0.045;
        const infraLng = zone.lng + 0.035;

        const infraHtml = `
          <div style="background: #062B3D; color: white; border: 2px solid #00B956; border-radius: 6px; padding: 2px 6px; font-size: 9px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px;">
            <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: #00B956;"></span>
            ${zone.district}: Infraestrutura Crítica
          </div>
        `;

        const infraIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: infraHtml,
          iconSize: [120, 20],
          iconAnchor: [60, 10]
        });

        const infraMarker = L.marker([infraLat, infraLng], { icon: infraIcon });
        infraMarker.bindPopup(`
          <div style="padding: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="font-size: 10px; font-weight: bold; color: #0284c7;">Ponto Estratégico</div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${zone.criticalInfrastructure}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Distrito de ${zone.district} (${zone.province})</div>
          </div>
        `);
        infraMarker.addTo(layerGroup);
      });
    }

    // 3. Recommended Adaptation / Mitigation Belt (Mangroves, Dykes, Agroforestry Corridors)
    if (showMitigationBelt) {
      currentScenario.keyZones.forEach((zone) => {
        // Mitigation buffer
        const mitCircle = L.circle([zone.lat, zone.lng], {
          radius: zone.radiusMeters * 1.35 * Math.sqrt(mult),
          color: '#10b981',
          weight: 1.5,
          opacity: 0.6,
          fillColor: '#10b981',
          fillOpacity: 0.08,
          dashArray: '4, 8'
        });

        mitCircle.bindTooltip(
          `Cinturão de Resiliência Proposto: ${currentScenario.mitigationMeasures[0] || 'Restauração de Ecossistemas'}`,
          { direction: 'top', className: 'text-xs' }
        );

        mitCircle.addTo(layerGroup);
      });
    }

    // Fit bounds smoothly to show the active zones
    if (currentScenario.keyZones.length > 0) {
      const bounds = L.latLngBounds(
        currentScenario.keyZones.map((z) => [z.lat, z.lng])
      );
      map.flyToBounds(bounds.pad(0.35), { duration: 0.8, easeLinearity: 0.25 });
    }
  }, [
    currentScenario,
    sliderMultiplier,
    showHazardZones,
    showCriticalInfra,
    showMitigationBelt,
    showPopConcentration
  ]);

  // Zoom handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.setView([-18.6656, 35.5295], 6);
  };

  const toggleFullscreen = async () => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;

    if (!isFullscreen) {
      if (wrapper.requestFullscreen) {
        try {
          nativeFullscreenRef.current = true;
          await wrapper.requestFullscreen();
          setIsFullscreen(true);
        } catch {
          nativeFullscreenRef.current = false;
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
      return;
    }

    if (nativeFullscreenRef.current && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        nativeFullscreenRef.current = false;
        setIsFullscreen(false);
      }
    } else {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!nativeFullscreenRef.current) return;
      const isNativeFullscreen = document.fullscreenElement === mapWrapperRef.current;
      setIsFullscreen(isNativeFullscreen);
      if (!isNativeFullscreen) nativeFullscreenRef.current = false;
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen && !nativeFullscreenRef.current) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => mapInstanceRef.current?.invalidateSize());
    const timeout = window.setTimeout(() => mapInstanceRef.current?.invalidateSize(), 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Zoom to specific province
  const handleFocusProvince = (provinceName: MozambiqueProvince) => {
    const pInfo = MOZAMBIQUE_PROVINCES[provinceName];
    if (pInfo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([pInfo.lat, pInfo.lng], 8, { duration: 0.8 });
    }
  };

  // Export current simulation to PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: `Simulação Climática: ${currentScenario.title}`,
      subtitle: `Projeção Territorial para Moçambique - Horizonte ${selectedYear}`,
      summary: `${currentScenario.subtitle}. Dados simulados com base nas bacias hidrográficas e dados georreferenciados do consórcio ECO-MZ 360.`,
      metrics: [
        { label: 'População em Risco', value: `${calculatedMetrics.affectedPopulation.toLocaleString('pt-MZ')} hab.` },
        { label: 'Área Terrestre Atingida', value: `${calculatedMetrics.submergedOrDegradedAreaKm2.toLocaleString('pt-MZ')} km²` },
        { label: 'Impacto Carbono (CO2)', value: `${(calculatedMetrics.co2ImpactTonnes / 1000).toFixed(1)} mil ton.` },
        { label: 'Risco Econômico Estimado', value: `${calculatedMetrics.economicRiskMZN.toLocaleString('pt-MZ')} M MZN` },
        { label: 'Infraestruturas Críticas', value: `${calculatedMetrics.infraRisk} unidades` }
      ],
      tableHeaders: ['Zona Crítica', 'Província', 'Distrito', 'Impacto Principal Previsto', 'Infraestrutura em Risco'],
      tableRows: currentScenario.keyZones.map((z) => [
        z.name,
        z.province,
        z.district,
        z.riskDescription,
        z.criticalInfrastructure
      ]),
      recommendations: currentScenario.mitigationMeasures,
      filename: `simulacao-climatica-${currentScenario.id}-${selectedYear}.pdf`
    });
  };

  // Convert to project draft
  const handleConvertToProject = () => {
    if (!onExportToProject) return;
    const firstZone = currentScenario.keyZones[0];
    onExportToProject({
      title: `Projeto de Mitigação: ${currentScenario.title}`,
      category: currentScenario.category === 'sea_level_rise' ? 'Erosão Costeira/Pluvial' : currentScenario.category === 'deforestation_rate' ? 'Desmatamento' : 'Queimadas Descontroladas',
      province: firstZone?.province || 'Sofala',
      district: firstZone?.district || 'Beira',
      leadEntity: 'Consórcio de Adaptação Climática ECO-MZ 360',
      description: `Iniciativa de resposta rápida e adaptação climática estruturada a partir do módulo de Simulação Climática para o horizonte ${selectedYear}. ${currentScenario.mitigationMeasures.join('. ')}.`,
      budgetTotalMZN: Math.abs(calculatedMetrics.economicRiskMZN) * 100000 || 5000000,
      keyMetric: 'Famílias protegidas / Área restaurada',
      keyMetricAchieved: `0 / ${calculatedMetrics.affectedPopulation.toLocaleString('pt-MZ')} beneficiários previstos`
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card */}
      <div className="bg-[#062B3D] text-white rounded-3xl p-6 sm:p-8 border border-[#07364A] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
              <span className="text-emerald-400">ECO-SIMULATION</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Modelagem Preditiva Territorial de Moçambique</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Simulador de Cenários & Resiliência Climática
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Alterne entre dinâmicas climáticas em tempo real (elevação do nível do mar, desmatamento de Miombo, ciclones e secas) e visualize projeções sobrepostas no mapa nacional com avaliação de risco e infraestruturas em risco.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onNewOccurrence && (
              <button
                type="button"
                onClick={onNewOccurrence}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B956] hover:bg-[#009c48] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                <span>Registar ocorrência</span>
              </button>
            )}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Baixar Boletim em PDF</span>
            </button>

            {onExportToProject && (
              <button
                onClick={handleConvertToProject}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B956] hover:bg-[#009c48] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transformar em Projeto Real</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Category Switcher */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveCategory('sea_level_rise')}
          className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all ${
            activeCategory === 'sea_level_rise'
              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-xs'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeCategory === 'sea_level_rise' ? 'bg-sky-500 text-white' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'}`}>
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Elevação do Mar</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Inundação Costeira & Salinidade</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('deforestation_rate')}
          className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all ${
            activeCategory === 'deforestation_rate'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-xs'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeCategory === 'deforestation_rate' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Desmatamento & Miombo</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Taxas de Corte vs. Restauração</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('cyclone_flooding')}
          className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all ${
            activeCategory === 'cyclone_flooding'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 shadow-xs'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeCategory === 'cyclone_flooding' ? 'bg-rose-600 text-white' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'}`}>
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Ciclones & Inundações</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Transbordo de Bacias Fluviais</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('drought_water_stress')}
          className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all ${
            activeCategory === 'drought_water_stress'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-xs'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeCategory === 'drought_water_stress' ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Secas & Stress Hídrico</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Semiárido do Sul e Centro</div>
          </div>
        </button>
      </div>

      {/* Main Simulation Viewport: Map + Control Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Leaflet Map with Simulation Overlays */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div
            ref={mapWrapperRef}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col relative ${isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none' : 'rounded-3xl'}`}
          >
            {/* Map Top Control Bar */}
            <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentScenario.title}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {currentScenario.keyZones.length} zonas de alto impacto
                </span>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShowHazardZones(!showHazardZones)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                    showHazardZones
                      ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  }`}
                  title="Ativar/Desativar Manchas de Risco"
                >
                  <span className={`w-2 h-2 rounded-full ${showHazardZones ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
                  Manchas de Risco
                </button>

                <button
                  onClick={() => setShowCriticalInfra(!showCriticalInfra)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                    showCriticalInfra
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  }`}
                  title="Ativar/Desativar Infraestruturas Críticas"
                >
                  <Building2 className="w-3 h-3" />
                  Infraestruturas
                </button>

                <button
                  onClick={() => setShowMitigationBelt(!showMitigationBelt)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                    showMitigationBelt
                      ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  }`}
                  title="Ativar/Desativar Cinturão Protetor Recomendado"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Cinturão Protetor
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className={`relative w-full bg-slate-100 dark:bg-slate-950 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[460px] sm:h-[540px]'}`}>
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Map Navigation Controls */}
              <div className="absolute top-4 right-4 z-[500] flex flex-col gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Aproximar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Afastar Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Restaurar Visão Geral Nacional"
                  aria-label="Restaurar visão geral nacional"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title={isFullscreen ? 'Sair do ecrã inteiro (Esc)' : 'Ecrã inteiro'}
                  aria-label={isFullscreen ? 'Sair do ecrã inteiro' : 'Abrir ecrã inteiro'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Province Focal Shortcuts */}
              <div className="absolute bottom-4 left-4 z-[500] hidden sm:flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[11px]">
                <span className="font-semibold text-slate-500">Focar:</span>
                {(['Sofala', 'Zambézia', 'Cabo Delgado', 'Gaza', 'Maputo Cidade'] as MozambiqueProvince[]).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => handleFocusProvince(prov)}
                    className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    {prov}
                  </button>
                ))}
              </div>

              {/* Legend Badge Overlay */}
              <div className="absolute bottom-4 right-4 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[10px] space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Legenda da Simulação</div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-slate-600 dark:text-slate-300">Zona de Risco Direto</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-300">Medida de Adaptação / Dique</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#062B3D]"></span>
                  <span className="text-slate-600 dark:text-slate-300">Infraestrutura em Perigo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Temporal Evolution Area Chart (Recharts) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Curva de Projeção Temporal de Impacto Humano & Econômico
                </h3>
                <p className="text-xs text-slate-500">
                  Evolução comparativa da população em risco (linha escura) e perdas potenciais em milhões MZN até 2050.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Cenário: <strong className="text-slate-800 dark:text-slate-200">{currentScenario.levelLabel}</strong>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="popColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="econColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B956" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00B956" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="popRisco"
                    name="População em Risco (hab)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#popColor)"
                  />
                  <Area
                    type="monotone"
                    dataKey="riscoEcon"
                    name="Perdas Estimadas (Milhões MZN)"
                    stroke="#00B956"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#econColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters, Scenario Selector & Real-Time Impact Dashboard */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Specific Scenario Selector in active Category */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Cenários Disponíveis</span>
              <span className="text-slate-500">{categoryScenarios.length} opções</span>
            </div>

            <div className="space-y-2">
              {categoryScenarios.map((sc) => {
                const isSelected = sc.id === selectedScenarioId;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold leading-tight">{sc.title}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {sc.levelLabel}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                      {sc.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Fine-Tuning Slider */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Intensidade da Simulação
                </span>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {(sliderMultiplier * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sliderMultiplier}
                onChange={(e) => setSliderMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.5x (Atenuado)</span>
                <span>1.0x (Padrão)</span>
                <span>2.0x (Extremo)</span>
              </div>
            </div>

            {/* Target Year Horizon */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Horizonte Temporal de Planeamento:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[2030, 2040, 2050, 2100].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedYear === yr
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Impact Metric Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Impacto Territorial Calculado
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  <span>População em Risco</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {calculatedMetrics.affectedPopulation.toLocaleString('pt-MZ')}
                </div>
                <div className="text-[10px] text-slate-400">Residentes vulneráveis</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Área Afetada</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {calculatedMetrics.submergedOrDegradedAreaKm2.toLocaleString('pt-MZ')} km²
                </div>
                <div className="text-[10px] text-slate-400">Faixa territorial</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Infraestruturas</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {calculatedMetrics.infraRisk}
                </div>
                <div className="text-[10px] text-slate-400">Portos, vias, hospitais</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  <span>Risco Económico</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {calculatedMetrics.economicRiskMZN > 0 ? `${calculatedMetrics.economicRiskMZN} M` : 'Ganho'}
                </div>
                <div className="text-[10px] text-slate-400">Milhões MZN em perdas</div>
              </div>
            </div>

            {/* Mitigation Strategies List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Medidas de Mitigação Prioritárias:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {currentScenario.mitigationMeasures.map((measure, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span className="leading-tight">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Zone Detail Modal if clicked on Leaflet */}
      {selectedZone && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Zona Crítica Selecionada
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Distrito de {selectedZone.district}, Província de {selectedZone.province}
                </p>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Diagnóstico de Ameaça:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedZone.riskDescription}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Infraestrutura em Risco:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedZone.criticalInfrastructure}</p>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <span>Coordenadas: {selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}</span>
                <span>Raio de Afeção: {Math.round(selectedZone.radiusMeters / 1000)} km</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedZone(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
              >
                Fechar
              </button>
              {onExportToProject && (
                <button
                  onClick={() => {
                    handleConvertToProject();
                    setSelectedZone(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Criar Intervenção Local
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

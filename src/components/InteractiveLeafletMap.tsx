import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addResilientTileLayer } from '../lib/resilientTileLayer';
import {
  Occurrence,
  MozambiqueProvince,
  EnvironmentalCategory,
  SeverityLevel
} from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import {
  CanvasHeatmapLayer,
  detectCriticalZones,
  CriticalZone,
  getOccurrenceHeatWeight,
  HeatmapPoint
} from '../lib/leafletHeatmap';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  MapPin,
  Flame,
  Droplets,
  Trees,
  Trash2,
  AlertTriangle,
  Eye,
  Crosshair,
  ShieldCheck,
  Radio,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Wind,
  Waves,
  Mountain,
  Gauge,
  Thermometer
} from 'lucide-react';
import {
  CanvasWindLayer,
  MOZAMBIQUE_TIDE_STATIONS,
  MOZAMBIQUE_WIND_STATIONS,
  MOZAMBIQUE_CURRENT_POINTS,
  MOZAMBIQUE_TOPOGRAPHY_FEATURES,
  TideStation,
  WindStation
} from '../lib/leafletEnvironmentalDynamics';

export interface ProtectedArea {
  id: string;
  name: string;
  category: 'Parque Nacional' | 'Reserva Especial' | 'Área de Proteção Ambiental';
  province: MozambiqueProvince;
  lat: number;
  lng: number;
  areaKm2: string;
  threatLevel: 'Baixo' | 'Médio' | 'Alto';
}

export const MOZAMBIQUE_PROTECTED_AREAS: ProtectedArea[] = [
  {
    id: 'pa-01',
    name: 'Parque Nacional da Gorongosa',
    category: 'Parque Nacional',
    province: 'Sofala',
    lat: -18.7612,
    lng: 34.5034,
    areaKm2: '4.067 km²',
    threatLevel: 'Médio'
  },
  {
    id: 'pa-02',
    name: 'Parque Nacional das Quirimbas',
    category: 'Parque Nacional',
    province: 'Cabo Delgado',
    lat: -12.2855,
    lng: 40.1742,
    areaKm2: '7.500 km²',
    threatLevel: 'Alto'
  },
  {
    id: 'pa-03',
    name: 'Reserva Nacional do Niassa',
    category: 'Reserva Especial',
    province: 'Niassa',
    lat: -12.2033,
    lng: 36.5042,
    areaKm2: '42.000 km²',
    threatLevel: 'Médio'
  },
  {
    id: 'pa-04',
    name: 'Parque Nacional do Arquipélago de Bazaruto',
    category: 'Parque Nacional',
    province: 'Inhambane',
    lat: -21.6521,
    lng: 35.4512,
    areaKm2: '1.430 km²',
    threatLevel: 'Baixo'
  },
  {
    id: 'pa-05',
    name: 'Parque Nacional de Maputo (Elefantes)',
    category: 'Parque Nacional',
    province: 'Maputo Província',
    lat: -26.4711,
    lng: 32.7834,
    areaKm2: '1.040 km²',
    threatLevel: 'Baixo'
  },
  {
    id: 'pa-06',
    name: 'Parque Nacional do Limpopo',
    category: 'Parque Nacional',
    province: 'Gaza',
    lat: -23.5218,
    lng: 31.9056,
    areaKm2: '10.000 km²',
    threatLevel: 'Médio'
  },
  {
    id: 'pa-07',
    name: 'Reserva Especial de Marromeu',
    category: 'Reserva Especial',
    province: 'Sofala',
    lat: -18.8923,
    lng: 35.9411,
    areaKm2: '1.500 km²',
    threatLevel: 'Alto'
  }
];

export interface InteractiveLeafletMapProps {
  occurrences: Occurrence[];
  selectedProvince?: MozambiqueProvince | 'Todas';
  onSelectOccurrence?: (occ: Occurrence) => void;
  height?: string;
  showLayerControls?: boolean;
  showProvinceFlyTo?: boolean;
  activeFilterCategory?: string;
  activeFilterSeverity?: string;
  initialZoom?: number;
  mode?: 'marcadores' | 'calor';
  className?: string;
  showBottomRibbon?: boolean;
  showHeatmapDefault?: boolean;
  showCriticalZonesDefault?: boolean;
  onSelectCriticalZone?: (zone: CriticalZone) => void;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  occurrences,
  selectedProvince = 'Todas',
  onSelectOccurrence,
  height = '500px',
  showLayerControls = true,
  showBottomRibbon = true,
  activeFilterCategory = 'Todas',
  activeFilterSeverity = 'Todas',
  initialZoom = 6,
  mode = 'marcadores',
  className = '',
  showHeatmapDefault = false,
  showCriticalZonesDefault = true,
  onSelectCriticalZone
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupOccurrencesRef = useRef<L.LayerGroup | null>(null);
  const layerGroupParksRef = useRef<L.LayerGroup | null>(null);
  const layerGroupHeatRef = useRef<L.LayerGroup | null>(null);
  const layerGroupCriticalZonesRef = useRef<L.LayerGroup | null>(null);
  const layerGroupTidesRef = useRef<L.LayerGroup | null>(null);
  const layerGroupTopographyRef = useRef<L.LayerGroup | null>(null);
  const canvasWindLayerRef = useRef<CanvasWindLayer | null>(null);
  const canvasHeatmapRef = useRef<CanvasHeatmapLayer | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const currentOverlayTileRef = useRef<L.TileLayer | null>(null);

  const [currentBaseMap, setCurrentBaseMap] = useState<'hybrid' | 'satellite' | 'osm' | 'topo' | 'ocean'>('topo');
  const [showLabelsOverlay, setShowLabelsOverlay] = useState<boolean>(true);
  const [showOccurrencesLayer, setShowOccurrencesLayer] = useState<boolean>(true);
  const [showParksLayer, setShowParksLayer] = useState<boolean>(true);

  // Environmental dynamics layers
  const [showWindLayer, setShowWindLayer] = useState<boolean>(true);
  const [showTidesLayer, setShowTidesLayer] = useState<boolean>(true);
  const [showTopographyLayer, setShowTopographyLayer] = useState<boolean>(false);
  const [selectedTideStation, setSelectedTideStation] = useState<TideStation | null>(null);
  const [selectedWindStation, setSelectedWindStation] = useState<WindStation | null>(null);

  // Heatmap layer & critical zones states
  const [showHeatmapLayer, setShowHeatmapLayer] = useState<boolean>(
    mode === 'calor' || Boolean(showHeatmapDefault)
  );
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.82);
  const [heatmapRadius, setHeatmapRadius] = useState<number>(38);
  const [heatmapWeightMode, setHeatmapWeightMode] = useState<'severity' | 'count'>('severity');
  const [showCriticalZones, setShowCriticalZones] = useState<boolean>(showCriticalZonesDefault);
  const [isHeatmapSettingsOpen, setIsHeatmapSettingsOpen] = useState<boolean>(false);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    coords?: { lat: number; lng: number };
    accuracy?: number;
  } | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const [internalSeverityFilter, setInternalSeverityFilter] = useState<string>(activeFilterSeverity);

  const onSelectOccurrenceRef = useRef(onSelectOccurrence);
  onSelectOccurrenceRef.current = onSelectOccurrence;

  const onSelectCriticalZoneRef = useRef(onSelectCriticalZone);
  onSelectCriticalZoneRef.current = onSelectCriticalZone;

  // Sync mode prop with heatmap layer
  useEffect(() => {
    if (mode === 'calor') {
      setShowHeatmapLayer((prev) => (prev ? prev : true));
    }
  }, [mode]);

  useEffect(() => {
    setInternalSeverityFilter((prev) => (prev !== activeFilterSeverity ? activeFilterSeverity : prev));
  }, [activeFilterSeverity]);

  // Filter occurrences dynamically based on props and interactive legend filter (memoized)
  const filtered = useMemo(() => {
    return occurrences.filter((occ) => {
      if (selectedProvince !== 'Todas' && occ.province !== selectedProvince) return false;
      if (activeFilterCategory !== 'Todas' && occ.category !== activeFilterCategory) return false;
      const effSeverity = internalSeverityFilter;
      if (effSeverity !== 'Todas' && occ.severity !== effSeverity) return false;
      return true;
    });
  }, [occurrences, selectedProvince, activeFilterCategory, internalSeverityFilter]);

  // Derived critical zones list memoized to prevent re-render loops
  const criticalZonesList = useMemo(() => {
    if (!showHeatmapLayer || !showCriticalZones) return [];
    return detectCriticalZones(filtered);
  }, [filtered, showHeatmapLayer, showCriticalZones]);

  // Base map tile URLs configured with reliable high-res servers and maxNativeZoom
  const baseMapConfigs = {
    hybrid: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery, Maxar, Earthstar Geographics',
      maxNativeZoom: 16,
      maxZoom: 20
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery, Maxar',
      maxNativeZoom: 16,
      maxZoom: 20
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxNativeZoom: 19,
      maxZoom: 20
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri Relevo & Topografia, USGS, CGIAR',
      maxNativeZoom: 19,
      maxZoom: 20
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri Ocean, GEBCO, NOAA, Canal de Moçambique',
      maxNativeZoom: 16,
      maxZoom: 18
    }
  };

  // Helper to safely obtain valid coordinates for any occurrence
  const getSafeCoordinates = (occ: Occurrence): [number, number] => {
    let lat = Number(occ.coordinates?.lat);
    let lng = Number(occ.coordinates?.lng);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      const provInfo = MOZAMBIQUE_PROVINCES[occ.province];
      if (provInfo) {
        // Deterministic offset based on occurrence ID
        const hash = occ.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        lat = provInfo.lat + (((hash % 11) - 5) * 0.08);
        lng = provInfo.lng + ((((hash * 3) % 11) - 5) * 0.08);
      } else {
        lat = -18.665;
        lng = 35.529;
      }
    }
    return [lat, lng];
  };

  // Severity color helper
  const getSeverityColor = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Crítico':
        return '#ef4444'; // Red-500
      case 'Alto':
        return '#f97316'; // Orange-500
      case 'Médio':
        return '#f59e0b'; // Amber-500
      case 'Baixo':
        return '#10b981'; // Emerald-500
      default:
        return '#3b82f6';
    }
  };

  // Category Icon Symbol
  const getCategoryIconSymbol = (cat: EnvironmentalCategory) => {
    switch (cat) {
      case 'Desmatamento':
      case 'Destruição de Mangais':
        return '🌲';
      case 'Queimadas Descontroladas':
        return '🔥';
      case 'Poluição Hídrica':
        return '💧';
      case 'Erosão Costeira/Pluvial':
        return '🌊';
      case 'Resíduos Sólidos Urbanos':
        return '🗑️';
      case 'Caça Furtiva & Biodiversidade':
        return '🐾';
      case 'Mineração Ilegal':
        return '⛏️';
      default:
        return '⚠️';
    }
  };

  // 1. Initialize Leaflet Map Instance Safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove any stale leaflet id to avoid "Map container is already initialized"
    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // safe ignore
      }
      mapInstanceRef.current = null;
    }

    // Determine initial center
    let centerLat = -18.665;
    let centerLng = 35.529;
    let zoomLevel = initialZoom;

    if (selectedProvince !== 'Todas' && MOZAMBIQUE_PROVINCES[selectedProvince]) {
      centerLat = MOZAMBIQUE_PROVINCES[selectedProvince].lat;
      centerLng = MOZAMBIQUE_PROVINCES[selectedProvince].lng;
      zoomLevel = 8.5;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false,
      maxBounds: [
        [-32.0, 24.0],
        [-5.0, 47.0]
      ],
      maxBoundsViscosity: 0.1
    });

    // Base Tile Layer with maxNativeZoom to allow deep zooming without 404s
    const tileConfig = baseMapConfigs[currentBaseMap];
    addResilientTileLayer(map, {
      url: tileConfig.url,
      attribution: tileConfig.attribution,
      maxNativeZoom: tileConfig.maxNativeZoom,
      maxZoom: tileConfig.maxZoom,
      subdomains: (tileConfig as any).subdomains
    }, (layer) => {
      currentTileLayerRef.current = layer;
    });

    // Boundaries & Location Names overlay for pure satellite mode
    if (showLabelsOverlay && currentBaseMap === 'satellite') {
      const overlayTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri Reference',
          maxNativeZoom: 16,
          maxZoom: 20
        }
      ).addTo(map);
      currentOverlayTileRef.current = overlayTile;
    }

    // Layer Groups
    const heatGroup = L.layerGroup().addTo(map);
    const parksGroup = L.layerGroup().addTo(map);
    const occGroup = L.layerGroup().addTo(map);
    const criticalZonesGroup = L.layerGroup().addTo(map);
    const tidesGroup = L.layerGroup().addTo(map);
    const topoGroup = L.layerGroup().addTo(map);

    layerGroupHeatRef.current = heatGroup;
    layerGroupParksRef.current = parksGroup;
    layerGroupOccurrencesRef.current = occGroup;
    layerGroupCriticalZonesRef.current = criticalZonesGroup;
    layerGroupTidesRef.current = tidesGroup;
    layerGroupTopographyRef.current = topoGroup;

    // Canvas Heatmap Layer
    const canvasHeat = new CanvasHeatmapLayer([], {
      radius: heatmapRadius,
      maxOpacity: heatmapOpacity,
      blur: 16
    });
    canvasHeat.addTo(map);
    canvasHeatmapRef.current = canvasHeat;

    // Cursor coordinates tracking
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    });

    mapInstanceRef.current = map;

    // Multiple layout passes to ensure tiles render immediately without gray boxes
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (canvasWindLayerRef.current) {
        try {
          canvasWindLayerRef.current.remove();
        } catch (e) {}
        canvasWindLayerRef.current = null;
      }
      if (canvasHeatmapRef.current) {
        try {
          canvasHeatmapRef.current.remove();
        } catch (e) {}
        canvasHeatmapRef.current = null;
      }
      if (currentOverlayTileRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(currentOverlayTileRef.current);
        } catch (e) {}
        currentOverlayTileRef.current = null;
      }
      try {
        map.remove();
      } catch (e) {
        // safe ignore
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Base Map Switch and Labels Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      try {
        map.removeLayer(currentTileLayerRef.current);
      } catch (e) {}
      currentTileLayerRef.current = null;
    }

    if (currentOverlayTileRef.current) {
      try {
        map.removeLayer(currentOverlayTileRef.current);
      } catch (e) {}
      currentOverlayTileRef.current = null;
    }

    const tileConfig = baseMapConfigs[currentBaseMap];
    addResilientTileLayer(map, {
      url: tileConfig.url,
      attribution: tileConfig.attribution,
      maxNativeZoom: tileConfig.maxNativeZoom,
      maxZoom: tileConfig.maxZoom,
      subdomains: (tileConfig as any).subdomains
    }, (layer) => {
      currentTileLayerRef.current = layer;
    });

    // Add boundaries and places overlay when satellite, hybrid or ocean
    if ((showLabelsOverlay && currentBaseMap === 'satellite') || currentBaseMap === 'hybrid') {
      const overlayTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri Reference',
          maxNativeZoom: 16,
          maxZoom: 20
        }
      ).addTo(map);
      currentOverlayTileRef.current = overlayTile;
    } else if (currentBaseMap === 'ocean') {
      const overlayTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri Ocean Reference',
          maxNativeZoom: 16,
          maxZoom: 18
        }
      ).addTo(map);
      currentOverlayTileRef.current = overlayTile;
    }

    // Ensure all tiles render smoothly across the active viewport
    try {
      map.invalidateSize();
    } catch (e) {}
  }, [currentBaseMap, showLabelsOverlay]);

  // 3. Render Canvas Thermal Heatmap & Critical Zones Layer
  useEffect(() => {
    const canvasHeat = canvasHeatmapRef.current;
    const criticalGroup = layerGroupCriticalZonesRef.current;
    const map = mapInstanceRef.current;
    if (!canvasHeat || !criticalGroup || !map) return;

    criticalGroup.clearLayers();

    if (!showHeatmapLayer) {
      canvasHeat.setPoints([]);
      return;
    }

    // Step A: Feed points into the high-performance canvas heatmap layer
    const points: HeatmapPoint[] = filtered.map((occ) => {
      const [lat, lng] = getSafeCoordinates(occ);
      const weight =
        heatmapWeightMode === 'severity'
          ? getOccurrenceHeatWeight(occ.severity)
          : 0.7;
      return {
        lat,
        lng,
        weight,
        severity: occ.severity,
        title: occ.title,
        category: occ.category
      };
    });

    canvasHeat.setOptions({
      radius: heatmapRadius,
      maxOpacity: heatmapOpacity
    });
    canvasHeat.setPoints(points);

    // Step B: Calculate and Render Critical Zones
    if (showCriticalZones) {
      criticalZonesList.forEach((zone) => {
        const isExtreme = zone.riskLevel === 'Crítico Extremo';
        const isHigh = zone.riskLevel === 'Alto Risco';
        const borderColor = isExtreme ? '#ef4444' : isHigh ? '#f97316' : '#f59e0b';

        // Outer halo ring highlighting critical density cluster
        const halo = L.circle([zone.centerLat, zone.centerLng], {
          radius: zone.radiusKm * 1000,
          color: borderColor,
          fillColor: borderColor,
          fillOpacity: isExtreme ? 0.16 : 0.09,
          weight: 2,
          dashArray: '5, 5'
        });
        criticalGroup.addLayer(halo);

        // Interactive Critical Zone Hotspot Emblem Badge
        const badgeHtml = `
          <div class="relative flex items-center justify-center cursor-pointer select-none group">
            <span class="absolute w-12 h-12 rounded-full ${isExtreme ? 'bg-rose-500/35 animate-ping' : 'bg-orange-500/25'}"></span>
            <div class="relative px-2.5 py-1 rounded-full ${isExtreme ? 'bg-rose-600 border-2 border-white text-white' : 'bg-orange-600 border-2 border-white text-white'} shadow-xl flex items-center gap-1.5 text-[10px] font-black tracking-wide whitespace-nowrap transition-transform group-hover:scale-110">
              <span class="text-xs">🚨</span>
              <span>${zone.name}</span>
              <span class="px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] font-mono font-bold">${zone.totalIncidents} focos</span>
            </div>
          </div>
        `;

        const badgeIcon = L.divIcon({
          html: badgeHtml,
          className: 'critical-zone-badge-pin',
          iconSize: [160, 36],
          iconAnchor: [80, 18],
          popupAnchor: [0, -18]
        });

        const zoneMarker = L.marker([zone.centerLat, zone.centerLng], { icon: badgeIcon });

        const zonePopupHtml = `
          <div class="p-3.5 max-w-[320px] font-sans text-slate-800">
            <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider ${isExtreme ? 'bg-rose-600' : 'bg-orange-600'}">
                ${zone.riskLevel}
              </span>
              <span class="text-[10px] font-bold text-slate-500 font-mono">
                Índice Risco: ${zone.riskScore}
              </span>
            </div>
            
            <h4 class="font-black text-sm text-slate-900 leading-snug mb-1">
              Zona Crítica: ${zone.name}
            </h4>
            <p class="text-[11px] text-slate-600 mb-2">
              Província: <strong>${zone.province}</strong> • Distrito: <strong>${zone.district}</strong>
            </p>

            <div class="grid grid-cols-4 gap-1 mb-2.5 text-center text-[10px]">
              <div class="p-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
                <span class="block font-black text-xs text-rose-600">${zone.criticalCount}</span>
                <span>Críticos</span>
              </div>
              <div class="p-1 rounded bg-orange-50 text-orange-800 border border-orange-200">
                <span class="block font-black text-xs text-orange-600">${zone.highCount}</span>
                <span>Altos</span>
              </div>
              <div class="p-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                <span class="block font-black text-xs text-amber-600">${zone.mediumCount}</span>
                <span>Médios</span>
              </div>
              <div class="p-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                <span class="block font-black text-xs text-slate-900">${zone.totalIncidents}</span>
                <span>Total</span>
              </div>
            </div>

            <div class="text-[10px] text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80 mb-3 leading-relaxed">
              <strong class="text-amber-900 block mb-0.5 flex items-center gap-1">
                <span>🛡️</span> Recomendação Oficial às Autoridades:
              </strong>
              ${zone.recommendedAction}
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-slate-400">Raio de Afeção: ~${zone.radiusKm}km</span>
              <button
                id="btn-inspect-zone-${zone.id}"
                class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[10px] transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>Focar no Terreno</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `;

        zoneMarker.bindPopup(zonePopupHtml);
        zoneMarker.on('popupopen', () => {
          const btn = document.getElementById(`btn-inspect-zone-${zone.id}`);
          if (btn) {
            btn.onclick = () => {
              map.flyTo([zone.centerLat, zone.centerLng], 11, { duration: 1.2 });
              setFocusedZoneId(zone.id);
              if (onSelectCriticalZoneRef.current) onSelectCriticalZoneRef.current(zone);
            };
          }
        });

        criticalGroup.addLayer(zoneMarker);
      });
    }
  }, [
    filtered,
    showHeatmapLayer,
    heatmapOpacity,
    heatmapRadius,
    heatmapWeightMode,
    showCriticalZones,
    criticalZonesList
  ]);

  const handleFlyToCriticalZone = (zone: CriticalZone) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setFocusedZoneId(zone.id);
    map.flyTo([zone.centerLat, zone.centerLng], 11, { duration: 1.2 });
    if (onSelectCriticalZone) {
      onSelectCriticalZone(zone);
    }
  };

  // 4. Render Occurrence Markers & Dynamic Severity Pins
  useEffect(() => {
    const occGroup = layerGroupOccurrencesRef.current;
    if (!occGroup) return;

    occGroup.clearLayers();

    if (!showOccurrencesLayer) return;

    filtered.forEach((occ) => {
      const [lat, lng] = getSafeCoordinates(occ);
      const color = getSeverityColor(occ.severity);
      const iconSymbol = getCategoryIconSymbol(occ.category);

      // Render interactive pulsing pin with smooth CSS animations
      const isCritical = occ.severity === 'Crítico';
      const isHigh = occ.severity === 'Alto';
      const isNew = occ.status === 'Recebido' || occ.status === 'Em Validação';

      const iconHtml = `
        <div class="eco-marker-stable-container cursor-pointer select-none" title="${occ.title}">
          <!-- Smooth radar beacon pulse for critical, high-risk or new events -->
          ${(isCritical || isHigh || isNew) ? `
            <div class="eco-pulse-beacon ${isCritical ? 'eco-pulse-beacon-critical' : ''}" style="background-color: ${color};"></div>
          ` : ''}

          <!-- Solid, stable core badge firmly anchored to coordinate -->
          <div class="eco-marker-core-badge" style="background-color: ${color};">
            <span class="leading-none">${iconSymbol}</span>
            
            <!-- Attention dot for new/pending occurrence -->
            ${isNew ? `
              <span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
              </span>
            ` : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-pin',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Clean, rich, styled popup
      const popupHtml = `
        <div class="p-3 max-w-[280px] font-sans text-slate-800">
          <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider" style="background-color: ${color};">
              ${occ.severity}
            </span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ${occ.status}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">
            ${occ.title}
          </h4>
          <p class="text-[11px] text-slate-600 mb-2 flex items-center gap-1">
            <span>📍</span>
            <span><strong>${occ.district}</strong>, ${occ.province}</span>
          </p>
          ${occ.imageUrl ? `
            <div class="mb-2 rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-950">
              <img src="${occ.imageUrl}" alt="${occ.title}" class="w-full h-full object-cover" />
            </div>
          ` : ''}
          <div class="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2.5 leading-relaxed">
            ${occ.description}
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Ref: <strong>${occ.protocol}</strong></span>
            <button
              id="btn-popup-${occ.id}"
              class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[10px] transition-all cursor-pointer shadow-xs"
            >
              Ver Dossiê →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Attach button action when popup is opened
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${occ.id}`);
        if (btn && onSelectOccurrenceRef.current) {
          btn.onclick = () => {
            onSelectOccurrenceRef.current?.(occ);
          };
        }
      });

      occGroup.addLayer(marker);
    });
  }, [filtered, showOccurrencesLayer]);

  // 4. Render Protected Parks & Reserves
  useEffect(() => {
    const parksGroup = layerGroupParksRef.current;
    if (!parksGroup) return;

    parksGroup.clearLayers();

    if (!showParksLayer) return;

    MOZAMBIQUE_PROTECTED_AREAS.forEach((park) => {
      const parkIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: 28px; height: 28px;">
          <div class="w-6 h-6 rounded-full bg-emerald-700 border-2 border-emerald-200 shadow-md flex items-center justify-center text-white text-[11px]">
            🌿
          </div>
        </div>
      `;

      const parkIcon = L.divIcon({
        html: parkIconHtml,
        className: 'custom-park-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([park.lat, park.lng], { icon: parkIcon });

      const popupHtml = `
        <div class="p-2.5 max-w-[240px] font-sans">
          <div class="flex items-center justify-between mb-1">
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ${park.category}
            </span>
            <span class="text-[10px] text-amber-700 font-semibold">Risco: ${park.threatLevel}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mt-1 mb-1">${park.name}</h4>
          <p class="text-[11px] text-slate-600">Província: <strong>${park.province}</strong></p>
          <p class="text-[10px] text-slate-500 mt-1">Área protegida: <strong>${park.areaKm2}</strong></p>
        </div>
      `;

      marker.bindPopup(popupHtml);
      parksGroup.addLayer(marker);
    });
  }, [showParksLayer]);

  // 5. Handle Wind Particle Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showWindLayer) {
      if (!canvasWindLayerRef.current) {
        const windLayer = new CanvasWindLayer({ numParticles: 350, speedFactor: 1.15 });
        windLayer.addTo(map);
        canvasWindLayerRef.current = windLayer;
      }
    } else {
      if (canvasWindLayerRef.current) {
        try {
          canvasWindLayerRef.current.remove();
        } catch (e) {}
        canvasWindLayerRef.current = null;
      }
    }
  }, [showWindLayer]);

  // 6. Handle Tides & Ocean Currents Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tidesGroup = layerGroupTidesRef.current;
    if (!map || !tidesGroup) return;

    tidesGroup.clearLayers();
    if (!showTidesLayer) return;

    // Render Tide Stations
    MOZAMBIQUE_TIDE_STATIONS.forEach((station) => {
      const isSpringAlert = station.riskStatus === 'alerta_ressaca' || station.currentHeightM >= 5.0;
      const tideHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          <span class="absolute w-8 h-8 rounded-full ${isSpringAlert ? 'bg-cyan-500/40 animate-ping' : 'bg-blue-500/25'}"></span>
          <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black transition-transform group-hover:scale-115">
            🌊
          </div>
          <span class="absolute -bottom-2 px-1.5 py-0.2 rounded bg-slate-900/90 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-400/40 whitespace-nowrap shadow-xs">
            ${station.currentHeightM}m
          </span>
        </div>
      `;

      const tideIcon = L.divIcon({
        html: tideHtml,
        className: 'custom-tide-pin',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
      });

      const marker = L.marker([station.lat, station.lng], { icon: tideIcon });
      const popupHtml = `
        <div class="p-3 max-w-[270px] font-sans text-slate-800">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${station.cycle === 'enchente' ? 'bg-cyan-100 text-cyan-800' : 'bg-blue-100 text-blue-800'}">
              Maré ${station.cycle === 'enchente' ? 'Enchente ↗' : 'Vazante ↘'}
            </span>
            <span class="font-mono text-[10px] font-bold text-slate-500">Coef: ${station.coefficient}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug">${station.name}</h4>
          <p class="text-[11px] text-slate-500 mt-0.5">Província: <strong>${station.province}</strong></p>

          <div class="grid grid-cols-2 gap-2 my-2 p-2 bg-slate-50 rounded-lg text-center">
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-semibold">Preia-Mar (Alta)</span>
              <div class="text-xs font-black text-cyan-600">${station.highTideM}m <span class="text-[10px] text-slate-400">às ${station.nextHighTideTime}</span></div>
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-semibold">Baixa-Mar</span>
              <div class="text-xs font-black text-blue-600">${station.lowTideM}m <span class="text-[10px] text-slate-400">às ${station.nextLowTideTime}</span></div>
            </div>
          </div>

          <div class="text-[10px] text-slate-600 leading-relaxed bg-blue-50/60 p-2 rounded border border-blue-100">
            ${station.description}
          </div>

          <div class="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
            <span>Temp. Água: <strong class="text-slate-700">${station.waterTempC}°C</strong></span>
            <span>Salinidade: <strong class="text-slate-700">${station.salinityPsu} PSU</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => setSelectedTideStation(station));
      tidesGroup.addLayer(marker);
    });

    // Render Ocean Current Vectors along the Mozambique Channel
    MOZAMBIQUE_CURRENT_POINTS.forEach((pt) => {
      const currentHtml = `
        <div class="relative flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity" style="transform: rotate(${pt.angleDeg}deg);">
          <div class="flex items-center text-cyan-400 font-bold text-xs filter drop-shadow">
            <span class="animate-pulse">➔</span>
            <span class="animate-pulse" style="animation-delay: 0.2s;">➔</span>
          </div>
        </div>
      `;
      const currentIcon = L.divIcon({
        html: currentHtml,
        className: 'custom-current-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const currentMarker = L.marker([pt.lat, pt.lng], { icon: currentIcon });
      currentMarker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-cyan-600 font-bold block">${pt.label}</strong>
          <span class="text-slate-600 text-[11px]">Velocidade: <strong>${pt.speedKnots} nós</strong> (Canal de Moçambique)</span>
        </div>
      `);
      tidesGroup.addLayer(currentMarker);
    });
  }, [showTidesLayer]);

  // 7. Handle Topography Features Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const topoGroup = layerGroupTopographyRef.current;
    if (!map || !topoGroup) return;

    topoGroup.clearLayers();
    if (!showTopographyLayer) return;

    MOZAMBIQUE_TOPOGRAPHY_FEATURES.forEach((feat) => {
      const topoHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-115">
            ⛰️
          </div>
          <span class="absolute -bottom-2 px-1 rounded bg-slate-900/90 text-amber-300 font-mono text-[8px] font-bold border border-amber-500/40 whitespace-nowrap shadow-xs">
            ${feat.elevation}
          </span>
        </div>
      `;
      const topoIcon = L.divIcon({
        html: topoHtml,
        className: 'custom-topo-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
      const marker = L.marker([feat.lat, feat.lng], { icon: topoIcon });
      marker.bindPopup(`
        <div class="p-2.5 max-w-[240px] font-sans text-slate-800">
          <span class="text-[9px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">${feat.type}</span>
          <h4 class="font-bold text-xs text-slate-900">${feat.name}</h4>
          <p class="text-[11px] text-slate-500 font-mono font-bold mt-0.5">Altitude: ${feat.elevation} • ${feat.province}</p>
          <p class="text-[10px] text-slate-600 mt-1 leading-snug bg-amber-50/60 p-1.5 rounded border border-amber-100">
            ${feat.climateRole}
          </p>
        </div>
      `);
      topoGroup.addLayer(marker);
    });
  }, [showTopographyLayer]);

  // 8. Handle Province FlyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedProvince === 'Todas') {
      map.flyTo([-18.665, 35.529], 6, { duration: 1.2 });
    } else {
      const provInfo = MOZAMBIQUE_PROVINCES[selectedProvince];
      if (provInfo) {
        map.flyTo([provInfo.lat, provInfo.lng], 8.5, { duration: 1.2 });
      }
    }
  }, [selectedProvince]);

  // Zoom handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([-18.665, 35.529], 6, { duration: 1.0 });
  };

  const clearUserLocationPin = () => {
    const map = mapInstanceRef.current;
    if (map) {
      if (userLocationMarkerRef.current) {
        try {
          map.removeLayer(userLocationMarkerRef.current);
        } catch (e) {}
        userLocationMarkerRef.current = null;
      }
      if (userLocationCircleRef.current) {
        try {
          map.removeLayer(userLocationCircleRef.current);
        } catch (e) {}
        userLocationCircleRef.current = null;
      }
    }
    setLocationToast(null);
  };

  const handleFocusCapitalMaputo = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([-25.9692, 32.5732], 12, { duration: 1.2 });
      L.popup()
        .setLatLng([-25.9692, 32.5732])
        .setContent('<div class="p-2 font-sans font-bold text-xs text-slate-800">🏛️ Maputo (Capital / Sede Central ECO-MZ)</div>')
        .openOn(map);
    }
    setLocationToast(null);
  };

  const handleLocateMe = () => {
    if (isLocating) return;

    if (!navigator || !('geolocation' in navigator) || !navigator.geolocation) {
      setLocationToast({
        type: 'warning',
        title: 'Geolocalização não suportada',
        message: 'O seu navegador ou dispositivo não possui suporte ativo para geolocalização por satélite.'
      });
      return;
    }

    setIsLocating(true);
    setLocationToast({
      type: 'info',
      title: 'A contactar satélites GPS...',
      message: 'Aguarde um momento enquanto capturamos a sua posição geográfica com precisão.'
    });

    const isInsideMozambique = (lat: number, lng: number) => {
      return lat >= -27.5 && lat <= -10.0 && lng >= 29.5 && lng <= 41.5;
    };

    const onGeoSuccess = (pos: GeolocationPosition) => {
      setIsLocating(false);
      const { latitude, longitude, accuracy } = pos.coords;
      const map = mapInstanceRef.current;
      if (!map) return;

      const lat = Number(latitude.toFixed(5));
      const lng = Number(longitude.toFixed(5));
      const acc = Math.round(accuracy || 25);
      const inMozambique = isInsideMozambique(lat, lng);

      clearUserLocationPin();

      const gpsPulseHtml = `
        <div class="relative flex items-center justify-center w-10 h-10 -ml-1 -mt-1 pointer-events-auto">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
          <span class="absolute w-6 h-6 rounded-full bg-blue-500/40"></span>
          <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const gpsIcon = L.divIcon({
        html: gpsPulseHtml,
        className: 'user-gps-pulse-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const circle = L.circle([lat, lng], {
        radius: Math.max(acc, 30),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
      userLocationCircleRef.current = circle;

      const marker = L.marker([lat, lng], { icon: gpsIcon }).addTo(map);
      userLocationMarkerRef.current = marker;

      const popupHtml = `
        <div class="p-3 text-slate-800 font-sans max-w-[260px]">
          <div class="flex items-center space-x-2 mb-2 pb-1.5 border-b border-slate-100">
            <span class="p-1 rounded bg-blue-100 text-blue-700 font-bold text-xs">📍 GPS</span>
            <span class="font-bold text-xs text-slate-900">Minha Posição Atual</span>
          </div>
          <p class="text-[11px] text-slate-600 mb-1.5">
            <strong>Latitude:</strong> ${lat}°<br/>
            <strong>Longitude:</strong> ${lng}°<br/>
            <strong>Precisão:</strong> ±${acc} metros
          </p>
          <div class="mb-2">
            ${
              inMozambique
                ? '<span class="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Dentro de Moçambique</span>'
                : '<span class="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Fora de Moçambique</span>'
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml).openPopup();

      if (inMozambique) {
        map.flyTo([lat, lng], 13, { duration: 1.4 });
        setLocationToast({
          type: 'success',
          title: 'Localização GPS Conectada',
          message: `Coordenadas: ${lat}°, ${lng}° (precisão estimada ±${acc}m).`,
          coords: { lat, lng },
          accuracy: acc
        });
      } else {
        map.setView([lat, lng], 10);
        setLocationToast({
          type: 'warning',
          title: 'Localização Detectada (Fora de Moçambique)',
          message: `O seu dispositivo está em Lat: ${lat}°, Lng: ${lng}°. O mapa foi centrado na sua posição atual.`,
          coords: { lat, lng },
          accuracy: acc
        });
      }
    };

    const onGeoError = (err: GeolocationPositionError) => {
      setIsLocating(false);
      let errorTitle = 'Não foi possível obter a sua localização';
      let errorMsg = 'Verifique se autorizou a permissão de localização no seu navegador ou dispositivo.';

      if (err.code === 1) {
        errorTitle = 'Permissão de GPS Recusada';
        errorMsg = 'Acesso à localização bloqueado pelo navegador. Para permitir, autorize a localização nas permissões do site.';
      } else if (err.code === 2) {
        errorTitle = 'Sinal GPS Indisponível';
        errorMsg = 'O dispositivo não conseguiu determinar a localização geográfica no momento.';
      } else if (err.code === 3) {
        errorTitle = 'Tempo Limite Excedido';
        errorMsg = 'Demorou muito para receber o sinal de satélite GPS.';
      }

      setLocationToast({
        type: 'error',
        title: errorTitle,
        message: errorMsg
      });
    };

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });
  };

  // Robust HTML5 Fullscreen with CSS fallback and map size invalidation
  const toggleFullscreen = async () => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;

    if (!isFullscreen) {
      if (wrapper.requestFullscreen) {
        try {
          await wrapper.requestFullscreen();
          setIsFullscreen(true);
        } catch {
          setIsFullscreen(true);
        }
      } else if ((wrapper as any).webkitRequestFullscreen) {
        try {
          (wrapper as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } catch {
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
    }

    // Invalidate map size multiple times across animation frames
    [30, 100, 250, 450].forEach((delay) => {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, delay);
    });
  };

  // Sync state if user exits via ESC or browser UI
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
        [50, 150, 300].forEach((delay) => {
          setTimeout(() => mapInstanceRef.current?.invalidateSize(), delay);
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div
      ref={mapWrapperRef}
      className={`relative w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col ${className} ${
        isFullscreen
          ? '!fixed !inset-0 !z-[2500] !w-screen !h-screen !rounded-none !bg-slate-950'
          : 'rounded-2xl'
      }`}
      style={
        isFullscreen
          ? { height: '100vh', width: '100vw', maxHeight: '100vh' }
          : { height }
      }
    >
      {/* Floating Exit Fullscreen Banner (Active in Fullscreen) */}
      {isFullscreen && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-4 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-500/50"
            title="Sair do modo Tela Cheia (ESC)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sair da Tela Cheia (ESC)</span>
          </button>
        </div>
      )}
      {/* Top Map Control Bar */}
      {showLayerControls && (
        <div className="absolute top-3 left-3 right-16 z-[450] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Base Layer Switcher Pills */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg flex items-center space-x-1 pointer-events-auto text-xs text-white">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mapa:</span>
            </span>
            <button
              onClick={() => setCurrentBaseMap('hybrid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                currentBaseMap === 'hybrid'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Satélite Híbrido com Cidades, Estradas, Limites e Fronteiras"
            >
              <span className="hidden sm:inline">Satélite </span>Híbrido
            </button>
            <button
              onClick={() => setCurrentBaseMap('satellite')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                currentBaseMap === 'satellite'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Imagem de Satélite Aérea"
            >
              Satélite
            </button>
            <button
              onClick={() => setCurrentBaseMap('osm')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
                currentBaseMap === 'osm'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Mapa de Vias e Localidades OpenStreetMap"
            >
              Vias
            </button>
            <button
              onClick={() => {
                setCurrentBaseMap('topo');
                setShowTopographyLayer(true);
                setShowWindLayer(true);
                setShowTidesLayer(true);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer flex items-center gap-1 ${
                currentBaseMap === 'topo'
                  ? 'bg-amber-600 text-white font-bold shadow-xs ring-2 ring-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Modo Relevo Dinâmico: Topografia, Vento Atmosférico e Marés do Canal de Moçambique"
            >
              <Mountain className="w-3.5 h-3.5 text-amber-300" />
              <span>Relevo (Vento & Maré)</span>
            </button>
            <button
              onClick={() => {
                setCurrentBaseMap('ocean');
                setShowTidesLayer(true);
                setShowWindLayer(true);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer flex items-center gap-1 ${
                currentBaseMap === 'ocean'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs ring-2 ring-cyan-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Batimetria Oceânica, Marés e Correntes do Canal de Moçambique"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-300" />
              <span>Oceano & Marés</span>
            </button>
          </div>

          {/* Quick Layer Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {/* Dynamic Wind Streamlines Toggle */}
            <button
              type="button"
              onClick={() => setShowWindLayer(!showWindLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showWindLayer
                  ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-500/40 shadow-sky-950/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600'
              }`}
              title="Ativar/Desativar Vetores de Vento e Alísios no Canal de Moçambique"
            >
              <Wind className={`w-3.5 h-3.5 ${showWindLayer ? 'text-sky-200 animate-pulse' : 'text-sky-400'}`} />
              <span>Vento (Canal MZ)</span>
              {showWindLayer && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-ping ml-0.5" />
              )}
            </button>

            {/* Dynamic Tides & Currents Toggle */}
            <button
              type="button"
              onClick={() => setShowTidesLayer(!showTidesLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showTidesLayer
                  ? 'bg-cyan-700 text-white border-cyan-400 ring-2 ring-cyan-500/40 shadow-cyan-950/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600'
              }`}
              title="Ativar/Desativar Marégrafos Costeiros (Beira, Maputo, Nacala, Quelimane) e Correntes"
            >
              <Waves className={`w-3.5 h-3.5 ${showTidesLayer ? 'text-cyan-200 animate-bounce' : 'text-cyan-400'}`} />
              <span>Marés & Correntes</span>
              {showTidesLayer && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping ml-0.5" />
              )}
            </button>

            {/* Topography Peaks Toggle */}
            <button
              type="button"
              onClick={() => setShowTopographyLayer(!showTopographyLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showTopographyLayer
                  ? 'bg-amber-700 text-white border-amber-400'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
              }`}
              title="Mostrar Pontos de Relevo (Monte Binga, Gorongosa, Namúli, Lichinga)"
            >
              <Mountain className="w-3.5 h-3.5 text-amber-300" />
              <span>Cumes & Relevo</span>
            </button>

            {/* Heatmap Layer Toggle */}
            <button
              type="button"
              onClick={() => setShowHeatmapLayer(!showHeatmapLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showHeatmapLayer
                  ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white border-rose-400 ring-2 ring-rose-500/40 shadow-rose-950/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600'
              }`}
              title="Ativar/Desativar Mancha de Calor Térmica (Visualização de densidade e áreas críticas)"
            >
              <Flame className={`w-3.5 h-3.5 ${showHeatmapLayer ? 'text-amber-200 animate-pulse' : 'text-orange-400'}`} />
              <span>Mancha de Calor</span>
              {showHeatmapLayer && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping ml-0.5" />
              )}
            </button>

            {/* Critical Zones Quick Toggle (shown when heatmap active) */}
            {showHeatmapLayer && (
              <button
                type="button"
                onClick={() => setShowCriticalZones(!showCriticalZones)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                  showCriticalZones
                    ? 'bg-rose-900/90 text-rose-100 border-rose-500 shadow-rose-900/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Identificar e destacar no mapa as Zonas Críticas de Risco para intervenção das autoridades"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Zonas Críticas ({criticalZonesList.length})</span>
              </button>
            )}

            {/* Heatmap Settings / Calibration Trigger */}
            {showHeatmapLayer && (
              <button
                type="button"
                onClick={() => setIsHeatmapSettingsOpen(!isHeatmapSettingsOpen)}
                className={`p-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center transition-all border cursor-pointer ${
                  isHeatmapSettingsOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                }`}
                title="Calibrar Raio, Opacidade e Ponderação da Mancha de Calor"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Boundaries & Labels Overlay Toggle */}
            <button
              onClick={() => setShowLabelsOverlay(!showLabelsOverlay)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showLabelsOverlay
                  ? 'bg-emerald-600/90 text-white border-emerald-400/60'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700/80 hover:text-white'
              }`}
              title="Mostrar/Ocultar Fronteiras, Nomes de Cidades e Referências Geográficas"
            >
              <Compass className="w-3.5 h-3.5" />
              <span><span className="hidden md:inline">Fronteiras & </span>Cidades</span>
            </button>

            {/* Occurrences Marker Toggle */}
            <button
              onClick={() => setShowOccurrencesLayer(!showOccurrencesLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showOccurrencesLayer
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Ocorrências ({filtered.length})</span>
            </button>

            {/* Protected Areas Toggle */}
            <button
              onClick={() => setShowParksLayer(!showParksLayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showParksLayer
                  ? 'bg-emerald-700 text-white border-emerald-500'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>🌿 Parques<span className="hidden md:inline"> Nacionais</span></span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Heatmap Calibration Drawer & Critical Zones Panel for Authorities */}
      {showHeatmapLayer && isHeatmapSettingsOpen && (
        <div className="absolute top-16 left-3 z-[600] max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 text-white text-xs animate-in fade-in slide-in-from-top-2 pointer-events-auto space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-xs text-white">Análise Térmica & Zonas Críticas</h4>
                <p className="text-[10px] text-slate-400">Parâmetros do Modelo Geoespacial</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsHeatmapSettingsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Density Thermal Gradient Scale */}
          <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
              <span>Escala Térmica de Densidade:</span>
              <span className="text-rose-400 font-mono">Kernel Density</span>
            </div>
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-blue-500 via-cyan-400 via-emerald-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>Baixa (Isolado)</span>
              <span>Moderada</span>
              <span className="text-amber-300">Alta</span>
              <span className="text-rose-400 font-bold">Crítica Extrema</span>
            </div>
          </div>

          {/* Heatmap Radius (Sensitivity) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Raio do Ponto (Difusão):</span>
              <span className="font-mono text-emerald-400 font-bold">{heatmapRadius}px</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {[
                { label: 'Fino', val: 26 },
                { label: 'Equilibrado', val: 38 },
                { label: 'Amplo', val: 56 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setHeatmapRadius(item.val)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    heatmapRadius === item.val
                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  {item.label} ({item.val}px)
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Opacity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Opacidade Térmica:</span>
              <span className="font-mono text-emerald-400 font-bold">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {[
                { label: 'Translúcido', val: 0.45 },
                { label: 'Padrão', val: 0.82 },
                { label: 'Saturado', val: 0.98 }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setHeatmapOpacity(item.val)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    heatmapOpacity === item.val
                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weighting Mode */}
          <div className="space-y-1">
            <span className="text-slate-300 font-medium text-[11px] block">Ponderação de Risco:</span>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setHeatmapWeightMode('severity')}
                className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition-all cursor-pointer ${
                  heatmapWeightMode === 'severity'
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-500/80 ring-1 ring-rose-500'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <div className="font-bold">Por Gravidade ★</div>
                <div className="text-[9px] opacity-75">Crítico multiplica calor</div>
              </button>
              <button
                type="button"
                onClick={() => setHeatmapWeightMode('count')}
                className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition-all cursor-pointer ${
                  heatmapWeightMode === 'count'
                    ? 'bg-blue-950/80 text-blue-200 border border-blue-500/80 ring-1 ring-blue-500'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <div className="font-bold">Densidade Bruta</div>
                <div className="text-[9px] opacity-75">Contagem unitária linear</div>
              </button>
            </div>
          </div>

          {/* Quick List of Critical Zones identified for authorities */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <span>🚨</span> Zonas Críticas Detectadas ({criticalZonesList.length})
              </span>
              <span className="text-[10px] text-slate-400">Clique para centrar</span>
            </div>

            {criticalZonesList.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {criticalZonesList.map((zone) => {
                  const isExtreme = zone.riskLevel === 'Crítico Extremo';
                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleFlyToCriticalZone(zone)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        focusedZoneId === zone.id
                          ? 'bg-rose-900/60 border-rose-400 text-white'
                          : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold text-[11px] truncate flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isExtreme ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'}`} />
                          <span>{zone.name}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1.5">
                          <span>{zone.totalIncidents} focos</span>
                          <span>•</span>
                          <span className={isExtreme ? 'text-rose-400 font-bold' : 'text-orange-400'}>
                            {zone.riskLevel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0 font-bold text-emerald-400 hover:text-white">
                        Focar →
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg text-center">
                Nenhuma concentração crítica identificada com os filtros atuais.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Map Navigation Tools (Right side, non-overlapping clean column) */}
      <div className="absolute top-3 sm:top-14 right-3 z-[500] flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Aproximar (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
          title="Afastar (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-700 my-0.5" />
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg text-slate-200 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          title="Centrar em Moçambique"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          id="btn-interactive-locate-me"
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isLocating
              ? 'bg-blue-600/30 text-blue-400 ring-2 ring-blue-500 animate-pulse'
              : userLocationMarkerRef.current
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-200 hover:text-blue-400 hover:bg-slate-800'
          }`}
          title={isLocating ? 'A obter coordenadas GPS...' : userLocationMarkerRef.current ? 'Localização ativa (clique para reobter)' : 'Minha Posição GPS'}
          aria-label="Obter minha localização GPS"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isFullscreen
              ? 'bg-amber-500/30 text-amber-300 ring-2 ring-amber-400'
              : 'text-slate-200 hover:text-amber-400 hover:bg-slate-800'
          }`}
          title={isFullscreen ? 'Sair da Tela Cheia (ESC)' : 'Ecrã Inteiro (Tela Cheia)'}
          aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating GPS Location Notification Toast Card */}
      {locationToast && (
        <div className="absolute top-16 left-3 right-16 z-[1050] max-w-md pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-3 rounded-xl shadow-2xl backdrop-blur-md border flex items-start justify-between gap-3 ${
              locationToast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/60'
                : locationToast.type === 'error'
                ? 'bg-slate-900/95 text-white border-rose-500/60'
                : locationToast.type === 'warning'
                ? 'bg-slate-900/95 text-white border-amber-500/60'
                : 'bg-slate-900/95 text-white border-blue-500/60'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 shrink-0">
                {locationToast.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {locationToast.type === 'error' && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                {locationToast.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                {locationToast.type === 'info' && (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-white leading-tight">
                  {locationToast.title}
                </h5>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {locationToast.message}
                </p>

                {/* Quick Fallbacks & Actions */}
                {(locationToast.type === 'error' || locationToast.type === 'warning') && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={handleFocusCapitalMaputo}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Centrar em Maputo (Sede)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetView();
                        setLocationToast(null);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Visão Moçambique
                    </button>
                    {locationToast.type === 'error' && (
                      <button
                        type="button"
                        onClick={handleLocateMe}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Tentar Novamente
                      </button>
                    )}
                  </div>
                )}

                {locationToast.type === 'success' && (
                  <div className="flex items-center gap-3 pt-1 text-[10px]">
                    <button
                      type="button"
                      onClick={clearUserLocationPin}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Remover Marcador GPS
                    </button>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-medium">Marcador ativo no mapa</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLocationToast(null)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0" />

      {/* Bottom Status & Coordinate Ribbon */}
      {showBottomRibbon && (
        <div className="absolute bottom-2 left-3 right-3 z-[450] pointer-events-none flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-200">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 pointer-events-auto flex items-center space-x-2.5 shadow-md">
            <span className="flex items-center space-x-1 font-mono text-[10px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GIS ECO-MZ ATIVO</span>
            </span>
            {showHeatmapLayer && (
              <>
                <span className="text-slate-500">•</span>
                <span className="flex items-center space-x-1 text-orange-300 font-bold text-[10px]">
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                  <span>MANCHA TÉRMICA</span>
                  {criticalZonesList.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white font-mono text-[9px] font-bold">
                      {criticalZonesList.length} {criticalZonesList.length === 1 ? 'zona crítica' : 'zonas críticas'}
                    </span>
                  )}
                </span>
              </>
            )}
            <span className="text-slate-500">•</span>
            <span className="truncate max-w-[140px] sm:max-w-none">
              {selectedProvince === 'Todas' ? 'Moçambique (11 Prov.)' : selectedProvince}
            </span>
            {cursorCoords && (
              <>
                <span className="text-slate-500 hidden md:inline">•</span>
                <span className="font-mono text-[10px] text-slate-300 hidden md:inline">
                  Lat: {cursorCoords.lat}°, Lng: {cursorCoords.lng}°
                </span>
              </>
            )}
          </div>

          {/* Severity Legend with interactive toggle filter */}
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 pointer-events-auto hidden md:flex items-center space-x-1.5 shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gravidade:</span>
            <button
              type="button"
              onClick={() => setInternalSeverityFilter('Todas')}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                internalSeverityFilter === 'Todas'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setInternalSeverityFilter(internalSeverityFilter === 'Crítico' ? 'Todas' : 'Crítico')}
              className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                internalSeverityFilter === 'Crítico'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-rose-400 hover:bg-slate-800'
              }`}
              title="Filtrar eventos com risco Crítico"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Crítico</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalSeverityFilter(internalSeverityFilter === 'Alto' ? 'Todas' : 'Alto')}
              className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                internalSeverityFilter === 'Alto'
                  ? 'bg-orange-600 text-white font-bold shadow-xs'
                  : 'text-orange-400 hover:bg-slate-800'
              }`}
              title="Filtrar eventos com risco Alto"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>Alto</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalSeverityFilter(internalSeverityFilter === 'Médio' ? 'Todas' : 'Médio')}
              className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                internalSeverityFilter === 'Médio'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-amber-400 hover:bg-slate-800'
              }`}
              title="Filtrar eventos com risco Médio"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Médio</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalSeverityFilter(internalSeverityFilter === 'Baixo' ? 'Todas' : 'Baixo')}
              className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                internalSeverityFilter === 'Baixo'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-400 hover:bg-slate-800'
              }`}
              title="Filtrar eventos com risco Baixo"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Baixo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

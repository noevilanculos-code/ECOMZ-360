import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  Filter,
  AlertTriangle,
  Flame,
  Droplets,
  Trees,
  Trash2,
  Maximize2,
  Minimize2,
  Calendar,
  Eye,
  Info,
  ChevronRight,
  ShieldCheck,
  Download,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Compass,
  Crosshair,
  Radio,
  Search,
  X,
  BarChart3,
  Building2,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Wind,
  Waves,
  Mountain,
  Gauge,
  Thermometer,
  ChevronDown,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import {
  buildWindOverlayGroup,
  buildMaresiaOverlayGroup,
  buildHumidityOverlayGroup
} from '../lib/leafletEnvironmentalOverlays';
import { CommunityActionForum } from './CommunityActionForum';
import {
  MOZAMBIQUE_TOPOGRAPHY_FEATURES,
  MOZAMBIQUE_TIDE_STATIONS,
  MOZAMBIQUE_WIND_STATIONS,
  TideStation,
  WindStation
} from '../lib/leafletEnvironmentalDynamics';
import {
  CanvasHeatmapLayer,
  detectCriticalZones,
  CriticalZone,
  getOccurrenceHeatWeight,
  HeatmapPoint
} from '../lib/leafletHeatmap';
import {
  Occurrence,
  MozambiqueProvince,
  EnvironmentalCategory,
  SeverityLevel
} from '../types';
import { MOZAMBIQUE_PROVINCES, ProvinceInfo } from '../data/mockData';
import { MOZAMBIQUE_DISTRICTS, MozambiqueDistrictGeo } from '../data/mozambiqueGeodata';
import { CategoryOccurrencesBarChart } from './CategoryOccurrencesBarChart';
import { OccurrenceSummaryWidget } from './OccurrenceSummaryWidget';

export interface EcoMapProps {
  occurrences: Occurrence[];
  selectedProvince: MozambiqueProvince | 'Todas';
  setSelectedProvince: (prov: MozambiqueProvince | 'Todas') => void;
  onSelectOccurrence: (occ: Occurrence) => void;
  onNewReport: () => void;
}

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

export const MOZAMBIQUE_PROTECTED_PARKS: ProtectedArea[] = [
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

const CATEGORIES_LIST: (EnvironmentalCategory | 'Todas')[] = [
  'Todas',
  'Desmatamento',
  'Queimadas Descontroladas',
  'Poluição Hídrica',
  'Destruição de Mangais',
  'Resíduos Sólidos Urbanos',
  'Erosão Costeira/Pluvial',
  'Caça Furtiva & Biodiversidade',
  'Mineração Ilegal'
];

const SEVERITIES_LIST: (SeverityLevel | 'Todas')[] = [
  'Todas',
  'Crítico',
  'Alto',
  'Médio',
  'Baixo'
];

export const EcoMap: React.FC<EcoMapProps> = ({
  occurrences,
  selectedProvince,
  setSelectedProvince,
  onSelectOccurrence,
  onNewReport
}) => {
  // UI Layer & Filter states
  const [activeLayer, setActiveLayer] = useState<'marcadores' | 'calor' | 'comparador'>('marcadores');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeFeedbackLocation, setActiveFeedbackLocation] = useState<string | null>(null);
  const [showBarChartSection, setShowBarChartSection] = useState<boolean>(true);
  const [comparePeriod, setComparePeriod] = useState<'2024' | '2026'>('2026');
  const [sidebarView, setSidebarView] = useState<'resumo' | 'lista'>('resumo');

  // GPS / User Location states & refs
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

  // Leaflet Map state & references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const parksLayerRef = useRef<L.LayerGroup | null>(null);
  const criticalZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const tidesLayerRef = useRef<L.LayerGroup | null>(null);
  const topographyLayerRef = useRef<L.LayerGroup | null>(null);
  const windOverlayGroupRef = useRef<L.LayerGroup | null>(null);
  const maresiaOverlayGroupRef = useRef<L.LayerGroup | null>(null);
  const humidityOverlayGroupRef = useRef<L.LayerGroup | null>(null);
  const canvasHeatmapRef = useRef<CanvasHeatmapLayer | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const currentOverlayTileRef = useRef<L.TileLayer | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchHighlightMarkerRef = useRef<L.Marker | null>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [currentBaseMap, setCurrentBaseMap] = useState<'hybrid' | 'satellite' | 'osm' | 'topo' | 'ocean'>('hybrid');
  const [showLabelsOverlay, setShowLabelsOverlay] = useState<boolean>(true);
  const [showOccurrencesLayer, setShowOccurrencesLayer] = useState<boolean>(true);
  const [showParksLayer, setShowParksLayer] = useState<boolean>(true);

  // Clean Leaflet Environmental Data Overlays (Vento, Maresia, Humidade, Marés, Topografia)
  const [showWindOverlay, setShowWindOverlay] = useState<boolean>(false);
  const [showMaresiaOverlay, setShowMaresiaOverlay] = useState<boolean>(false);
  const [showHumidityOverlay, setShowHumidityOverlay] = useState<boolean>(false);
  const [showTopographyLayer, setShowTopographyLayer] = useState<boolean>(false);
  const [showWindLayer, setShowWindLayer] = useState<boolean>(false);
  const [showTidesLayer, setShowTidesLayer] = useState<boolean>(false);
  const [selectedTideModalStation, setSelectedTideModalStation] = useState<TideStation | null>(null);
  const [isEnvironmentalSelectorOpen, setIsEnvironmentalSelectorOpen] = useState<boolean>(false);

  // Main View Tab: 'mapa' or 'forum' (Fórum de Ação Comunitária)
  const [mainViewTab, setMainViewTab] = useState<'mapa' | 'forum'>('mapa');

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fast Geodata search autocomplete computations
  const searchNormalized = searchQuery.trim().toLowerCase();

  const provinceMatches = useMemo(() => {
    if (!searchNormalized) return [];
    return (Object.keys(MOZAMBIQUE_PROVINCES) as MozambiqueProvince[]).filter((prov) => {
      const pInfo = MOZAMBIQUE_PROVINCES[prov];
      return (
        prov.toLowerCase().includes(searchNormalized) ||
        pInfo.capital.toLowerCase().includes(searchNormalized)
      );
    }).slice(0, 4);
  }, [searchNormalized]);

  const districtMatches = useMemo(() => {
    if (!searchNormalized) return [];
    return MOZAMBIQUE_DISTRICTS.filter((dist) =>
      dist.name.toLowerCase().includes(searchNormalized) ||
      dist.province.toLowerCase().includes(searchNormalized)
    ).slice(0, 8);
  }, [searchNormalized]);

  const occurrenceMatches = useMemo(() => {
    if (!searchNormalized) return [];
    return occurrences.filter((occ) =>
      occ.title.toLowerCase().includes(searchNormalized) ||
      occ.locationDetails?.toLowerCase().includes(searchNormalized) ||
      occ.protocol?.toLowerCase().includes(searchNormalized)
    ).slice(0, 4);
  }, [searchNormalized, occurrences]);

  const hasSearchMatches =
    provinceMatches.length > 0 || districtMatches.length > 0 || occurrenceMatches.length > 0;

  // Handlers for quick selection of Province, District or Occurrence
  const handleSelectProvinceQuick = (prov: MozambiqueProvince) => {
    setSelectedProvince(prov);
    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveFeedbackLocation(`Província de ${prov}`);
    const provInfo = MOZAMBIQUE_PROVINCES[prov];
    if (provInfo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([provInfo.lat, provInfo.lng], 8.5, { duration: 1.2 });
    }
  };

  const handleSelectDistrictQuick = (dist: MozambiqueDistrictGeo) => {
    setSelectedProvince(dist.province);
    setSearchQuery(dist.name);
    setIsSearchOpen(false);
    setActiveFeedbackLocation(`Distrito de ${dist.name} (${dist.province})`);

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([dist.lat, dist.lng], 11.5, { duration: 1.2 });

      if (searchHighlightMarkerRef.current) {
        searchHighlightMarkerRef.current.remove();
      }

      const pulsePinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute w-12 h-12 rounded-full bg-emerald-500/40 animate-ping"></div>
            <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl border-2 border-white text-sm font-black">
              📍
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const pinMarker = L.marker([dist.lat, dist.lng], { icon: pulsePinIcon }).addTo(map);
      pinMarker.bindPopup(`
        <div class="p-2.5 font-sans min-w-[200px]">
          <div class="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">
            <span>Distrito de Moçambique</span>
          </div>
          <h4 class="font-black text-sm text-slate-900 leading-snug">${dist.name}</h4>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Província: <strong class="text-slate-700">${dist.province}</strong></p>
          <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Coordenadas:</span>
            <span class="font-mono text-[10px] font-bold">${dist.lat.toFixed(4)}, ${dist.lng.toFixed(4)}</span>
          </div>
        </div>
      `).openPopup();
      searchHighlightMarkerRef.current = pinMarker;
    }
  };

  // Filtered occurrences calculation for UI list and count badges
  const filteredOccurrences = occurrences.filter((occ) => {
    if (occ.status === 'Resolvido') return false;
    if (selectedProvince !== 'Todas' && occ.province !== selectedProvince) return false;
    if (selectedCategory !== 'Todas' && occ.category !== selectedCategory) return false;
    if (selectedSeverity !== 'Todas' && occ.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDistrict = occ.district?.toLowerCase().includes(q);
      const matchLocation = occ.locationDetails?.toLowerCase().includes(q);
      const matchTitle = occ.title?.toLowerCase().includes(q);
      const matchProvince = occ.province?.toLowerCase().includes(q);
      const matchProtocol = occ.protocol?.toLowerCase().includes(q);
      if (!matchDistrict && !matchLocation && !matchTitle && !matchProvince && !matchProtocol) return false;
    }
    return true;
  });

  // Extract distinct districts for quick search filter chips
  const availableDistricts = Array.from(
    new Set(
      occurrences
        .filter((o) => selectedProvince === 'Todas' || o.province === selectedProvince)
        .map((o) => o.district)
        .filter(Boolean)
    )
  ).slice(0, 6);

  const criticalCount = filteredOccurrences.filter((o) => o.severity === 'Crítico').length;
  const highCount = filteredOccurrences.filter((o) => o.severity === 'Alto').length;

  const currentProvinceData: ProvinceInfo | null =
    selectedProvince !== 'Todas' ? MOZAMBIQUE_PROVINCES[selectedProvince] : null;

  // Base map tile configurations configured with reliable high-res servers and maxNativeZoom
  const baseMapConfigs = {
    hybrid: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery, Maxar, Earthstar Geographics',
      maxNativeZoom: 18,
      maxZoom: 20
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery, Maxar',
      maxNativeZoom: 18,
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

  // Helper to obtain safe GPS coordinates for any occurrence
  const getSafeCoordinates = (occ: Occurrence): [number, number] => {
    let lat = Number(occ.coordinates?.lat);
    let lng = Number(occ.coordinates?.lng);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      const provInfo = MOZAMBIQUE_PROVINCES[occ.province];
      if (provInfo) {
        // Deterministic offset based on ID character codes
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

  // Helper for severity color palette
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

  // Helper for category custom visual icon
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

  const getSeverityBadgeClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Crítico':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Alto':
        return 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Médio':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Baixo':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
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

  // 1. LIFECYCLE: Initialize and safely manage Leaflet Map destruction & reinitalization
  useEffect(() => {
    if (activeLayer === 'comparador') return;
    if (!mapContainerRef.current) return;

    // Remove previous stale leaflet id to avoid "Map container is already initialized."
    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    // Safely remove any existing map instance before recreating
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // Safe ignore
      }
      mapInstanceRef.current = null;
    }

    // Determine initial center
    let centerLat = -18.665;
    let centerLng = 35.529;
    let zoomLevel = 6;

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

    // Base Tile Layer
    const tileConfig = baseMapConfigs[currentBaseMap];
    const initialTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxNativeZoom: tileConfig.maxNativeZoom,
      maxZoom: tileConfig.maxZoom,
      subdomains: (tileConfig as any).subdomains || 'abc'
    }).addTo(map);
    currentTileLayerRef.current = initialTile;

    // Boundaries & Location Names overlay
    if ((showLabelsOverlay && currentBaseMap === 'satellite') || currentBaseMap === 'hybrid') {
      const overlayTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri Reference',
          maxNativeZoom: 18,
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

    // Layer Groups
    const heatGroup = L.layerGroup().addTo(map);
    const parksGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const criticalGroup = L.layerGroup().addTo(map);
    const tidesGroup = L.layerGroup().addTo(map);
    const topoGroup = L.layerGroup().addTo(map);

    heatLayerRef.current = heatGroup;
    parksLayerRef.current = parksGroup;
    markersLayerRef.current = markersGroup;
    criticalZonesLayerRef.current = criticalGroup;
    tidesLayerRef.current = tidesGroup;
    topographyLayerRef.current = topoGroup;

    // High performance Canvas Heatmap
    const canvasHeat = new CanvasHeatmapLayer([], {
      radius: 40,
      maxOpacity: 0.85,
      blur: 18
    });
    canvasHeat.addTo(map);
    canvasHeatmapRef.current = canvasHeat;

    // Cursor coordinates tracker
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    });

    mapInstanceRef.current = map;

    // Multiple layout passes to guarantee tiles render properly without gray areas
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

    // CLEANUP: Destroy map instance when switching tabs or unmounting
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      if (windOverlayGroupRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(windOverlayGroupRef.current); } catch (e) {}
        windOverlayGroupRef.current = null;
      }
      if (maresiaOverlayGroupRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(maresiaOverlayGroupRef.current); } catch (e) {}
        maresiaOverlayGroupRef.current = null;
      }
      if (humidityOverlayGroupRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(humidityOverlayGroupRef.current); } catch (e) {}
        humidityOverlayGroupRef.current = null;
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
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Safe ignore
        }
        mapInstanceRef.current = null;
      }
      if (container && container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, [activeLayer]); // Re-initialize when toggling away from/to comparator

  // 2. Base Map Layer switcher
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
    const tileUrl = tileConfig.url;

    const newTile = L.tileLayer(tileUrl, {
      attribution: tileConfig.attribution,
      maxNativeZoom: tileConfig.maxNativeZoom,
      maxZoom: tileConfig.maxZoom,
      subdomains: (tileConfig as any).subdomains || 'abc'
    }).addTo(map);

    currentTileLayerRef.current = newTile;

    // Add boundaries and places overlay when satellite, hybrid or ocean
    if ((showLabelsOverlay && currentBaseMap === 'satellite') || currentBaseMap === 'hybrid') {
      const overlayTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri Reference',
          maxNativeZoom: 18,
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

  // 3. DYNAMIC MARKERS & HEATMAP LAYER: Render markers, thermal canvas & critical zones
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    const heatGroup = heatLayerRef.current;
    const criticalZonesGroup = criticalZonesLayerRef.current;
    const canvasHeat = canvasHeatmapRef.current;
    if (!markersGroup || !heatGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();
    heatGroup.clearLayers();
    if (criticalZonesGroup) criticalZonesGroup.clearLayers();

    if (!showOccurrencesLayer) {
      if (canvasHeat) canvasHeat.setPoints([]);
      return;
    }

    // Filter occurrences
    const filteredOccurrences = occurrences.filter((occ) => {
      if (occ.status === 'Resolvido') return false;
      if (selectedProvince !== 'Todas' && occ.province !== selectedProvince) return false;
      if (selectedCategory !== 'Todas' && occ.category !== selectedCategory) return false;
      if (selectedSeverity !== 'Todas' && occ.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDistrict = occ.district?.toLowerCase().includes(q);
        const matchLocation = occ.locationDetails?.toLowerCase().includes(q);
        const matchTitle = occ.title?.toLowerCase().includes(q);
        const matchProvince = occ.province?.toLowerCase().includes(q);
        const matchProtocol = occ.protocol?.toLowerCase().includes(q);
        if (!matchDistrict && !matchLocation && !matchTitle && !matchProvince && !matchProtocol) return false;
      }
      return true;
    });

    // Render Canvas Heatmap & Critical Zones if active
    if (activeLayer === 'calor' && canvasHeat) {
      const heatPoints: HeatmapPoint[] = filteredOccurrences.map((occ) => {
        const [lat, lng] = getSafeCoordinates(occ);
        return {
          lat,
          lng,
          weight: getOccurrenceHeatWeight(occ.severity),
          severity: occ.severity,
          title: occ.title,
          category: occ.category
        };
      });
      canvasHeat.setOptions({ radius: 38, maxOpacity: 0.85 });
      canvasHeat.setPoints(heatPoints);

      if (criticalZonesGroup) {
        const detected = detectCriticalZones(filteredOccurrences);
        detected.forEach((zone) => {
          const isExtreme = zone.riskLevel === 'Crítico Extremo';
          const isHigh = zone.riskLevel === 'Alto Risco';
          const borderColor = isExtreme ? '#ef4444' : isHigh ? '#f97316' : '#f59e0b';

          const halo = L.circle([zone.centerLat, zone.centerLng], {
            radius: zone.radiusKm * 1000,
            color: borderColor,
            fillColor: borderColor,
            fillOpacity: isExtreme ? 0.15 : 0.08,
            weight: 2,
            dashArray: '5, 5'
          });
          criticalZonesGroup.addLayer(halo);

          const badgeHtml = `
            <div class="relative flex items-center justify-center cursor-pointer select-none group">
              <span class="absolute w-12 h-12 rounded-full ${isExtreme ? 'bg-rose-500/35 animate-ping' : 'bg-orange-500/25'}"></span>
              <div class="relative px-2.5 py-1 rounded-full ${isExtreme ? 'bg-rose-600 border-2 border-white text-white' : 'bg-orange-600 border-2 border-white text-white'} shadow-xl flex items-center gap-1.5 text-[10px] font-black tracking-wide whitespace-nowrap">
                <span>🚨</span>
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
          zoneMarker.bindPopup(`
            <div class="p-3 max-w-[280px] font-sans text-slate-800">
              <div class="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-100">
                <span class="px-2 py-0.5 rounded text-[9px] font-black text-white ${isExtreme ? 'bg-rose-600' : 'bg-orange-600'}">
                  ${zone.riskLevel}
                </span>
                <span class="text-[10px] text-slate-500 font-mono">Índice: ${zone.riskScore}</span>
              </div>
              <h4 class="font-bold text-xs text-slate-900 mb-1">Zona Crítica: ${zone.name}</h4>
              <p class="text-[10px] text-slate-600 mb-2">Ameaça Principal: <strong>${zone.dominantCategory}</strong></p>
              <div class="text-[9px] text-slate-700 bg-amber-50 p-2 rounded border border-amber-200 mb-2">
                <strong>Recomendação Oficial:</strong> ${zone.recommendedAction}
              </div>
            </div>
          `);
          criticalZonesGroup.addLayer(zoneMarker);
        });
      }
    } else if (canvasHeat) {
      canvasHeat.setPoints([]);
    }

    // Render individual occurrence pins
    filteredOccurrences.forEach((occ) => {
      const [lat, lng] = getSafeCoordinates(occ);
      const color = getSeverityColor(occ.severity);
      const iconSymbol = getCategoryIconSymbol(occ.category);
      const isCritical = occ.severity === 'Crítico';
      const isHigh = occ.severity === 'Alto';
      const isNew = occ.status === 'Recebido' || occ.status === 'Em Validação';

      // Custom Dynamic Marker with smooth, rock-solid radar pulse
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

      // Detailed interactive Popup
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
          <div class="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2.5 leading-relaxed">
            ${occ.description}
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span>Protocolo: <strong>${occ.protocol}</strong></span>
            <button
              id="btn-map-popup-${occ.id}"
              class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[10px] transition-all cursor-pointer shadow-xs"
            >
              Ver Dossiê →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Attach button click handler when popup opens
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-map-popup-${occ.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectOccurrence(occ);
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [occurrences, selectedProvince, selectedCategory, selectedSeverity, searchQuery, showOccurrencesLayer, activeLayer, onSelectOccurrence]);

  // 4. Protected Areas & National Parks overlay
  useEffect(() => {
    const parksGroup = parksLayerRef.current;
    if (!parksGroup) return;

    parksGroup.clearLayers();

    if (!showParksLayer) return;

    MOZAMBIQUE_PROTECTED_PARKS.forEach((park) => {
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

  // 5. Clean Leaflet Environmental Overlay: Vento (Estações & Vetores discretos)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showWindOverlay) {
      if (!windOverlayGroupRef.current) {
        const windGroup = buildWindOverlayGroup();
        windGroup.addTo(map);
        windOverlayGroupRef.current = windGroup;
      }
    } else {
      if (windOverlayGroupRef.current) {
        try {
          map.removeLayer(windOverlayGroupRef.current);
        } catch (e) {}
        windOverlayGroupRef.current = null;
      }
    }
  }, [showWindOverlay]);

  // 6. Clean Leaflet Environmental Overlay: Maresia & Salinidade Costeira
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showMaresiaOverlay) {
      if (!maresiaOverlayGroupRef.current) {
        const maresiaGroup = buildMaresiaOverlayGroup();
        maresiaGroup.addTo(map);
        maresiaOverlayGroupRef.current = maresiaGroup;
      }
    } else {
      if (maresiaOverlayGroupRef.current) {
        try {
          map.removeLayer(maresiaOverlayGroupRef.current);
        } catch (e) {}
        maresiaOverlayGroupRef.current = null;
      }
    }
  }, [showMaresiaOverlay]);

  // 7. Clean Leaflet Environmental Overlay: Humidade Relativa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showHumidityOverlay) {
      if (!humidityOverlayGroupRef.current) {
        const humGroup = buildHumidityOverlayGroup();
        humGroup.addTo(map);
        humidityOverlayGroupRef.current = humGroup;
      }
    } else {
      if (humidityOverlayGroupRef.current) {
        try {
          map.removeLayer(humidityOverlayGroupRef.current);
        } catch (e) {}
        humidityOverlayGroupRef.current = null;
      }
    }
  }, [showHumidityOverlay]);

  // 7. Handle Topography Features Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const topoGroup = topographyLayerRef.current;
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

  // 8. Province FlyTo smooth navigation
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

  // Map Navigation Handlers
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

      // Clean existing user pin and accuracy circle
      clearUserLocationPin();

      // Custom pulsing GPS pin icon
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

      // Accuracy radius circle
      const circle = L.circle([lat, lng], {
        radius: Math.max(acc, 30),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
      userLocationCircleRef.current = circle;

      // Location Marker
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
                ? '<span class="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Dentro do Território Moçambicano</span>'
                : '<span class="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Posição Fora de Moçambique</span>'
            }
          </div>
          <p class="text-[10px] text-slate-400">
            Sinal capturado com sucesso pelo sensor do dispositivo.
          </p>
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
        // Outside Mozambique: adjust view smoothly
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
        errorMsg = 'Acesso à localização bloqueado pelo navegador. Para permitir, clique no ícone de permissões junto à barra de endereço.';
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

  const focusOccurrenceOnMap = (occ: Occurrence) => {
    const map = mapInstanceRef.current;
    if (map) {
      const [lat, lng] = getSafeCoordinates(occ);
      map.flyTo([lat, lng], 11, { duration: 1.0 });
    }
    onSelectOccurrence(occ);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
        {/* Row 1: Province Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
              Província:
            </span>
            <button
              onClick={() => setSelectedProvince('Todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedProvince === 'Todas'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Nacional (Todas)
            </button>
            {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => {
              const isSelected = selectedProvince === prov;
              return (
                <button
                  key={prov}
                  onClick={() => setSelectedProvince(prov as MozambiqueProvince)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {prov}
                </button>
              );
            })}
          </div>

          {/* Right actions: Layer switch & Report button */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveLayer('marcadores')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  activeLayer === 'marcadores'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pontos ({filteredOccurrences.length})</span>
              </button>
              <button
                onClick={() => setActiveLayer('calor')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  activeLayer === 'calor'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Mapa de Calor</span>
              </button>
              <button
                onClick={() => setActiveLayer('comparador')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  activeLayer === 'comparador'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Antes/Depois</span>
              </button>

              <button
                onClick={() => {
                  setShowBarChartSection(!showBarChartSection);
                  if (!showBarChartSection) {
                    setTimeout(() => {
                      const el = document.getElementById('map-category-chart-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  showBarChartSection
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Alternar exibição do gráfico comparativo"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Estatísticas</span>
              </button>
            </div>

            <button
              onClick={onNewReport}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>+ Reportar Ocorrência</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Input by District or Province with Live Autocomplete */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="relative flex-1" ref={searchDropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (districtMatches.length > 0) {
                    handleSelectDistrictQuick(districtMatches[0]);
                  } else if (provinceMatches.length > 0) {
                    handleSelectProvinceQuick(provinceMatches[0]);
                  } else if (filteredOccurrences.length > 0 && mapInstanceRef.current) {
                    const first = filteredOccurrences[0];
                    const [lat, lng] = getSafeCoordinates(first);
                    mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.2 });
                    setIsSearchOpen(false);
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Pesquisar distrito ou província rapidamente (ex: Matola, Pemba, Gorongosa, Inhambane, Vilankulo, Chókwè...)"
              className="w-full pl-9 pr-28 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  {filteredOccurrences.length} ocorrência{filteredOccurrences.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    setActiveFeedbackLocation(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live Autocomplete Suggestions Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[1100] max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {/* 1. Provinces Section */}
                {provinceMatches.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span>Províncias de Moçambique</span>
                    </p>
                    <div className="space-y-0.5">
                      {provinceMatches.map((prov) => {
                        const pInfo = MOZAMBIQUE_PROVINCES[prov];
                        const occCount = occurrences.filter((o) => o.province === prov).length;
                        return (
                          <button
                            key={prov}
                            onClick={() => handleSelectProvinceQuick(prov)}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                🏛️ Província
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                  {prov}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">
                                  Capital: {pInfo.capital}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {occCount} registo{occCount === 1 ? '' : 's'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Districts Section */}
                {districtMatches.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>Distritos & Municípios</span>
                    </p>
                    <div className="space-y-0.5">
                      {districtMatches.map((dist) => {
                        const countInDist = occurrences.filter(
                          (o) => o.district.toLowerCase() === dist.name.toLowerCase()
                        ).length;
                        return (
                          <button
                            key={`${dist.province}-${dist.name}`}
                            onClick={() => handleSelectDistrictQuick(dist)}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                                📍 Distrito
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                  {dist.name}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">
                                  Província de {dist.province}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {dist.isProvincialCapital && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                                  Capital
                                </span>
                              )}
                              {countInDist > 0 && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {countInDist} ocorrência{countInDist === 1 ? '' : 's'}
                                </span>
                              )}
                              <Navigation className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Occurrences Section */}
                {occurrenceMatches.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Ocorrências Correspondentes</span>
                    </p>
                    <div className="space-y-0.5">
                      {occurrenceMatches.map((occ) => (
                        <button
                          key={occ.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            focusOccurrenceOnMap(occ);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600">
                              {occ.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {occ.district}, {occ.province} • {occ.protocol}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${getSeverityBadgeClass(
                              occ.severity
                            )}`}
                          >
                            {occ.severity}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!hasSearchMatches && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum distrito, província ou ocorrência coincide com &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (districtMatches.length > 0) {
                  handleSelectDistrictQuick(districtMatches[0]);
                } else if (provinceMatches.length > 0) {
                  handleSelectProvinceQuick(provinceMatches[0]);
                } else if (filteredOccurrences.length > 0 && mapInstanceRef.current) {
                  const first = filteredOccurrences[0];
                  const [lat, lng] = getSafeCoordinates(first);
                  mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.2 });
                  setIsSearchOpen(false);
                }
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Buscar no mapa"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>

          {/* Quick Filter District Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 md:pb-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Distritos:
            </span>
            {['Matola', 'Gorongosa', 'Beira', 'Pemba', 'Vilankulo', 'Chókwè', 'Nacala', 'Moatize'].map((distName) => {
              const geo = MOZAMBIQUE_DISTRICTS.find(
                (d) => d.name.toLowerCase() === distName.toLowerCase()
              );
              return (
                <button
                  key={distName}
                  type="button"
                  onClick={() => {
                    if (geo) {
                      handleSelectDistrictQuick(geo);
                    } else {
                      setSearchQuery(distName);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === distName.toLowerCase()
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {distName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Badge when user has focused location */}
        {activeFeedbackLocation && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Mapa centrado em: <strong>{activeFeedbackLocation}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setActiveFeedbackLocation(null);
                handleResetView();
              }}
              className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline font-bold cursor-pointer"
            >
              Restaurar Visão Nacional
            </button>
          </div>
        )}

        {/* Row 3: Category and Severity Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filtros Dinâmicos:</span>
            </span>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por Categoria Ambiental"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  Categoria: {cat}
                </option>
              ))}
            </select>

            {/* Severity Select */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filtrar por Gravidade"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              {SEVERITIES_LIST.map((sev) => (
                <option key={sev} value={sev}>
                  Gravidade: {sev}
                </option>
              ))}
            </select>

            {(selectedCategory !== 'Todas' || selectedSeverity !== 'Todas' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSelectedSeverity('Todas');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900 text-[11px]">
              {criticalCount} Críticos
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900 text-[11px]">
              {highCount} Altos
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 text-[11px]">
              Total: {filteredOccurrences.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          {/* Map Header Status */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 dark:text-white">
                {selectedProvince === 'Todas' ? 'Visualização Geral de Moçambique' : `Província de ${selectedProvince}`}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                {filteredOccurrences.length} ocorrências ativas renderizadas
              </span>
            </div>
            {currentProvinceData && (
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">Capital: <strong>{currentProvinceData.capital}</strong></span>
                <span className="text-slate-600 dark:text-slate-300">
                  Vulnerabilidade: <strong className="text-rose-600 dark:text-rose-400">{currentProvinceData.vulnerabilityIndex}%</strong>
                </span>
              </div>
            )}
          </div>

          {/* Interactive Leaflet GIS Map or Before/After Comparator */}
          <div className="relative flex-1 w-full min-h-[580px] bg-slate-900 overflow-hidden flex flex-col">
            {activeLayer === 'comparador' ? (
              <div className="p-6 flex-1 flex items-center justify-center min-h-[580px]">
                <div className="relative z-10 w-full max-w-xl bg-slate-800/90 rounded-xl p-5 border border-slate-700 text-white">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400">Comparação Temporal de Intervenção</h4>
                      <p className="text-xs text-slate-300">Costa da Beira (Sofala) — Restauração de Mangais</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setComparePeriod('2024')}
                        className={`px-3 py-1 text-xs rounded font-semibold cursor-pointer ${
                          comparePeriod === '2024' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2024 (Antes)
                      </button>
                      <button
                        onClick={() => setComparePeriod('2026')}
                        className={`px-3 py-1 text-xs rounded font-semibold cursor-pointer ${
                          comparePeriod === '2026' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2026 (Atual)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 h-44 bg-slate-950 flex items-center justify-center">
                        <img
                          src="/assets/img/eco/erosao.jpg"
                          alt="Área degradada 2024"
                          className="object-cover w-full h-full opacity-80"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-rose-400">
                          Outubro 2024: Degradação Severa
                        </span>
                      </div>
                      <ul className="text-[11px] text-slate-300 space-y-1">
                        <li>• 65 ha de mangleiros abatidos</li>
                        <li>• Intrusão salina nas machambas</li>
                        <li>• Alto risco de inundação de maré</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-emerald-500/40 h-44 bg-slate-950 flex items-center justify-center">
                        <img
                          src="/assets/img/eco/mangais.jpg"
                          alt="Área restaurada 2026"
                          className="object-cover w-full h-full"
                        />
                        <span className="absolute bottom-2 left-2 bg-emerald-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                          Setembro 2026: Regeneração
                        </span>
                      </div>
                      <ul className="text-[11px] text-slate-300 space-y-1">
                        <li>• 120.000 propágulos plantados</li>
                        <li>• Redução de 45% na erosão de margem</li>
                        <li>• Retorno de fauna aquática e caranguejo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={mapWrapperRef}
                className={`relative w-full flex-1 h-full min-h-[580px] overflow-hidden flex flex-col ${
                  isFullscreen
                    ? '!fixed !inset-0 !z-[2500] !w-screen !h-screen !rounded-none !bg-slate-950'
                    : ''
                }`}
                style={
                  isFullscreen
                    ? { height: '100vh', width: '100vw', maxHeight: '100vh' }
                    : undefined
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
                    <button
                      onClick={() => setShowOccurrencesLayer(!showOccurrencesLayer)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all border cursor-pointer ${
                        showOccurrencesLayer
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      <span>Ocorrências ({filteredOccurrences.length})</span>
                    </button>

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

                {/* Floating Environmental Telemetry Live Banner */}
                {(showWindLayer || showTidesLayer || currentBaseMap === 'topo' || currentBaseMap === 'ocean' || showTopographyLayer) && (
                  <div className="absolute top-16 left-3 z-[450] pointer-events-auto flex flex-wrap items-center gap-2 max-w-[90%]">
                    {showWindLayer && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-sky-500/50 text-white shadow-xl flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                          <Wind className="w-3.5 h-3.5 animate-pulse" />
                          <span>Alísios SE: 28 km/h (15 kt)</span>
                        </div>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-300 hidden sm:inline">Canal de Moçambique</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Risco Fogo: Moderado
                        </span>
                      </div>
                    )}

                    {showTidesLayer && (
                      <button
                        type="button"
                        onClick={() => setSelectedTideModalStation(MOZAMBIQUE_TIDE_STATIONS[0])}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800/95 backdrop-blur-md border border-cyan-500/50 text-white shadow-xl flex items-center gap-2 text-xs transition-transform hover:scale-102 cursor-pointer"
                        title="Clique para ver Detalhes dos Marégrafos e Dinâmica do Oceano"
                      >
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <Waves className="w-3.5 h-3.5 animate-bounce" />
                          <span>Porto da Beira: 5.6m (Enchente ↗)</span>
                        </div>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-300 hidden sm:inline">Preia-Mar: 6.9m</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Maré Viva (Coef. 94) ℹ️
                        </span>
                      </button>
                    )}

                    {(currentBaseMap === 'topo' || showTopographyLayer) && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-amber-500/50 text-white shadow-xl flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Mountain className="w-3.5 h-3.5" />
                          <span>Monte Binga: 2.436m</span>
                        </div>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-300 hidden md:inline">Gorongosa: 1.863m | Namúli: 2.419m</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Relevo Físico
                        </span>
                      </div>
                    )}
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
                    className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Afastar (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="h-px bg-slate-700 my-0.5" />
                  <button
                    onClick={handleResetView}
                    className="p-2 rounded-lg text-slate-200 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Centrar em Moçambique"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-map-locate-me"
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

                {/* Leaflet DOM Node with ref */}
                <div ref={mapContainerRef} className="w-full flex-1 h-full min-h-[580px] z-0" />

                {/* Bottom Status & Coordinate Ribbon */}
                <div className="absolute bottom-2 left-3 right-3 z-[450] pointer-events-none flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-200">
                  <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 pointer-events-auto flex items-center space-x-2.5 shadow-md">
                    <span className="flex items-center space-x-1 font-mono text-[10px] text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>MAPA ATIVO</span>
                    </span>
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

                  {/* Severity Legend */}
                  <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 pointer-events-auto hidden md:flex items-center space-x-2.5 shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gravidade:</span>
                    <span className="flex items-center space-x-1 text-[10px] text-rose-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Crítico</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] text-orange-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>Alto</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Médio</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Baixo</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Occurrences List & Province Dossier Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Province Details Card */}
          {currentProvinceData ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{currentProvinceData.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Capital: {currentProvinceData.capital}</p>
                </div>
                <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                  Risco {currentProvinceData.vulnerabilityIndex}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <span className="text-slate-400 dark:text-slate-400 block text-[10px]">População:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{currentProvinceData.population}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <span className="text-slate-400 dark:text-slate-400 block text-[10px]">Área Territorial:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{currentProvinceData.areaKm2}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Principais Ameaças Mapeadas:
                </span>
                <div className="flex flex-wrap gap-1">
                  {currentProvinceData.dominantThreats.map((threat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]"
                    >
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-900 dark:text-emerald-200 text-xs">
              <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Moçambique: 11 Províncias Monitoradas</span>
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Clique em qualquer província para analisar dados desagregados de vulnerabilidade climática, histórico de ocorrências e projetos de intervenção em andamento.
              </p>
            </div>
          )}

          {/* Sidebar Tab Control next to Map */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setSidebarView('resumo')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                sidebarView === 'resumo'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Resumo Geral</span>
            </button>
            <button
              type="button"
              onClick={() => setSidebarView('lista')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                sidebarView === 'lista'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lista de Ocorrências ({filteredOccurrences.length})</span>
            </button>
          </div>

          {/* VIEW A: Recharts Summary Widget */}
          {sidebarView === 'resumo' ? (
            <div className="space-y-3">
              <OccurrenceSummaryWidget
                occurrences={filteredOccurrences}
                selectedCategory={selectedCategory}
                selectedSeverity={selectedSeverity}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onSelectSeverity={(sev) => setSelectedSeverity(sev)}
              />

              <button
                type="button"
                onClick={() => setSidebarView('lista')}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>Ver lista detalhada das {filteredOccurrences.length} ocorrências</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* VIEW B: Filtered Occurrences Stream */
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <span>Ocorrências Filtradas</span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold">
                    {filteredOccurrences.length}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setSelectedProvince('Todas');
                    setSelectedCategory('Todas');
                    setSelectedSeverity('Todas');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {filteredOccurrences.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center">
                    <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium">Nenhuma ocorrência encontrada com estes filtros.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Altere a província, categoria ou gravidade.</p>
                  </div>
                ) : (
                  filteredOccurrences.map((occ) => (
                    <div
                      key={occ.id}
                      onClick={() => focusOccurrenceOnMap(occ)}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight">
                          {occ.title}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${getSeverityBadgeClass(
                            occ.severity
                          )}`}
                        >
                          {occ.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {occ.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-400" />
                          <span>{occ.district}, {occ.province}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {occ.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recharts Comparative Bar Chart by Category */}
      {showBarChartSection && (
        <div id="map-category-chart-section" className="mt-8 transition-all">
          <CategoryOccurrencesBarChart
            occurrences={occurrences}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Selected Tide Station Full Telemetry Modal */}
      {selectedTideModalStation && (
        <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 text-slate-800 dark:text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTideModalStation(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-2xl shadow-lg shrink-0">
                🌊
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                    Marégrafo Costeiro • {selectedTideModalStation.province}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Coef: {selectedTideModalStation.coefficient}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedTideModalStation.name}
                </h3>
              </div>
            </div>

            {/* Gauge Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Nível Atual</span>
                <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                  {selectedTideModalStation.currentHeightM}m
                </span>
                <span className="text-[10px] text-slate-500 block capitalize">
                  {selectedTideModalStation.cycle === 'enchente' ? 'Enchente ↗' : 'Vazante ↘'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Preia-Mar</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {selectedTideModalStation.highTideM}m
                </span>
                <span className="text-[10px] text-slate-500 block">
                  às {selectedTideModalStation.nextHighTideTime}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Baixa-Mar</span>
                <span className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono">
                  {selectedTideModalStation.lowTideM}m
                </span>
                <span className="text-[10px] text-slate-500 block">
                  às {selectedTideModalStation.nextLowTideTime}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Temp. / Salin.</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                  {selectedTideModalStation.waterTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {selectedTideModalStation.salinityPsu} PSU
                </span>
              </div>
            </div>

            {/* Description & Ecological Vulnerability Context */}
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
              <strong className="text-slate-900 dark:text-white block mb-1">Contexto Hidrodinâmico & Risco Costeiro:</strong>
              {selectedTideModalStation.description}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  mapInstanceRef.current?.flyTo([selectedTideModalStation.lat, selectedTideModalStation.lng], 11, { duration: 1.2 });
                  setSelectedTideModalStation(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Centrar no Marégrafo</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTideModalStation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Dynamics Quick Access Drawer (Wind, Tides & Topography Stations) */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              ⛰️
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Moçambique: Dinâmica de Relevo, Vento Atmosférico & Marés Costeiras</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Ao Vivo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A topografia e os ventos alísios no Canal de Moçambique definem os regimes de maré, a propagação de queimadas no planalto e os impactos de cheias costeiras.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentBaseMap('topo');
                setShowTopographyLayer(true);
                setShowWindLayer(true);
                setShowTidesLayer(true);
                mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Ativar Modo Relevo Completo no Mapa</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars Grid: Relevo, Ventos, Marés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Column 1: Cumes & Relevo Topográfico */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Mountain className="w-4 h-4" />
                <span>Cumes & Elevações Principais</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Topografia MZ</span>
            </div>
            <div className="space-y-2">
              {MOZAMBIQUE_TOPOGRAPHY_FEATURES.map((feat) => (
                <button
                  key={feat.name}
                  onClick={() => {
                    setCurrentBaseMap('topo');
                    setShowTopographyLayer(true);
                    mapInstanceRef.current?.flyTo([feat.lat, feat.lng], 9, { duration: 1.2 });
                    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {feat.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{feat.province} • {feat.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-black text-[11px]">
                    {feat.elevation}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Ventos & Estações Meteorológicas */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Wind className="w-4 h-4" />
                <span>Ventos & Estações INAM</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Alísios & Rajadas</span>
            </div>
            <div className="space-y-2">
              {MOZAMBIQUE_WIND_STATIONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setShowWindLayer(true);
                    mapInstanceRef.current?.flyTo([w.lat, w.lng], 8.5, { duration: 1.2 });
                    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-sky-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                      {w.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Dir: {w.directionText} • {w.temperatureC}°C</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-mono font-black text-[11px]">
                      {w.speedKmh} km/h
                    </span>
                    <span className={`block text-[9px] font-bold mt-0.5 ${w.fireSpreadRisk === 'Alto' ? 'text-rose-500' : 'text-slate-400'}`}>
                      Fogo: {w.fireSpreadRisk}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Marégrafos & Dinâmica Costeira */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <Waves className="w-4 h-4" />
                <span>Marégrafos & Portos Costeiros</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Canal de Moçambique</span>
            </div>
            <div className="space-y-2">
              {MOZAMBIQUE_TIDE_STATIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTideModalStation(t)}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                      {t.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Preia-Mar: {t.highTideM}m • {t.cycle}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-mono font-black text-[11px]">
                      {t.currentHeightM}m
                    </span>
                    <span className="block text-[9px] text-cyan-600 font-bold mt-0.5">
                      Ver marégrafo ℹ️
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

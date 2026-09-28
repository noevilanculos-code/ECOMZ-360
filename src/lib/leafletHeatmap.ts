import L from 'leaflet';
import { Occurrence, SeverityLevel, EnvironmentalCategory, MozambiqueProvince } from '../types';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  severity?: SeverityLevel;
  title?: string;
  category?: EnvironmentalCategory;
}

export interface HeatmapOptions {
  radius?: number; // Base pixel radius at zoom 8 (default: 35)
  blur?: number;   // Radial gradient blur factor (default: 15)
  maxOpacity?: number; // 0.1 to 1.0 (default: 0.8)
  minOpacity?: number; // default: 0.05
  gradient?: { [stop: number]: string };
}

export interface CriticalZone {
  id: string;
  name: string;
  province: MozambiqueProvince;
  district: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  totalIncidents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  dominantCategory: EnvironmentalCategory;
  riskScore: number; // Weighted composite risk index
  riskLevel: 'Crítico Extremo' | 'Alto Risco' | 'Risco Moderado';
  recommendedAction: string;
  occurrences: Occurrence[];
}

// Default high-contrast thermal gradient suitable for environmental authority crisis detection
export const DEFAULT_HEATMAP_GRADIENT: { [stop: number]: string } = {
  0.0: 'rgba(0, 0, 255, 0)',
  0.15: 'rgba(59, 130, 246, 0.45)', // Blue (Low)
  0.35: 'rgba(6, 182, 212, 0.7)',   // Cyan
  0.50: 'rgba(16, 185, 129, 0.85)', // Emerald/Lime
  0.68: 'rgba(250, 204, 21, 0.9)',  // Yellow/Amber
  0.82: 'rgba(249, 115, 22, 0.95)', // Orange (High)
  0.95: 'rgba(239, 68, 68, 1.0)',   // Red (Critical)
  1.0: 'rgba(153, 27, 27, 1.0)'     // Dark Maroon/Crimson (Critical Core)
};

/**
 * Custom High-Performance HTML5 Canvas Heatmap Layer for Leaflet
 */
export class CanvasHeatmapLayer {
  private map: L.Map | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private points: HeatmapPoint[] = [];
  private options: Required<HeatmapOptions>;
  private palette: Uint8ClampedArray | null = null;
  private circleTemplate: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;

  constructor(points: HeatmapPoint[] = [], options: HeatmapOptions = {}) {
    this.points = points;
    this.options = {
      radius: options.radius ?? 38,
      blur: options.blur ?? 18,
      maxOpacity: options.maxOpacity ?? 0.82,
      minOpacity: options.minOpacity ?? 0.05,
      gradient: options.gradient ?? DEFAULT_HEATMAP_GRADIENT
    };
    this.initPalette();
    this.initCircleTemplate();
  }

  private initPalette() {
    const paletteCanvas = document.createElement('canvas');
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const ctx = paletteCanvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 256, 1);
    for (const stop in this.options.gradient) {
      grad.addColorStop(parseFloat(stop), this.options.gradient[stop]);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 1);
    this.palette = ctx.getImageData(0, 0, 256, 1).data;
  }

  private initCircleTemplate() {
    const r = this.options.radius;
    const blur = this.options.blur;
    const diameter = (r + blur) * 2;

    const circleCanvas = document.createElement('canvas');
    circleCanvas.width = diameter;
    circleCanvas.height = diameter;
    const ctx = circleCanvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createRadialGradient(r + blur, r + blur, 0, r + blur, r + blur, r + blur);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(r + blur, r + blur, r + blur, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    this.circleTemplate = circleCanvas;
  }

  public addTo(map: L.Map) {
    this.map = map;
    this.canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer') as HTMLCanvasElement;
    this.canvas.style.position = 'absolute';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '350';
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    const pane = map.getPanes().overlayPane;
    pane.appendChild(this.canvas);

    map.on('move', this.handleMapEvent, this);
    map.on('moveend', this.handleMapEvent, this);
    map.on('zoom', this.handleMapEvent, this);
    map.on('zoomend', this.handleMapEvent, this);
    map.on('viewreset', this.handleMapEvent, this);
    map.on('resize', this.handleMapEvent, this);

    this.redraw();
    return this;
  }

  public remove() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.map && this.canvas) {
      this.map.off('move', this.handleMapEvent, this);
      this.map.off('moveend', this.handleMapEvent, this);
      this.map.off('zoom', this.handleMapEvent, this);
      this.map.off('zoomend', this.handleMapEvent, this);
      this.map.off('viewreset', this.handleMapEvent, this);
      this.map.off('resize', this.handleMapEvent, this);

      try {
        const pane = this.map.getPanes().overlayPane;
        if (pane && this.canvas.parentNode === pane) {
          pane.removeChild(this.canvas);
        }
      } catch (e) {
        // safe ignore
      }
    }
    this.canvas = null;
    this.ctx = null;
    this.map = null;
  }

  public setPoints(points: HeatmapPoint[]) {
    this.points = points;
    this.redraw();
  }

  public setOptions(options: Partial<HeatmapOptions>) {
    let updateTemplate = false;
    let updatePalette = false;

    if (options.radius !== undefined && options.radius !== this.options.radius) {
      this.options.radius = options.radius;
      updateTemplate = true;
    }
    if (options.blur !== undefined && options.blur !== this.options.blur) {
      this.options.blur = options.blur;
      updateTemplate = true;
    }
    if (options.maxOpacity !== undefined) {
      this.options.maxOpacity = options.maxOpacity;
    }
    if (options.minOpacity !== undefined) {
      this.options.minOpacity = options.minOpacity;
    }
    if (options.gradient !== undefined) {
      this.options.gradient = options.gradient;
      updatePalette = true;
    }

    if (updatePalette) this.initPalette();
    if (updateTemplate) this.initCircleTemplate();

    this.redraw();
  }

  private handleMapEvent = () => {
    this.redraw();
  };

  public redraw() {
    if (!this.map || !this.canvas || !this.ctx) return;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(() => {
      this.render();
    });
  }

  private render() {
    if (!this.map || !this.canvas || !this.ctx || !this.palette || !this.circleTemplate) return;

    const map = this.map;
    const canvas = this.canvas;
    const ctx = this.ctx;
    const size = map.getSize();
    const bounds = map.getBounds();

    // High DPI / Retina support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = size.x;
    const height = size.y;
    if (width <= 0 || height <= 0) return;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, topLeft);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (this.points.length === 0) {
      ctx.restore();
      return;
    }

    // Step 1: Draw radial gray scale alpha circles
    const r = this.options.radius;
    const blur = this.options.blur;
    const radiusWithBlur = r + blur;

    // Zoom dynamic scaling
    const currentZoom = map.getZoom();
    const zoomScale = Math.max(0.6, Math.min(1.8, Math.pow(1.15, currentZoom - 6)));

    const scaledTemplateSize = radiusWithBlur * 2 * zoomScale;
    const halfScaledSize = scaledTemplateSize / 2;

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      // Quick bounds test with padding
      if (
        p.lat < bounds.getSouth() - 1.5 ||
        p.lat > bounds.getNorth() + 1.5 ||
        p.lng < bounds.getWest() - 1.5 ||
        p.lng > bounds.getEast() + 1.5
      ) {
        continue;
      }

      const point = map.latLngToContainerPoint([p.lat, p.lng]);
      const w = Math.min(Math.max(p.weight || 0.5, 0.1), 1.5);

      ctx.globalAlpha = Math.min(w * 0.7, 1.0);
      ctx.drawImage(
        this.circleTemplate,
        point.x - halfScaledSize,
        point.y - halfScaledSize,
        scaledTemplateSize,
        scaledTemplateSize
      );
    }

    // Step 2: Colorize via ImageData color gradient transfer
    try {
      const imgData = ctx.getImageData(0, 0, width * dpr, height * dpr);
      const data = imgData.data;
      const len = data.length;
      const palette = this.palette;
      const maxOp = this.options.maxOpacity;
      const minOp = this.options.minOpacity;

      for (let i = 3; i < len; i += 4) {
        const alpha = data[i];
        if (alpha > 0) {
          const offset = alpha * 4;
          data[i - 3] = palette[offset];     // R
          data[i - 2] = palette[offset + 1]; // G
          data[i - 1] = palette[offset + 2]; // B

          // Rescale alpha with user-chosen maximum opacity
          const normalizedAlpha = alpha / 255;
          const finalAlpha = Math.min(
            255,
            Math.max(minOp * 255, normalizedAlpha * maxOp * 255)
          );
          data[i] = finalAlpha;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      // In case of any cross-origin or canvas security issue, fallback gracefully
    }

    ctx.restore();
  }
}

/**
 * Computes severity weight for occurrence heatmap
 */
export function getOccurrenceHeatWeight(sev: SeverityLevel): number {
  switch (sev) {
    case 'Crítico':
      return 1.15; // Dominant heat signature
    case 'Alto':
      return 0.85;
    case 'Médio':
      return 0.55;
    case 'Baixo':
      return 0.30;
    default:
      return 0.45;
  }
}

/**
 * Distance in kilometers using Haversine formula
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Intelligent Spatial Clustering & Hotspot Identification Algorithm for Authorities
 * Groups occurrences into Critical Zones, calculates composite risk, and generates actionable advice
 */
export function detectCriticalZones(
  occurrences: Occurrence[],
  maxClusterRadiusKm: number = 75
): CriticalZone[] {
  if (occurrences.length === 0) return [];

  // Group occurrences that are geographically proximate
  const clusters: {
    occurrences: Occurrence[];
    centerLat: number;
    centerLng: number;
    province: MozambiqueProvince;
    district: string;
  }[] = [];

  const visited = new Set<string>();

  for (let i = 0; i < occurrences.length; i++) {
    const occ = occurrences[i];
    if (visited.has(occ.id)) continue;

    const lat1 = occ.coordinates?.lat;
    const lng1 = occ.coordinates?.lng;
    if (!lat1 || !lng1 || isNaN(lat1) || isNaN(lng1)) continue;

    visited.add(occ.id);
    const clusterOccs = [occ];

    for (let j = 0; j < occurrences.length; j++) {
      if (i === j) continue;
      const other = occurrences[j];
      if (visited.has(other.id)) continue;

      const lat2 = other.coordinates?.lat;
      const lng2 = other.coordinates?.lng;
      if (!lat2 || !lng2 || isNaN(lat2) || isNaN(lng2)) continue;

      const dist = haversineKm(lat1, lng1, lat2, lng2);
      if (dist <= maxClusterRadiusKm) {
        visited.add(other.id);
        clusterOccs.push(other);
      }
    }

    // Calculate centroid
    let sumLat = 0;
    let sumLng = 0;
    clusterOccs.forEach((o) => {
      sumLat += o.coordinates.lat;
      sumLng += o.coordinates.lng;
    });

    clusters.push({
      occurrences: clusterOccs,
      centerLat: sumLat / clusterOccs.length,
      centerLng: sumLng / clusterOccs.length,
      province: occ.province,
      district: occ.district || occ.province
    });
  }

  // Transform clusters into formal CriticalZones
  const criticalZones: CriticalZone[] = clusters.map((c, idx) => {
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    const categoryCount: { [cat: string]: number } = {};

    c.occurrences.forEach((occ) => {
      if (occ.severity === 'Crítico') criticalCount++;
      else if (occ.severity === 'Alto') highCount++;
      else if (occ.severity === 'Médio') mediumCount++;
      else lowCount++;

      categoryCount[occ.category] = (categoryCount[occ.category] || 0) + 1;
    });

    // Dominant category
    let dominantCat: EnvironmentalCategory = c.occurrences[0].category;
    let maxCatCount = 0;
    for (const cat in categoryCount) {
      if (categoryCount[cat] > maxCatCount) {
        maxCatCount = categoryCount[cat];
        dominantCat = cat as EnvironmentalCategory;
      }
    }

    // Weighted Risk Score: Critical=4, High=2.5, Medium=1.2, Low=0.5
    const riskScore = Number(
      (
        criticalCount * 4.0 +
        highCount * 2.5 +
        mediumCount * 1.2 +
        lowCount * 0.5 +
        c.occurrences.length * 0.8
      ).toFixed(1)
    );

    let riskLevel: 'Crítico Extremo' | 'Alto Risco' | 'Risco Moderado' = 'Risco Moderado';
    if (criticalCount >= 2 || riskScore >= 12.0) {
      riskLevel = 'Crítico Extremo';
    } else if (criticalCount >= 1 || highCount >= 2 || riskScore >= 7.0) {
      riskLevel = 'Alto Risco';
    }

    // Action recommendations based on dominant category and risk
    let recommendedAction = '';
    if (dominantCat === 'Queimadas Descontroladas') {
      recommendedAction =
        'Acionamento imediato da brigada aero-terrestre de combate a incêndios e aviso prévio a comunidades limítrofes.';
    } else if (dominantCat === 'Poluição Hídrica') {
      recommendedAction =
        'Coleta urgente de amostras de água pela AQUA, interdição cautelar de captação e autuação de fontes poluidoras.';
    } else if (dominantCat === 'Desmatamento' || dominantCat === 'Destruição de Mangais') {
      recommendedAction =
        'Despacho de patrulha conjunta ANAC/SDAE, apreensão de motosserras/fornos e embargo judicial da área explorada.';
    } else if (dominantCat === 'Erosão Costeira/Pluvial') {
      recommendedAction =
        'Notificação ao INGD para evacuação preventiva de habitações vulneráveis e instalação de paliçadas de contenção.';
    } else if (dominantCat === 'Mineração Ilegal') {
      recommendedAction =
        'Operação policial de desmantelamento de garimpo ilegal com apreensão de maquinários e neutralização de poços de mercúrio.';
    } else {
      recommendedAction =
        'Mobilização da equipa técnica distrital para fiscalização in loco nas próximas 24 horas.';
    }

    const zoneName = `${c.district} (${c.province})`;

    return {
      id: `zone-${idx + 1}`,
      name: zoneName,
      province: c.province,
      district: c.district,
      centerLat: Number(c.centerLat.toFixed(4)),
      centerLng: Number(c.centerLng.toFixed(4)),
      radiusKm: Math.max(18, Math.min(50, c.occurrences.length * 10)),
      totalIncidents: c.occurrences.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      dominantCategory: dominantCat,
      riskScore,
      riskLevel,
      recommendedAction,
      occurrences: c.occurrences
    };
  });

  // Sort by risk score descending so highest-risk zones appear first
  return criticalZones.sort((a, b) => b.riskScore - a.riskScore);
}

import L from 'leaflet';
import { MozambiqueProvince } from '../types';

export interface TideStation {
  id: string;
  name: string;
  port: string;
  province: MozambiqueProvince;
  lat: number;
  lng: number;
  currentHeightM: number;
  highTideM: number;
  lowTideM: number;
  nextHighTideTime: string;
  nextLowTideTime: string;
  cycle: 'enchente' | 'vazante' | 'estofo';
  coefficient: number; // 20 to 120 (Sizígia > 90)
  waterTempC: number;
  salinityPsu: number;
  riskStatus: 'normal' | 'alerta_ressaca' | 'perigo_inundacao';
  description: string;
}

export interface WindStation {
  id: string;
  name: string;
  province: MozambiqueProvince;
  lat: number;
  lng: number;
  speedKmh: number;
  speedKnots: number;
  directionDeg: number;
  directionText: string;
  gustKmh: number;
  temperatureC: number;
  humidityPercent: number;
  fireSpreadRisk: 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';
}

export interface OceanCurrentPoint {
  lat: number;
  lng: number;
  angleDeg: number; // South-southwest for Mozambique current
  speedKnots: number;
  label: string;
}

export const MOZAMBIQUE_TIDE_STATIONS: TideStation[] = [
  {
    id: 'tide-beira',
    name: 'Porto da Beira (Estuário do Púnguè)',
    port: 'Porto da Beira',
    province: 'Sofala',
    lat: -19.8333,
    lng: 34.8389,
    currentHeightM: 5.6,
    highTideM: 6.9, // One of the highest tidal amplitudes in the Indian Ocean
    lowTideM: 0.8,
    nextHighTideTime: '15:42',
    nextLowTideTime: '21:55',
    cycle: 'enchente',
    coefficient: 94,
    waterTempC: 27.2,
    salinityPsu: 31.4,
    riskStatus: 'alerta_ressaca',
    description: 'Estuário com macromaré de até 7 metros. Risco de galgamento costeiro nos bairros de Praia Nova e Chiveve em marés vivas.'
  },
  {
    id: 'tide-maputo',
    name: 'Porto e Baía de Maputo',
    port: 'Porto de Maputo',
    province: 'Maputo Cidade',
    lat: -25.9692,
    lng: 32.5732,
    currentHeightM: 2.8,
    highTideM: 3.6,
    lowTideM: 0.5,
    nextHighTideTime: '16:15',
    nextLowTideTime: '22:30',
    cycle: 'enchente',
    coefficient: 86,
    waterTempC: 25.1,
    salinityPsu: 34.8,
    riskStatus: 'normal',
    description: 'Baía abrigada com maré semidiurna regular. Monitorização das correntes do Canal da Polana e estuário do Espírito Santo.'
  },
  {
    id: 'tide-nacala',
    name: 'Porto de Nacala (Águas Profundas)',
    port: 'Porto de Nacala',
    province: 'Nampula',
    lat: -14.5428,
    lng: 40.6728,
    currentHeightM: 3.1,
    highTideM: 4.1,
    lowTideM: 0.7,
    nextHighTideTime: '14:50',
    nextLowTideTime: '21:10',
    cycle: 'vazante',
    coefficient: 82,
    waterTempC: 28.0,
    salinityPsu: 35.2,
    riskStatus: 'normal',
    description: 'Maior porto natural de águas profundas da África Oriental. Excelente calado náutico, com recifes de coral na entrada da baía.'
  },
  {
    id: 'tide-quelimane',
    name: 'Porto de Quelimane / Rio dos Bons Sinais',
    port: 'Porto de Quelimane',
    province: 'Zambézia',
    lat: -17.8786,
    lng: 36.8883,
    currentHeightM: 3.7,
    highTideM: 4.6,
    lowTideM: 0.9,
    nextHighTideTime: '15:20',
    nextLowTideTime: '21:40',
    cycle: 'enchente',
    coefficient: 88,
    waterTempC: 27.5,
    salinityPsu: 29.8,
    riskStatus: 'alerta_ressaca',
    description: 'Intensa dinâmica estuarina no Rio Bons Sinais com mangais extensos. Maré viva gera penetração salina até 30 km a montante.'
  },
  {
    id: 'tide-pemba',
    name: 'Baía de Pemba',
    port: 'Porto de Pemba',
    province: 'Cabo Delgado',
    lat: -12.9732,
    lng: 40.5178,
    currentHeightM: 2.9,
    highTideM: 3.8,
    lowTideM: 0.6,
    nextHighTideTime: '14:35',
    nextLowTideTime: '20:50',
    cycle: 'vazante',
    coefficient: 78,
    waterTempC: 28.6,
    salinityPsu: 35.4,
    riskStatus: 'normal',
    description: 'Terceira maior baía natural do mundo. Marés calmas com rica biodiversidade marinha e áreas de pradarias de ervas marinhas.'
  },
  {
    id: 'tide-vilankulo',
    name: 'Canal de Bazaruto & Vilankulo',
    port: 'Canal de Vilankulo',
    province: 'Inhambane',
    lat: -22.0089,
    lng: 35.3189,
    currentHeightM: 2.4,
    highTideM: 3.3,
    lowTideM: 0.4,
    nextHighTideTime: '15:58',
    nextLowTideTime: '22:12',
    cycle: 'enchente',
    coefficient: 84,
    waterTempC: 26.4,
    salinityPsu: 35.0,
    riskStatus: 'normal',
    description: 'Zona de proteção dos dugongos e recifes de coral. Correntes de maré entre ilhas atingem até 3 nós durante a sizígia.'
  }
];

export const MOZAMBIQUE_WIND_STATIONS: WindStation[] = [
  {
    id: 'wind-beira',
    name: 'Estação Costeira Sofala (Beira)',
    province: 'Sofala',
    lat: -19.795,
    lng: 34.88,
    speedKmh: 28,
    speedKnots: 15,
    directionDeg: 135,
    directionText: 'SE (Alísios)',
    gustKmh: 42,
    temperatureC: 28.5,
    humidityPercent: 78,
    fireSpreadRisk: 'Moderado'
  },
  {
    id: 'wind-maputo',
    name: 'Estação Baía de Maputo (Costa do Sol)',
    province: 'Maputo Cidade',
    lat: -25.92,
    lng: 32.61,
    speedKmh: 22,
    speedKnots: 12,
    directionDeg: 170,
    directionText: 'S-SE',
    gustKmh: 35,
    temperatureC: 26.0,
    humidityPercent: 72,
    fireSpreadRisk: 'Baixo'
  },
  {
    id: 'wind-vilankulo',
    name: 'Estação Litoral Inhambane (Vilankulo)',
    province: 'Inhambane',
    lat: -21.98,
    lng: 35.34,
    speedKmh: 26,
    speedKnots: 14,
    directionDeg: 140,
    directionText: 'SE',
    gustKmh: 38,
    temperatureC: 27.8,
    humidityPercent: 76,
    fireSpreadRisk: 'Moderado'
  },
  {
    id: 'wind-tete',
    name: 'Estação Vale do Zambeze (Tete)',
    province: 'Tete',
    lat: -16.16,
    lng: 33.59,
    speedKmh: 34,
    speedKnots: 18,
    directionDeg: 100,
    directionText: 'E (Leste)',
    gustKmh: 52,
    temperatureC: 36.2,
    humidityPercent: 32,
    fireSpreadRisk: 'Extremo'
  },
  {
    id: 'wind-niassa',
    name: 'Estação Miombo Interior (Lichinga/Marrupa)',
    province: 'Niassa',
    lat: -13.31,
    lng: 35.24,
    speedKmh: 24,
    speedKnots: 13,
    directionDeg: 80,
    directionText: 'ENE',
    gustKmh: 40,
    temperatureC: 29.0,
    humidityPercent: 41,
    fireSpreadRisk: 'Alto'
  },
  {
    id: 'wind-pemba',
    name: 'Estação Cabo Delgado (Pemba)',
    province: 'Cabo Delgado',
    lat: -12.95,
    lng: 40.54,
    speedKmh: 18,
    speedKnots: 10,
    directionDeg: 45,
    directionText: 'NE (Monção)',
    gustKmh: 28,
    temperatureC: 29.8,
    humidityPercent: 82,
    fireSpreadRisk: 'Baixo'
  },
  {
    id: 'wind-gaza',
    name: 'Estação Bacia do Limpopo (Chókwè/Xai-Xai)',
    province: 'Gaza',
    lat: -24.52,
    lng: 33.0,
    speedKmh: 25,
    speedKnots: 13.5,
    directionDeg: 160,
    directionText: 'SSE',
    gustKmh: 39,
    temperatureC: 31.0,
    humidityPercent: 55,
    fireSpreadRisk: 'Alto'
  }
];

export const MOZAMBIQUE_CURRENT_POINTS: OceanCurrentPoint[] = [
  { lat: -11.5, lng: 41.5, angleDeg: 195, speedKnots: 2.4, label: 'Corrente das Quirimbas' },
  { lat: -14.2, lng: 41.8, angleDeg: 200, speedKnots: 2.6, label: 'Canal de Moçambique Norte' },
  { lat: -17.5, lng: 39.5, angleDeg: 205, speedKnots: 2.8, label: 'Giro de Angoche' },
  { lat: -20.2, lng: 36.8, angleDeg: 210, speedKnots: 2.2, label: 'Corrente de Moçambique (Sofala)' },
  { lat: -23.0, lng: 36.5, angleDeg: 200, speedKnots: 2.5, label: 'Corrente de Bazaruto' },
  { lat: -25.5, lng: 34.8, angleDeg: 195, speedKnots: 2.9, label: 'Confluência de Inhambane' },
  { lat: -27.2, lng: 34.0, angleDeg: 190, speedKnots: 3.2, label: 'Início da Corrente das Agulhas' }
];

export const MOZAMBIQUE_TOPOGRAPHY_FEATURES = [
  {
    name: 'Monte Binga (Ponto Mais Alto)',
    elevation: '2.436 m',
    province: 'Manica',
    lat: -19.7744,
    lng: 33.0617,
    type: 'Maciço Montanhoso / Chimanimani',
    climateRole: 'Barreira orográfica que condensa nuvens do Canal de Moçambique e irriga os rios do centro.'
  },
  {
    name: 'Serra da Gorongosa',
    elevation: '1.863 m',
    province: 'Sofala',
    lat: -18.4619,
    lng: 34.0539,
    type: 'Castelo de Água / Floresta Montana',
    climateRole: 'Berço hídrico que alimenta a Bacia do Púnguè e o Parque Nacional da Gorongosa.'
  },
  {
    name: 'Maciço de Namúli',
    elevation: '2.419 m',
    province: 'Zambézia',
    lat: -15.3583,
    lng: 37.0347,
    type: 'Inselberg Granítico',
    climateRole: 'Zona de endemismo botânico e regulação das chuvas agrícolas da Alta Zambézia.'
  },
  {
    name: 'Planalto de Lichinga',
    elevation: '1.360 m',
    province: 'Niassa',
    lat: -13.3125,
    lng: 35.2406,
    type: 'Planalto Interior',
    climateRole: 'Clima temperado de altitude e divisor de águas entre o Lago Niassa e o Oceano Índico.'
  },
  {
    name: 'Depressão do Vale do Zambeze',
    elevation: '120 m',
    province: 'Tete',
    lat: -15.65,
    lng: 32.75,
    type: 'Fenda Tectónica / Vale Fluvial',
    climateRole: 'Corredor térmico quente com microclima árido e alto potencial hidroelétrico (Cahora Bassa).'
  }
];

/**
 * Animated Canvas Wind Streamlines Layer for Leaflet
 */
export class CanvasWindLayer extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private particles: {
    x: number;
    y: number;
    lat: number;
    lng: number;
    age: number;
    maxAge: number;
    speed: number;
  }[] = [];
  private numParticles: number = 320;
  private windSpeedFactor: number = 1.0;

  constructor(options?: { numParticles?: number; speedFactor?: number }) {
    super();
    if (options?.numParticles) this.numParticles = options.numParticles;
    if (options?.speedFactor) this.windSpeedFactor = options.speedFactor;
  }

  onAdd(map: L.Map): this {
    const pane = map.getPane('overlayPane');
    if (!pane) return this;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '450';
    canvas.className = 'leaflet-wind-canvas';
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    pane.appendChild(canvas);

    this.resize();
    this.initParticles();

    map.on('move', this.onMapMove, this);
    map.on('moveend', this.onMapMoveEnd, this);
    map.on('zoomend', this.onMapMoveEnd, this);

    this.startAnimation();
    return this;
  }

  onRemove(map: L.Map): this {
    this.stopAnimation();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.particles = [];

    map.off('move', this.onMapMove, this);
    map.off('moveend', this.onMapMoveEnd, this);
    map.off('zoomend', this.onMapMoveEnd, this);
    return this;
  }

  public setSpeedFactor(factor: number) {
    this.windSpeedFactor = factor;
  }

  private resize() {
    const map = this._map;
    if (!map || !this.canvas) return;

    const size = map.getSize();
    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = size.x * pixelRatio;
    this.canvas.height = size.y * pixelRatio;
    this.canvas.style.width = `${size.x}px`;
    this.canvas.style.height = `${size.y}px`;

    if (this.ctx) {
      this.ctx.scale(pixelRatio, pixelRatio);
    }

    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);
  }

  private initParticles() {
    const map = this._map;
    if (!map) return;

    const bounds = map.getBounds();
    this.particles = [];

    for (let i = 0; i < this.numParticles; i++) {
      const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
      const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
      const pt = map.latLngToContainerPoint([lat, lng]);

      this.particles.push({
        x: pt.x,
        y: pt.y,
        lat,
        lng,
        age: Math.floor(Math.random() * 80),
        maxAge: 70 + Math.floor(Math.random() * 60),
        speed: (1.2 + Math.random() * 1.8) * this.windSpeedFactor
      });
    }
  }

  private onMapMove() {
    const map = this._map;
    if (!map || !this.canvas) return;
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);
  }

  private onMapMoveEnd() {
    this.resize();
    this.initParticles();
  }

  private getWindVector(lat: number, lng: number): { u: number; v: number; speedMag: number } {
    // Mozambique Channel Wind Field Model:
    // Predominant Southeast Trade Winds (Alísios de Sudeste) curving towards Central/North
    // Southern Mozambique (Maputo/Gaza): S/SSE winds
    // Central Mozambique (Sofala/Zambézia): SE winds channeled through the Mozambique Channel
    // Northern Mozambique (Cabo Delgado): Seasonal monsoon shift (NE in wet season, SE in dry)
    let u = -0.7; // west-northwestward component
    let v = -0.9; // northward component

    if (lat > -15) {
      // Northern Mozambique
      u = -0.5 + Math.sin(lng * 0.1) * 0.3;
      v = -0.6;
    } else if (lat < -22) {
      // Southern Mozambique
      u = -0.4;
      v = -1.1;
    } else {
      // Mozambique Channel funnel
      u = -0.85;
      v = -0.75;
    }

    // Inland deflection by mountain spine (Gorongosa & Chimanimani)
    if (lng < 34.5 && lat > -21 && lat < -17) {
      u += 0.2; // slight eastward deflection at the base of mountains
      v -= 0.2;
    }

    const speedMag = Math.sqrt(u * u + v * v);
    return { u: u / (speedMag || 1), v: v / (speedMag || 1), speedMag: 1.0 };
  }

  private startAnimation() {
    const animate = () => {
      this.draw();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private stopAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private draw() {
    const map = this._map;
    if (!map || !this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const size = map.getSize();
    const bounds = map.getBounds();

    // Semi-transparent fade background to create smooth streamline comet trails
    ctx.fillStyle = 'rgba(6, 43, 61, 0.08)';
    ctx.fillRect(0, 0, size.x, size.y);

    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.age++;

      if (p.age > p.maxAge || p.x < -10 || p.x > size.x + 10 || p.y < -10 || p.y > size.y + 10) {
        // Respawn particle randomly in current viewport
        p.lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
        p.lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
        const pt = map.latLngToContainerPoint([p.lat, p.lng]);
        p.x = pt.x;
        p.y = pt.y;
        p.age = 0;
        p.maxAge = 70 + Math.floor(Math.random() * 60);
        continue;
      }

      const vec = this.getWindVector(p.lat, p.lng);
      const step = p.speed * 2.2;
      const nextX = p.x + vec.u * step;
      const nextY = p.y + vec.v * step;

      // Color streamline according to age & wind intensity (Cyan -> Emerald glow)
      const alpha = Math.sin((p.age / p.maxAge) * Math.PI) * 0.75;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`; // Sky-400

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();

      p.x = nextX;
      p.y = nextY;

      // Update latLng coordinates
      const newLatLng = map.containerPointToLatLng([p.x, p.y]);
      p.lat = newLatLng.lat;
      p.lng = newLatLng.lng;
    }
  }
}

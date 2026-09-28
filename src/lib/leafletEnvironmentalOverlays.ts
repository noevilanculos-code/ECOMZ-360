import L from 'leaflet';

export interface EnvironmentalStation {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  windSpeedKmh: number;
  windDirDeg: number;
  windDirText: string;
  humidityPct: number;
  maresiaLevel: 'Baixa' | 'Moderada' | 'Alta' | 'Extrema';
  salinityPsu: number;
  tempC: number;
  notes: string;
}

export const MOZ_ENVIRONMENTAL_STATIONS: EnvironmentalStation[] = [
  {
    id: 'st-maputo',
    name: 'Estação Baía de Maputo',
    province: 'Maputo Cidade',
    lat: -25.9692,
    lng: 32.5732,
    windSpeedKmh: 22,
    windDirDeg: 140,
    windDirText: 'SE',
    humidityPct: 74,
    maresiaLevel: 'Alta',
    salinityPsu: 35.2,
    tempC: 26,
    notes: 'Maresia costeira moderada na Costa do Sol e KaTembe. Ventos do quadrante Sueste.'
  },
  {
    id: 'st-beira',
    name: 'Estação Estuário da Beira',
    province: 'Sofala',
    lat: -19.8333,
    lng: 34.8389,
    windSpeedKmh: 31,
    windDirDeg: 120,
    windDirText: 'ESE',
    humidityPct: 82,
    maresiaLevel: 'Extrema',
    salinityPsu: 34.8,
    tempC: 28,
    notes: 'Elevada humidade e salinidade aerosolizada na foz do Púnguè. Mangais atuam como filtro de sal.'
  },
  {
    id: 'st-quelimane',
    name: 'Estação Costeira de Quelimane',
    province: 'Zambézia',
    lat: -17.8786,
    lng: 36.8883,
    windSpeedKmh: 20,
    windDirDeg: 135,
    windDirText: 'SE',
    humidityPct: 86,
    maresiaLevel: 'Alta',
    salinityPsu: 35.0,
    tempC: 29,
    notes: 'Clima tropical húmido estuarino com nevoeiros matinais e névoa salina no Rio Bons Sinais.'
  },
  {
    id: 'st-nampula',
    name: 'Estação Interior de Nampula',
    province: 'Nampula',
    lat: -15.1165,
    lng: 39.2666,
    windSpeedKmh: 16,
    windDirDeg: 90,
    windDirText: 'E',
    humidityPct: 62,
    maresiaLevel: 'Baixa',
    salinityPsu: 0,
    tempC: 30,
    notes: 'Zona de transição planáltica com humidade moderada e sem influência de aerossol marinho.'
  },
  {
    id: 'st-pemba',
    name: 'Estação Baía de Pemba',
    province: 'Cabo Delgado',
    lat: -12.974,
    lng: 40.5178,
    windSpeedKmh: 26,
    windDirDeg: 110,
    windDirText: 'ESE',
    humidityPct: 78,
    maresiaLevel: 'Alta',
    salinityPsu: 35.5,
    tempC: 29,
    notes: 'Brisa marinha constante da Baía de Pemba e Canal de Moçambique com maresia ativa.'
  },
  {
    id: 'st-tete',
    name: 'Estação Vale do Zambeze (Tete)',
    province: 'Tete',
    lat: -16.1564,
    lng: 33.5862,
    windSpeedKmh: 14,
    windDirDeg: 80,
    windDirText: 'ENE',
    humidityPct: 45,
    maresiaLevel: 'Baixa',
    salinityPsu: 0,
    tempC: 35,
    notes: 'Clima seco e quente no vale do Zambeze. Baixa humidade relativa e ausência de maresia.'
  },
  {
    id: 'st-chimoio',
    name: 'Estação Planalto de Manica',
    province: 'Manica',
    lat: -19.1164,
    lng: 33.4833,
    windSpeedKmh: 18,
    windDirDeg: 150,
    windDirText: 'SSE',
    humidityPct: 68,
    maresiaLevel: 'Baixa',
    salinityPsu: 0,
    tempC: 24,
    notes: 'Relevo montanhoso com nevoeiros orográficos frequentes junto à cordilheira de Chimanimani.'
  },
  {
    id: 'st-xai-xai',
    name: 'Estação Foz do Limpopo (Xai-Xai)',
    province: 'Gaza',
    lat: -25.0444,
    lng: 33.6444,
    windSpeedKmh: 25,
    windDirDeg: 160,
    windDirText: 'SSE',
    humidityPct: 76,
    maresiaLevel: 'Alta',
    salinityPsu: 35.1,
    tempC: 27,
    notes: 'Maresia intensa na Praia do Xai-Xai e remanso salino nas dunas costeiras.'
  }
];

/**
 * Clean, subtle Wind Layer using standard Leaflet vector DivIcons (Non-blocking)
 */
export function buildWindOverlayGroup(): L.LayerGroup {
  const group = L.layerGroup();

  MOZ_ENVIRONMENTAL_STATIONS.forEach((st) => {
    // Subtle vector pin with directional arrow and speed
    const iconHtml = `
      <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white border border-sky-400/60 shadow-xs text-[10px] font-sans whitespace-nowrap cursor-pointer hover:bg-sky-900 transition-all hover:scale-105 pointer-events-auto">
        <span class="text-sky-300 font-bold" style="display:inline-block; transform: rotate(${st.windDirDeg}deg);">➔</span>
        <span class="font-mono font-bold text-sky-200">${st.windSpeedKmh}</span>
        <span class="text-[9px] text-slate-300">km/h</span>
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'clean-wind-badge',
      iconSize: [80, 22],
      iconAnchor: [40, 11]
    });

    const marker = L.marker([st.lat, st.lng], { icon });
    marker.bindPopup(`
      <div class="p-2.5 max-w-[220px] font-sans text-xs text-slate-800">
        <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
          <span class="font-bold text-sky-700">💨 Vento & Clima</span>
          <span class="text-[10px] text-slate-400 font-mono">${st.province}</span>
        </div>
        <h5 class="font-bold text-slate-900">${st.name}</h5>
        <div class="grid grid-cols-2 gap-1 my-1.5 p-1.5 bg-sky-50 rounded text-center text-[10px]">
          <div>Velocidade: <strong class="text-sky-800 block text-xs">${st.windSpeedKmh} km/h</strong></div>
          <div>Direção: <strong class="text-slate-800 block text-xs">${st.windDirText} (${st.windDirDeg}°)</strong></div>
        </div>
        <p class="text-[10px] text-slate-600">${st.notes}</p>
      </div>
    `);

    group.addLayer(marker);
  });

  return group;
}

/**
 * Clean, semi-transparent Maresia & Coastal Salinity Overlay
 * Uses subtle polygon strip along Mozambique's 2.700 km coast
 */
export function buildMaresiaOverlayGroup(): L.LayerGroup {
  const group = L.layerGroup();

  // Coastal band approximate coordinates along Mozambican littoral
  const coastalBandCoords: [number, number][] = [
    [-26.85, 32.85], // Ponta do Ouro
    [-25.96, 32.60], // Baía de Maputo
    [-24.95, 33.70], // Xai-Xai
    [-24.00, 35.40], // Inhambane / Maxixe
    [-22.00, 35.35], // Vilankulo
    [-20.80, 35.10], // Nova Mambone
    [-19.85, 34.90], // Beira
    [-18.50, 36.30], // Delta do Zambeze
    [-17.85, 37.05], // Quelimane
    [-16.00, 39.95], // Angoche
    [-15.00, 40.75], // Ilha de Moçambique
    [-14.50, 40.70], // Nacala
    [-12.95, 40.55], // Pemba
    [-11.50, 40.50], // Palma / Cabo Delgado
    [-11.50, 40.30], // Buffer interior (~20km inland)
    [-12.95, 40.35],
    [-14.50, 40.40],
    [-15.00, 40.45],
    [-16.00, 39.70],
    [-17.85, 36.75],
    [-18.50, 35.95],
    [-19.85, 34.65],
    [-20.80, 34.85],
    [-22.00, 35.10],
    [-24.00, 35.15],
    [-24.95, 33.45],
    [-25.96, 32.35],
    [-26.85, 32.65]
  ];

  const maresiaPolygon = L.polygon(coastalBandCoords, {
    color: '#06b6d4',
    weight: 1.5,
    dashArray: '4, 4',
    fillColor: '#0891b2',
    fillOpacity: 0.12 // Very subtle: map underneath remains 100% visible!
  });

  maresiaPolygon.bindPopup(`
    <div class="p-3 max-w-[240px] font-sans text-xs text-slate-800">
      <div class="flex items-center gap-1.5 font-bold text-cyan-700 pb-1 mb-1 border-b border-slate-100">
        <span>🌊 Faixa de Maresia & Salinidade Costeira</span>
      </div>
      <p class="text-[11px] text-slate-600 mb-2">
        Corredor litorâneo (0–20 km) sujeito ao aerossol marinho do Oceano Índico com salinidade de ~35 PSU.
      </p>
      <div class="p-2 rounded bg-cyan-50 text-[10px] text-cyan-900 border border-cyan-200">
        <strong>Impactos Monitorados:</strong>
        <ul class="list-disc pl-3 mt-1 space-y-0.5">
          <li>Corrosão salina de infraestruturas metálicas</li>
          <li>Intrusão em aquíferos de água doce</li>
          <li>Cinturão de mangal amortece a deposição de sal</li>
        </ul>
      </div>
    </div>
  `);

  group.addLayer(maresiaPolygon);

  // Add discrete coastal salinity probe icons
  MOZ_ENVIRONMENTAL_STATIONS.filter((s) => s.maresiaLevel !== 'Baixa').forEach((st) => {
    const probeHtml = `
      <div class="px-1.5 py-0.5 rounded bg-cyan-900/80 backdrop-blur-xs text-cyan-200 border border-cyan-400/50 text-[9px] font-mono font-bold shadow-xs whitespace-nowrap cursor-pointer hover:bg-cyan-800">
        🌊 ${st.salinityPsu} PSU
      </div>
    `;
    const icon = L.divIcon({
      html: probeHtml,
      className: 'clean-maresia-badge',
      iconSize: [65, 18],
      iconAnchor: [32, 9]
    });
    const marker = L.marker([st.lat, st.lng + 0.12], { icon });
    marker.bindPopup(`
      <div class="p-2 font-sans text-xs">
        <strong class="text-cyan-700 block">${st.name}</strong>
        <span class="text-slate-600 text-[11px]">Nível de Maresia: <strong>${st.maresiaLevel}</strong></span><br/>
        <span class="text-slate-600 text-[11px]">Salinidade: <strong>${st.salinityPsu} PSU</strong></span>
      </div>
    `);
    group.addLayer(marker);
  });

  return group;
}

/**
 * Clean, subtle Relative Humidity Zones of Mozambique
 * Very soft, transparent polygons with informative climate data
 */
export function buildHumidityOverlayGroup(): L.LayerGroup {
  const group = L.layerGroup();

  // Zone 1: Tropical Húmido do Norte & Costa Central (75 - 85% UR)
  const humidNorthCoastCoords: [number, number][] = [
    [-10.4, 40.4],
    [-11.0, 38.0],
    [-13.5, 36.5],
    [-16.0, 36.0],
    [-18.5, 36.5],
    [-20.0, 35.0],
    [-20.0, 34.6],
    [-17.0, 39.5],
    [-14.0, 40.8],
    [-10.4, 40.5]
  ];

  const humidPoly = L.polygon(humidNorthCoastCoords, {
    color: '#10b981',
    weight: 1.5,
    fillColor: '#10b981',
    fillOpacity: 0.08 // Very soft transparent
  });
  humidPoly.bindPopup(`
    <div class="p-2.5 font-sans text-xs">
      <span class="font-bold text-emerald-700 block text-xs">💧 Zona Húmida Tropical (75%–85% UR)</span>
      <p class="text-[11px] text-slate-600 mt-1">
        Cabo Delgado, Nampula e Zambézia costeira. Precipitação anual &gt; 1.000 mm. Risco de proliferação de fungos agrícolas e alagamentos estuarinos.
      </p>
    </div>
  `);
  group.addLayer(humidPoly);

  // Zone 2: Semi-Árido do Sul & Vale do Limpopo (< 55% UR)
  const semiAridSouthCoords: [number, number][] = [
    [-21.5, 31.5],
    [-21.5, 33.5],
    [-24.0, 33.0],
    [-25.5, 32.0],
    [-26.5, 32.0],
    [-25.5, 31.8],
    [-23.5, 31.3],
    [-21.5, 31.5]
  ];

  const dryPoly = L.polygon(semiAridSouthCoords, {
    color: '#f59e0b',
    weight: 1.5,
    fillColor: '#f59e0b',
    fillOpacity: 0.08
  });
  dryPoly.bindPopup(`
    <div class="p-2.5 font-sans text-xs">
      <span class="font-bold text-amber-700 block text-xs">☀️ Zona Semi-Árida do Interior (&lt; 55% UR)</span>
      <p class="text-[11px] text-slate-600 mt-1">
        Gaza interior (Pafúri, Chicualacuala) e Changara. Precipitação anual &lt; 500 mm. Elevado risco de seca e estresse hídrico na agricultura de subsistência.
      </p>
    </div>
  `);
  group.addLayer(dryPoly);

  // Discrete station humidity badges
  MOZ_ENVIRONMENTAL_STATIONS.forEach((st) => {
    const isDry = st.humidityPct < 55;
    const isHumid = st.humidityPct >= 75;
    const colorClass = isDry ? 'text-amber-300 border-amber-500/50' : isHumid ? 'text-emerald-300 border-emerald-500/50' : 'text-blue-300 border-blue-500/50';

    const iconHtml = `
      <div class="px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs ${colorClass} border text-[9px] font-mono font-bold shadow-xs whitespace-nowrap cursor-pointer hover:bg-slate-800">
        💧 ${st.humidityPct}% UR
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'clean-humidity-badge',
      iconSize: [60, 18],
      iconAnchor: [30, 9]
    });

    const marker = L.marker([st.lat - 0.08, st.lng], { icon });
    marker.bindPopup(`
      <div class="p-2 font-sans text-xs">
        <strong class="text-slate-900 block">${st.name}</strong>
        <span class="text-slate-600 text-[11px]">Humidade Relativa: <strong>${st.humidityPct}%</strong></span><br/>
        <span class="text-slate-600 text-[11px]">Temperatura: <strong>${st.tempC}°C</strong></span>
      </div>
    `);
    group.addLayer(marker);
  });

  return group;
}

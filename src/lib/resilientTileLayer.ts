import L from 'leaflet';

export interface TileSource {
  url: string;
  attribution: string;
  maxNativeZoom: number;
  maxZoom: number;
  subdomains?: string | string[];
}

export const addResilientTileLayer = (
  map: L.Map,
  primarySource: TileSource,
  onLayerChange: (layer: L.TileLayer) => void = () => undefined
): void => {
  const fallbackSource: TileSource = primarySource.url.includes('tile.openstreetmap.org')
    ? {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri, USGS, NOAA',
        maxNativeZoom: 19,
        maxZoom: 22
      }
    : {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 22
      };
  const sources = [primarySource, fallbackSource];
  let activeLayer: L.TileLayer | null = null;
  let activeSourceIndex = -1;
  let failureTimer: ReturnType<typeof setTimeout> | null = null;

  const activateSource = (sourceIndex: number) => {
    if (failureTimer) {
      clearTimeout(failureTimer);
      failureTimer = null;
    }
    if (activeLayer) {
      activeLayer.off();
      map.removeLayer(activeLayer);
    }

    activeSourceIndex = sourceIndex;
    let tileErrors = 0;
    let tileLoads = 0;
    const source = sources[sourceIndex];
    const nextLayer = L.tileLayer(source.url, {
      attribution: source.attribution,
      maxNativeZoom: source.maxNativeZoom,
      maxZoom: source.maxZoom,
      ...(source.subdomains ? { subdomains: source.subdomains } : {})
    });
    activeLayer = nextLayer;

    nextLayer.on('tileload', () => {
      if (activeLayer === nextLayer) tileLoads += 1;
    });
    nextLayer.on('tileerror', () => {
      if (activeLayer !== nextLayer) return;
      tileErrors += 1;
      if (!failureTimer) {
        failureTimer = setTimeout(() => {
          failureTimer = null;
          const shouldFallback = tileErrors >= 4 && tileLoads === 0;
          tileErrors = 0;
          tileLoads = 0;
          if (activeLayer !== nextLayer || !shouldFallback) return;
          if (activeSourceIndex < sources.length - 1) {
            activateSource(activeSourceIndex + 1);
          }
        }, 2500);
      }
    });

    nextLayer.addTo(map);
    onLayerChange(nextLayer);
  };

  if (sources.length > 0) activateSource(0);
};
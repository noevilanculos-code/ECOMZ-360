import React, { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Camera,
  MapPin,
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  UserCheck,
  Award,
  Search,
  Clock,
  Loader2,
  Navigation,
  Trash2,
  Sparkles,
  Eye,
  Image as ImageIcon,
  ZoomIn,
  SwitchCamera,
  Grid,
  Maximize2,
  X,
  RotateCcw,
  Check,
  CheckSquare,
  Map as MapIcon
} from 'lucide-react';
import {
  Occurrence,
  MozambiqueProvince,
  EnvironmentalCategory,
  SeverityLevel
} from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { CameraCaptureModal } from './CameraCaptureModal';
import { CitizenReportTour } from './CitizenReportTour';
import { exportToPDF } from '../utils/pdfExport';

interface EcoCitizenProps {
  onAddOccurrence: (newOcc: Occurrence) => void;
  occurrences: Occurrence[];
}

export const EcoCitizen: React.FC<EcoCitizenProps> = ({ onAddOccurrence, occurrences }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EnvironmentalCategory>('Destruição de Mangais');
  const [severity, setSeverity] = useState<SeverityLevel>('Médio');
  const [province, setProvince] = useState<MozambiqueProvince>('Sofala');
  const [district, setDistrict] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('Noé Samuel Vilanculos');
  const [capturedCoords, setCapturedCoords] = useState<{ lat: number; lng: number }>({
    lat: -19.8211,
    lng: 34.8562
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{
    status: 'idle' | 'success' | 'fallback';
    message: string;
  }>({
    status: 'idle',
    message: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [photoSourceType, setPhotoSourceType] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSampleGallery, setShowSampleGallery] = useState(false);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Live Inline Camera in Form State
  const [isInlineCameraOpen, setIsInlineCameraOpen] = useState(false);
  const [inlineFacingMode, setInlineFacingMode] = useState<'environment' | 'user'>('environment');
  const [inlineCameraError, setInlineCameraError] = useState<string | null>(null);
  const [inlineStream, setInlineStream] = useState<MediaStream | null>(null);
  const [showInlineGrid, setShowInlineGrid] = useState(true);
  const [isShutterFlash, setIsShutterFlash] = useState(false);
  const [isPreviewZoomOpen, setIsPreviewZoomOpen] = useState(false);
  const [isPreviewBeforeSubmitOpen, setIsPreviewBeforeSubmitOpen] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);

  // Leaflet Interactive Location Map state in Form
  const [showMapPicker, setShowMapPicker] = useState(false);
  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMapMarkerRef = useRef<L.Marker | null>(null);

  // Helper for dynamic severity marker styling in EcoCitizen
  const getSeverityPinColor = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Crítico':
        return '#ef4444';
      case 'Alto':
        return '#f97316';
      case 'Médio':
        return '#f59e0b';
      case 'Baixo':
        return '#10b981';
      default:
        return '#10b981';
    }
  };

  const getCategoryPinIcon = (cat: EnvironmentalCategory) => {
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

  // Mini Leaflet Map initialization and dynamic severity marker updates
  useEffect(() => {
    if (!showMapPicker || !miniMapContainerRef.current) return;

    if (miniMapInstanceRef.current) {
      try {
        miniMapInstanceRef.current.remove();
      } catch (e) {}
      miniMapInstanceRef.current = null;
    }

    const container = miniMapContainerRef.current as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(miniMapContainerRef.current, {
      center: [capturedCoords.lat, capturedCoords.lng],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri World Imagery',
      maxNativeZoom: 18,
      maxZoom: 20
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri Reference',
      maxNativeZoom: 18,
      maxZoom: 20
    }).addTo(map);

    const pinColor = getSeverityPinColor(severity);
    const pinSymbol = getCategoryPinIcon(category);
    const isCritical = severity === 'Crítico';
    const isHigh = severity === 'Alto';

    const customIcon = L.divIcon({
      html: `
        <div class="eco-marker-stable-container select-none cursor-pointer">
          ${isCritical || isHigh ? `<div class="eco-pulse-beacon ${isCritical ? 'eco-pulse-beacon-critical' : ''}" style="background-color: ${pinColor};"></div>` : ''}
          <div class="eco-marker-core-badge" style="background-color: ${pinColor};">
            <span>${pinSymbol}</span>
          </div>
        </div>
      `,
      className: 'custom-leaflet-pin',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([capturedCoords.lat, capturedCoords.lng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-2 text-xs font-sans">
        <strong class="block text-slate-900">${title || 'Novo Incidente Ambiental'}</strong>
        <span class="text-[10px] text-slate-500">${district || 'Distrito'}, ${province}</span>
        <div class="mt-1 text-[10px] font-bold text-white px-2 py-0.5 rounded" style="background-color: ${pinColor}">
          Gravidade: ${severity}
        </div>
      </div>
    `);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newLat = Number(pos.lat.toFixed(5));
      const newLng = Number(pos.lng.toFixed(5));
      setCapturedCoords({ lat: newLat, lng: newLng });
      setGpsFeedback({
        status: 'success',
        message: `Coordenadas ajustadas via marcador: ${newLat}, ${newLng}`
      });
    });

    map.on('click', (e) => {
      const newLat = Number(e.latlng.lat.toFixed(5));
      const newLng = Number(e.latlng.lng.toFixed(5));
      marker.setLatLng([newLat, newLng]);
      setCapturedCoords({ lat: newLat, lng: newLng });
      setGpsFeedback({
        status: 'success',
        message: `Coordenadas ajustadas no mapa: ${newLat}, ${newLng}`
      });
    });

    miniMapInstanceRef.current = map;
    miniMapMarkerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      try {
        map.remove();
      } catch (e) {}
      miniMapInstanceRef.current = null;
    };
  }, [showMapPicker]);

  // Update marker position and styling dynamically when severity, coords, or category change
  useEffect(() => {
    if (!miniMapMarkerRef.current || !miniMapInstanceRef.current) return;
    const pinColor = getSeverityPinColor(severity);
    const pinSymbol = getCategoryPinIcon(category);
    const isCritical = severity === 'Crítico';
    const isHigh = severity === 'Alto';

    const customIcon = L.divIcon({
      html: `
        <div class="eco-marker-stable-container select-none cursor-pointer">
          ${isCritical || isHigh ? `<div class="eco-pulse-beacon ${isCritical ? 'eco-pulse-beacon-critical' : ''}" style="background-color: ${pinColor};"></div>` : ''}
          <div class="eco-marker-core-badge" style="background-color: ${pinColor};">
            <span>${pinSymbol}</span>
          </div>
        </div>
      `,
      className: 'custom-leaflet-pin',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    miniMapMarkerRef.current.setIcon(customIcon);
    miniMapMarkerRef.current.setLatLng([capturedCoords.lat, capturedCoords.lng]);
    miniMapInstanceRef.current.panTo([capturedCoords.lat, capturedCoords.lng]);
  }, [severity, category, capturedCoords]);

  const inlineVideoRef = useRef<HTMLVideoElement | null>(null);
  const inlineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop inline camera stream tracks
  const stopInlineCamera = useCallback(() => {
    if (inlineStream) {
      inlineStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setInlineStream(null);
    }
    setIsInlineCameraOpen(false);
  }, [inlineStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (inlineStream) {
        inlineStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [inlineStream]);

  // Start inline camera stream
  const startInlineCamera = useCallback(async (facing: 'environment' | 'user' = inlineFacingMode) => {
    setInlineCameraError(null);
    if (inlineStream) {
      inlineStream.getTracks().forEach((t) => t.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setInlineCameraError('Acesso à câmara não suportado neste navegador. Utilize o carregamento de ficheiro.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setInlineStream(stream);
      setIsInlineCameraOpen(true);

      if (inlineVideoRef.current) {
        inlineVideoRef.current.srcObject = stream;
        await inlineVideoRef.current.play().catch(() => {});
      }

      // Automatically capture GPS if not yet available
      if (gpsFeedback.status !== 'success') {
        handleCaptureGPS();
      }
    } catch (err: any) {
      console.warn('Erro na câmara inline:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setInlineCameraError('Permissão da câmara foi recusada. Autorize o acesso à câmara nas definições do navegador.');
      } else {
        setInlineCameraError('Não foi possível iniciar a câmara. Verifique se outro aplicativo está a usá-la.');
      }
    }
  }, [inlineFacingMode, inlineStream, gpsFeedback.status]);

  const toggleInlineFacingMode = () => {
    const nextFacing = inlineFacingMode === 'environment' ? 'user' : 'environment';
    setInlineFacingMode(nextFacing);
    startInlineCamera(nextFacing);
  };

  // Capture frame from inline video stream
  const captureInlinePhoto = () => {
    const video = inlineVideoRef.current;
    const canvas = inlineCanvasRef.current;
    if (!video || !canvas) return;

    // Trigger visual shutter flash
    setIsShutterFlash(true);
    setTimeout(() => setIsShutterFlash(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror if front camera
    if (inlineFacingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    // Official Forensic Watermark
    const now = new Date();
    const timeFormatted =
      now.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) +
      ' • ' +
      now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Watermark background band
    const bannerHeight = Math.max(50, Math.round(height * 0.09));
    ctx.fillStyle = 'rgba(6, 43, 61, 0.90)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Green Accent line
    ctx.fillStyle = '#00B956';
    ctx.fillRect(0, height - bannerHeight, width, 3);

    // Text on banner
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(13, Math.round(width * 0.016))}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText('ECO-MZ 360 • EVIDÊNCIA OFICIAL DE CAMPO', 20, height - bannerHeight + 22);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = `${Math.max(11, Math.round(width * 0.013))}px 'Plus Jakarta Sans', monospace`;
    const locText = `GPS: ${capturedCoords.lat.toFixed(5)}, ${capturedCoords.lng.toFixed(5)} • ${district || 'Distrito'}, ${province} • ${timeFormatted}`;
    ctx.fillText(locText, 20, height - bannerHeight + 42);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSelectedPhoto(dataUrl);
    setPhotoSourceType('camera');
    setCapturedTimestamp(timeFormatted);

    // Stop stream and close viewfinder
    stopInlineCamera();
  };

  const handlePhotoCapturedFromCamera = (photoDataUrl: string) => {
    setSelectedPhoto(photoDataUrl);
    setPhotoSourceType('camera');
    const now = new Date();
    setCapturedTimestamp(
      now.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' • ' +
      now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
    );
    if (gpsFeedback.status !== 'success') {
      handleCaptureGPS();
    }
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          setPhotoSourceType('upload');
          const now = new Date();
          setCapturedTimestamp(
            now.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' • ' +
            now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
          );
          if (gpsFeedback.status !== 'success') {
            handleCaptureGPS();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Search Protocol state
  const [searchProtocolInput, setSearchProtocolInput] = useState('');
  const [trackedOccurrence, setTrackedOccurrence] = useState<Occurrence | null>(null);

  const categories: EnvironmentalCategory[] = [
    'Destruição de Mangais',
    'Desmatamento',
    'Queimadas Descontroladas',
    'Poluição Hídrica',
    'Erosão Costeira/Pluvial',
    'Resíduos Sólidos Urbanos',
    'Caça Furtiva & Biodiversidade',
    'Mineração Ilegal'
  ];

  const handleCaptureGPS = () => {
    setIsGettingLocation(true);
    setGpsFeedback({ status: 'idle', message: 'A contactar sensor GPS...' });

    if (navigator && 'geolocation' in navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          const acc = Math.round(position.coords.accuracy || 15);
          setCapturedCoords({ lat, lng });
          setIsGettingLocation(false);
          setGpsFeedback({
            status: 'success',
            message: `GPS capturado com precisão de ±${acc}m`
          });
        },
        (err) => {
          // Fallback to province default coords
          const provCoords = MOZAMBIQUE_PROVINCES[province];
          setCapturedCoords({ lat: provCoords.lat, lng: provCoords.lng });
          setIsGettingLocation(false);
          let reason = 'Sinal GPS indisponível';
          if (err.code === 1) reason = 'Permissão GPS negada';
          else if (err.code === 3) reason = 'Tempo limite excedido';
          setGpsFeedback({
            status: 'fallback',
            message: `${reason}: Coordenadas de referência da província (${province}) aplicadas.`
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      const provCoords = MOZAMBIQUE_PROVINCES[province];
      setCapturedCoords({ lat: provCoords.lat, lng: provCoords.lng });
      setIsGettingLocation(false);
      setGpsFeedback({
        status: 'fallback',
        message: `Geolocalização não suportada: Coordenadas de ${province} aplicadas.`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !district.trim() || !description.trim()) {
      return;
    }

    const uniqueId = `occ-${Date.now()}`;
    const generatedProtocol = `ECO-2026-MZ-${Math.floor(100 + Math.random() * 900)}`;

    const newOcc: Occurrence = {
      id: uniqueId,
      protocol: generatedProtocol,
      title: title.trim(),
      category,
      severity,
      province,
      district: district.trim(),
      locationDetails: locationDetails.trim() || 'Coordenadas capturadas via GPS',
      coordinates: capturedCoords,
      reportedBy: isAnonymous ? 'Cidadão Anónimo' : reporterName,
      isAnonymous,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Em Validação',
      description: description.trim(),
      imageUrl: selectedPhoto,
      validationScore: 85
    };

    onAddOccurrence(newOcc);
    setSubmittedProtocol(generatedProtocol);

    // Reset fields
    setTitle('');
    setDistrict('');
    setLocationDetails('');
    setDescription('');
  };

  const handleTrackProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    const found = occurrences.find(
      (o) => o.protocol.toLowerCase().trim() === searchProtocolInput.toLowerCase().trim()
    );
    setTrackedOccurrence(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Citizen Eco-Reputation */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-700/60 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              <span>ECO-CITIZEN • Participação Comunitária</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Portal do Cidadão Guardião Ambiental</h2>
            <p className="text-emerald-100 text-xs max-w-2xl leading-relaxed">
              Reporte agressões ecológicas, desmatamento, queimadas e lixeiras com anonimato protegido e georreferenciação. Cada reporte validado fortalece a intervenção das autoridades distritais em Moçambique.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 flex items-center space-x-4 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xs">
              <p className="text-emerald-200 font-medium">Reputação do Cidadão</p>
              <p className="text-sm font-bold">Nível 3: Guardião Ativo</p>
              <p className="text-[10px] text-emerald-300">92% de reportes confirmados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 3-Step Citizen Guide */}
      <CitizenReportTour variant="banner" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          {submittedProtocol ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ocorrência Submetida com Sucesso!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                O seu reporte foi registado no sistema nacional de monitorização. Guarde o protocolo para acompanhar a validação técnica e o envio de brigadas de intervenção:
              </p>
              <div className="inline-block bg-white px-4 py-2 rounded-lg border border-emerald-300 font-mono text-sm font-bold text-emerald-800 shadow-xs">
                {submittedProtocol}
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    exportToPDF({
                      title: `Comprovativo Oficial de Denuncia — ${submittedProtocol}`,
                      subtitle: 'Registo de Participacao Comunitaria • Observatorio ECO-MZ 360',
                      category,
                      region: province,
                      author: isAnonymous ? 'Cidadao Anonimo (Protegido pela Lei n. 20/97)' : reporterName,
                      summary:
                        'Comprovativo oficial de submissao de ocorrencia ambiental. Utilize o codigo de protocolo acima para consultar o andamento da validacao tecnica e intervencao.',
                      metrics: [
                        { label: 'Codigo de Protocolo', value: submittedProtocol },
                        { label: 'Categoria Ambiental', value: category },
                        { label: 'Provincia', value: province },
                        { label: 'Estado Inicial', value: 'Em Validacao Tecnica' }
                      ],
                      filename: `comprovativo-${submittedProtocol.toLowerCase()}.pdf`
                    })
                  }
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Exportar Comprovativo (PDF)</span>
                </button>
                <button
                  onClick={() => setSubmittedProtocol(null)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Registar Outra Ocorrência
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Formulário de Registo de Ocorrência</h3>
                <p className="text-xs text-slate-500">
                  Preencha as informações do local e anexe fotografias de evidência para acelerar a validação.
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abate descontrolado de árvores na margem do rio..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category & Severity Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria Ambiental *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EnvironmentalCategory)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gravidade Estimada *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Baixo">Baixo (Impacto localizado recente)</option>
                    <option value="Médio">Médio (Ameaça em progressão)</option>
                    <option value="Alto">Alto (Risco elevado a comunidades ou fauna)</option>
                    <option value="Crítico">Crítico (Danos severos e contaminação ativa)</option>
                  </select>
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Província *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value as MozambiqueProvince)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Distrito / Município *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beira, Marrupa, Matola, Chimoio..."
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location details & GPS coordinates */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ponto de Referência / Bairro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Perto do posto de saúde comunitário, margem esquerda da ponte..."
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Coordenadas do Local:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
                      {capturedCoords.lat}, {capturedCoords.lng}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                        showMapPicker
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                      title="Visualizar e ajustar localização num mapa interativo Leaflet"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{showMapPicker ? 'Ocultar Mapa' : 'Ver/Ajustar no Mapa Leaflet'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureGPS}
                      disabled={isGettingLocation}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isGettingLocation
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                          <span>A Obter GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Capturar Minha Posição GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Leaflet Mini Map Preview in Form */}
                {showMapPicker && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSeverityPinColor(severity) }} />
                        <span>Marcador dinâmico de gravidade: <strong style={{ color: getSeverityPinColor(severity) }}>{severity}</strong></span>
                      </span>
                      <span className="text-[10px] text-slate-400">Clique ou arraste o marcador para ajustar o local exato</span>
                    </div>
                    <div
                      ref={miniMapContainerRef}
                      className="w-full h-56 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 z-0 shadow-inner"
                    />
                  </div>
                )}

                {gpsFeedback.message && (
                  <div className={`text-[11px] flex items-center space-x-1.5 pt-1 border-t ${
                    gpsFeedback.status === 'success'
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : gpsFeedback.status === 'fallback'
                      ? 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {gpsFeedback.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                    {gpsFeedback.status === 'fallback' && <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />}
                    <span>{gpsFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição dos Factos Observados *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva detalhadamente o que presenciou, possíveis causadores, extensão da área e impactos observados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Photographic Evidence Attachment */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Evidência Fotográfica do Problema Ambiental *
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Georreferenciação Forense Ativa
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tire uma fotografia em tempo real utilizando a câmara do seu dispositivo para validação imediata pelas autoridades ambientais.
                </p>

                {/* Inline Camera Viewfinder or Action Bar */}
                {isInlineCameraOpen ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500 shadow-xl space-y-3 p-3">
                    {/* Viewfinder Video Container */}
                    <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <video
                        ref={inlineVideoRef}
                        playsInline
                        autoPlay
                        muted
                        className={`w-full h-full object-cover ${inlineFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />

                      {/* Rule of thirds grid lines */}
                      {showInlineGrid && (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-30">
                          <div className="border-r border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-b border-white" />
                          <div className="border-r border-white" />
                          <div className="border-r border-white" />
                          <div />
                        </div>
                      )}

                      {/* Shutter visual flash effect */}
                      {isShutterFlash && (
                        <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
                      )}

                      {/* Top floating control icons */}
                      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 border border-slate-700 pointer-events-auto">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Câmara Ao Vivo</span>
                        </span>

                        <div className="flex items-center space-x-1.5 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => setShowInlineGrid(!showInlineGrid)}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                              showInlineGrid ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                            }`}
                            title="Alternar Grelha Guia"
                          >
                            <Grid className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={toggleInlineFacingMode}
                            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                            title="Inverter Câmara (Traseira/Frontal)"
                          >
                            <SwitchCamera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              stopInlineCamera();
                              setIsCameraOpen(true);
                            }}
                            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                            title="Abrir em Ecrã Inteiro"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={stopInlineCamera}
                            className="p-2 rounded-full bg-slate-900/80 hover:bg-rose-600 text-slate-200 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                            title="Cancelar / Fechar Câmara"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom target GPS overlay badge in viewfinder */}
                      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] text-white font-mono flex items-center space-x-1 border border-slate-700">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{capturedCoords.lat.toFixed(4)}, {capturedCoords.lng.toFixed(4)} • {district || 'Distrito'}, {province}</span>
                        </span>
                      </div>
                    </div>

                    {/* Inline Shutter Control Bar */}
                    <div className="flex items-center justify-between gap-3 px-2 pt-1">
                      <button
                        type="button"
                        onClick={stopInlineCamera}
                        className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={captureInlinePhoto}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all cursor-pointer ring-4 ring-emerald-500/20"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capturar Foto do Incidente</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleInlineFacingMode}
                        className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <SwitchCamera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Virar</span>
                      </button>
                    </div>

                    {inlineCameraError && (
                      <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{inlineCameraError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Action Buttons to open camera or upload */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => startInlineCamera()}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl shadow-xs transition-all flex items-center space-x-2.5 text-left group cursor-pointer border border-emerald-500"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 text-white shadow-xs">
                        <Camera className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block leading-tight flex items-center gap-1">
                          <span>Câmara no Formulário</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        </span>
                        <span className="text-[10px] text-emerald-100 block truncate">
                          Visor direto no fluxo
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopInlineCamera();
                        setIsCameraOpen(true);
                      }}
                      className="p-3 bg-[#062B3D] hover:bg-[#093c54] active:scale-98 text-white rounded-xl shadow-xs transition-all flex items-center space-x-2.5 text-left group cursor-pointer border border-[#0a4861]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs border border-emerald-500/30">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block leading-tight">
                          Câmara Ecrã Inteiro
                        </span>
                        <span className="text-[10px] text-slate-300 block truncate">
                          Com temporizador & flash
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => directFileInputRef.current?.click()}
                      className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center space-x-2.5 text-left cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                        <Upload className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block leading-tight">
                          Galeria / Ficheiro
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          Carregar do telemóvel/PC
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Hidden Canvas for inline capturing */}
                <canvas ref={inlineCanvasRef} className="hidden" />

                {/* Hidden File Input for Native Camera or Direct File Selection */}
                <input
                  ref={directFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleDirectFileUpload}
                  className="hidden"
                />

                {/* Current Active Attached Photo Preview Card */}
                {selectedPhoto ? (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 border-2 border-emerald-500/40 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {photoSourceType === 'camera' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Foto Capturada pela Câmara</span>
                          </span>
                        ) : photoSourceType === 'upload' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-300 dark:border-blue-800">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Foto Carregada do Dispositivo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 text-[10px] font-bold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Amostra de Referência</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Evidência validada pronta para envio
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setIsPreviewZoomOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Ver Ampliada</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => startInlineCamera()}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Tirar Outra</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhoto('');
                            setPhotoSourceType('camera');
                            setCapturedTimestamp(null);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remover fotografia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Photo Visual Preview Container */}
                    <div
                      onClick={() => setIsPreviewZoomOpen(true)}
                      className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 bg-slate-950 flex items-center justify-center cursor-pointer group"
                    >
                      <img
                        src={selectedPhoto}
                        alt="Evidência do Problema Ambiental"
                        className="w-full h-52 object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1.5 border border-slate-700">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{capturedCoords.lat.toFixed(4)}, {capturedCoords.lng.toFixed(4)}</span>
                          <span>•</span>
                          <span>{district || 'Distrito'}, {province}</span>
                        </div>

                        <span className="bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-xs">
                          <ZoomIn className="w-3 h-3" />
                          <span>Clique para ampliar</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nenhuma fotografia anexada ainda
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
                        Tire uma foto diretamente no formulário ou anexe uma imagem para ilustrar o impacto ambiental.
                      </p>
                    </div>
                  </div>
                )}

                {/* Collapsible Sample Evidence Gallery */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSampleGallery(!showSampleGallery)}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{showSampleGallery ? '▼ Ocultar fotografias de exemplo' : '▶ Ou selecionar da galeria de exemplos de agressões ambientais'}</span>
                  </button>

                  {showSampleGallery && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {[
                        { label: 'Mangais Danificados', url: '/assets/img/eco/mangais.jpg' },
                        { label: 'Foco de Queimada', url: '/assets/img/eco/queimadas.jpg' },
                        { label: 'Poluição Hídrica', url: '/assets/img/eco/poluicao_rios.jpg' }
                      ].map((photo, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(photo.url);
                            setPhotoSourceType('sample');
                            const now = new Date();
                            setCapturedTimestamp(
                              now.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })
                            );
                          }}
                          className={`relative rounded-lg overflow-hidden border-2 text-left h-20 transition-all cursor-pointer ${
                            selectedPhoto === photo.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={photo.url} alt={photo.label} className="object-cover w-full h-full" />
                          <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded truncate">
                            {photo.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Anonymity toggle & Reporter identity */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Reportar como Denúncia Anónima</span>
                </label>
                {!isAnonymous && (
                  <span className="text-slate-500 dark:text-slate-400">
                    Identificado como: <strong>{reporterName}</strong>
                  </span>
                )}
              </div>

              {formValidationError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center justify-between">
                  <span>{formValidationError}</span>
                  <button
                    type="button"
                    onClick={() => setFormValidationError(null)}
                    className="font-bold text-xs ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Action Buttons: Preview Before Submission & Direct Submit */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !district.trim() || !description.trim()) {
                      setFormValidationError('Por favor, preencha o título, distrito e descrição antes de pré-visualizar.');
                      return;
                    }
                    setFormValidationError(null);
                    setIsPreviewBeforeSubmitOpen(true);
                  }}
                  className="w-full sm:w-1/2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Rever com Foto Antes de Enviar</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submeter Ocorrência</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Tracker & Educational Advice Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Protocol Tracker Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rastrear Estado de Ocorrência</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Consulte a intervenção técnica e medidas tomadas pelo código de protocolo.
            </p>
            <form onSubmit={handleTrackProtocol} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Ex: ECO-2026-MZ-001"
                value={searchProtocolInput}
                onChange={(e) => setSearchProtocolInput(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                Buscar
              </button>
            </form>

            {trackedOccurrence ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-700">{trackedOccurrence.protocol}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {trackedOccurrence.status}
                  </span>
                </div>
                <p className="font-semibold text-slate-800">{trackedOccurrence.title}</p>
                <p className="text-[11px] text-slate-600">{trackedOccurrence.locationDetails}, {trackedOccurrence.province}</p>
                {trackedOccurrence.assignedTeam && (
                  <p className="text-[10px] text-slate-500">
                    Equipa técnica: <strong>{trackedOccurrence.assignedTeam}</strong>
                  </p>
                )}
                {trackedOccurrence.actionSummary && (
                  <div className="p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-700">
                    <strong>Ação executada:</strong> {trackedOccurrence.actionSummary}
                  </div>
                )}
              </div>
            ) : searchProtocolInput && (
              <p className="text-[11px] text-rose-500 italic">
                Nenhum registo encontrado com este protocolo.
              </p>
            )}
          </div>

          {/* Citizen Legal Rights and Guarantees in Mozambique */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantia Legal do Cidadão</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              O direito a um ambiente ecologicamente equilibrado é garantido pelo <strong>Artigo 90 da Constituição da República de Moçambique</strong> e pela <strong>Lei n.º 20/97 (Lei do Ambiente)</strong>.
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Proteção contra represálias em denúncias ambientais.</li>
              <li>Obrigação de resposta em até 15 dias pelas Direcções Provinciais do Ambiente.</li>
              <li>Direito de recurso ao Ministério Público para reparação de danos coletivos.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real-time Camera Access Modal for Environmental Issues */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCapturedFromCamera}
        currentCoordinates={capturedCoords}
        locationName={`${district || 'Distrito'}, ${province}`}
      />

      {/* 1. Full-Resolution Photo Zoom / Lightbox Preview Modal */}
      {isPreviewZoomOpen && selectedPhoto && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm">Pré-visualização da Evidência Fotográfica</h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {photoSourceType === 'camera' ? 'Câmara ao Vivo' : 'Carregamento de Ficheiro'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewZoomOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Canvas / Image */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[320px]">
              <img
                src={selectedPhoto}
                alt="Foto Ampliada do Incidente"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer with Metadata & Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-white font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Georreferenciação: {capturedCoords.lat.toFixed(5)}, {capturedCoords.lng.toFixed(5)} ({district || 'Distrito'}, {province})</span>
                </div>
                {capturedTimestamp && (
                  <p className="text-[11px] text-slate-400">
                    Capturado em: {capturedTimestamp}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewZoomOpen(false);
                    startInlineCamera();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tirar Outra</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewZoomOpen(false)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar Fotografia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pre-Submission Incident Review Modal */}
      {isPreviewBeforeSubmitOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Revisão Antes da Submissão
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Confirme os dados e a fotografia anexada antes do envio oficial.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewBeforeSubmitOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Photo Preview in Review */}
              {selectedPhoto ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 relative">
                  <img
                    src={selectedPhoto}
                    alt="Evidência do Incidente"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] flex items-center gap-1 shadow-md">
                      <Camera className="w-3 h-3" />
                      <span>Evidência Anexada</span>
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{capturedCoords.lat.toFixed(4)}, {capturedCoords.lng.toFixed(4)} • {district}, {province}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Sem Fotografia Anexada</strong>
                    <span className="text-[11px]">Recomendamos tirar uma foto com a câmara para facilitar a validação rápida pelas autoridades.</span>
                  </div>
                </div>
              )}

              {/* Incident Details Summary */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Ocorrência</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{title}</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Categoria</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-xs">{category}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gravidade</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                      severity === 'Crítico' ? 'bg-rose-100 text-rose-800' :
                      severity === 'Alto' ? 'bg-orange-100 text-orange-800' :
                      severity === 'Médio' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Local</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-xs">{district}, {province}</strong>
                  </div>
                </div>

                {locationDetails && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Ponto de Referência</span>
                    <span className="text-slate-700 dark:text-slate-300">{locationDetails}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Descrição</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs mt-0.5">{description}</p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center space-x-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Georreferenciação confirmada com precisão no território de Moçambique</span>
                </div>
                <div className="flex items-center space-x-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Submissão em conformidade com o Artigo 90 da CRM e Lei n.º 20/97</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsPreviewBeforeSubmitOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar e Editar
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setIsPreviewBeforeSubmitOpen(false);
                  handleSubmit(e as any);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar e Enviar Ocorrência</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

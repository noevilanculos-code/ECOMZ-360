import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  Grid,
  Zap,
  ZapOff,
  AlertTriangle,
  Upload,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoDataUrl: string) => void;
  currentCoordinates?: { lat: number; lng: number };
  locationName?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  currentCoordinates,
  locationName
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShutterEffect, setIsShutterEffect] = useState<boolean>(false);
  const [applyWatermark, setApplyWatermark] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
  }, [stream]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('O seu navegador não suporta acesso direto à câmara através de WebRTC.');
      return;
    }

    try {
      // Constraints prioritizing environmental back camera
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 }
            }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }

      // Check for torch capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        setHasTorch(Boolean(capabilities?.torch));
      }

      // Enumerate devices to see if multiple cameras exist
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (err: any) {
      console.warn('Erro ao acessar câmara:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Permissão de acesso à câmara foi negada pelo utilizador ou navegador. Por favor, autorize o acesso à câmara nas configurações do seu navegador ou carregue uma fotografia do seu ficheiro.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Nenhum dispositivo de câmara foi detectado no seu aparelho.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError(
          'A câmara já está a ser utilizada por outra aplicação ou separador do navegador.'
        );
      } else {
        setCameraError(
          `Não foi possível inicializar a câmara (${err.message || 'Erro de hardware'}). Você pode carregar uma foto ou selecionar uma imagem de evidência.`
        );
      }
    }
  }, [facingMode, selectedCameraId, stopStream]);

  // Effect to manage stream lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, selectedCameraId]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch } as any]
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch not supported or failed:', err);
      }
    }
  };

  // Flip Camera between back and front
  const toggleCameraFacing = () => {
    setSelectedCameraId('');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Trigger Capture with optional countdown
  const handleShutterClick = () => {
    if (countdown !== null) return;
    performPhotoCapture();
  };

  const handleCountdownCapture = () => {
    if (countdown !== null) return;
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        performPhotoCapture();
      }
    }, 1000);
  };

  // Draw frame to canvas and capture
  const performPhotoCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Visual shutter animation
    setIsShutterEffect(true);
    setTimeout(() => setIsShutterEffect(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror it horizontally for natural preview
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    // Environmental Forensic Watermark
    if (applyWatermark) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('pt-MZ', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const coordsStr = currentCoordinates
        ? `LAT: ${currentCoordinates.lat.toFixed(4)}° | LNG: ${currentCoordinates.lng.toFixed(4)}°`
        : 'GPS: GEORREFERENCIADO';
      const locStr = locationName ? `LOCAL: ${locationName.toUpperCase()}` : 'MOÇAMBIQUE • ECO-MZ 360';

      // Semi-transparent footer banner
      const bannerHeight = Math.max(height * 0.1, 64);
      ctx.fillStyle = 'rgba(7, 26, 36, 0.78)';
      ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

      // Top green accent line
      ctx.fillStyle = '#00A651';
      ctx.fillRect(0, height - bannerHeight, width, 4);

      // Left text: Institution & Incident Verification
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(width * 0.022, 14)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('ECO-MZ 360 • EVIDÊNCIA DE CAMPO', 20, height - bannerHeight + 24);

      ctx.fillStyle = '#A7F3D0'; // emerald-200
      ctx.font = `${Math.max(width * 0.016, 11)}px monospace`;
      ctx.fillText(`${locStr} • ${coordsStr}`, 20, height - bannerHeight + 46);

      // Right text: Timestamp
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `bold ${Math.max(width * 0.017, 12)}px monospace`;
      const timeLabel = `${dateStr} • ${timeStr}`;
      const textWidth = ctx.measureText(timeLabel).width;
      ctx.fillText(timeLabel, width - textWidth - 20, height - bannerHeight + 35);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm photo and pass back to parent
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  // Native File upload fallback handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          stopStream();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample quick select options
  const sampleEvidences = [
    {
      title: 'Destruição de Mangais',
      url: '/assets/img/eco/mangais.jpg'
    },
    {
      title: 'Foco de Queimada',
      url: '/assets/img/eco/queimadas.jpg'
    },
    {
      title: 'Poluição Hídrica',
      url: '/assets/img/eco/poluicao_rios.jpg'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-white z-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {capturedImage ? 'Pré-visualização da Evidência' : 'Câmara em Tempo Real'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {capturedImage
                  ? 'Verifique a nitidez da foto antes de anexar à denúncia'
                  : 'Aponte a câmara para o problema ambiental e capture a fotografia'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {!capturedImage && (
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  showGrid ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Grelha de Enquadramento"
              >
                <Grid className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar câmara"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* Shutter flash animation overlay */}
          {isShutterEffect && (
            <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Countdown indicator */}
          {countdown !== null && (
            <div className="absolute z-30 flex items-center justify-center inset-0 bg-black/40 pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-emerald-600 text-white font-black text-5xl flex items-center justify-center shadow-2xl animate-ping duration-1000">
                {countdown}
              </div>
            </div>
          )}

          {/* MODE A: Captured Image Review */}
          {capturedImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Evidência Capturada"
                className="max-h-[60vh] sm:max-h-[65vh] w-auto max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/50 text-white flex items-center space-x-2 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">Foto Gravada com Sucesso</span>
              </div>
            </div>
          ) : cameraError ? (
            /* MODE B: Camera Error or Blocked State */
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Acesso à Câmara Não Disponível</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              </div>

              {/* Alternative Fallback Options */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tirar Foto pelo Sistema / Carregar Ficheiro</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tentar Novamente Conectar à Câmara</span>
                </button>

                {/* Pre-made photo selector for quick testing */}
                <div className="pt-3 border-t border-slate-800 text-left">
                  <p className="text-[11px] font-bold text-slate-400 mb-2">
                    Ou selecione uma foto de exemplo de agressão ambiental:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleEvidences.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCapturedImage(sample.url);
                          stopStream();
                        }}
                        className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-all text-left h-16 cursor-pointer"
                      >
                        <img
                          src={sample.url}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white p-1 truncate block font-medium">
                          {sample.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MODE C: Live Video Stream Feed */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[60vh] sm:max-h-[65vh] ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Rule of Thirds Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 border border-white/10">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
                </div>
              )}

              {/* Center Target Focus Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-16 h-16 border-2 border-emerald-400/60 rounded-xl relative flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  <span className="absolute -top-6 text-[10px] text-emerald-300 font-mono tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
                    ENQUADRE O DANO
                  </span>
                </div>
              </div>

              {/* Top Live Status Indicators */}
              <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-white border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[11px]">AO VIVO</span>
                </div>

                {currentCoordinates && (
                  <div className="hidden sm:flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-slate-300 border border-white/10 font-mono">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>
                      {currentCoordinates.lat.toFixed(3)}, {currentCoordinates.lng.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Camera Settings Overlay Bar */}
              <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-colors cursor-pointer ${
                      isTorchOn
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                        : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                    }`}
                    title={isTorchOn ? 'Desligar Lanterna' : 'Ligar Lanterna'}
                  >
                    {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                  title="Trocar de câmara (Traseira / Frontal)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for High-Resolution Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Input for Native Camera or File Upload Fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Bottom Control Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 text-white z-20">
          {capturedImage ? (
            /* Review Controls */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs font-bold text-white block">Foto Pronta para Submissão</span>
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Selo oficial e georreferenciação aplicados</span>
                </span>
              </div>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir Foto</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-700/30 cursor-pointer hover:scale-102"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar Esta Foto na Ocorrência</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Shutter & Options */
            <div className="flex items-center justify-between">
              {/* Left secondary button: Upload or Samples */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center space-x-1.5 cursor-pointer"
                  title="Carregar foto da galeria do telemóvel ou computador"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-xs font-semibold">Galeria / Ficheiro</span>
                </button>

                {/* Watermark toggle */}
                <button
                  type="button"
                  onClick={() => setApplyWatermark(!applyWatermark)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer hidden md:flex items-center space-x-1 ${
                    applyWatermark
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Estampar carimbo forense com data, hora e GPS"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Carimbo Forense</span>
                </button>
              </div>

              {/* Center Main Shutter Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleShutterClick}
                  disabled={Boolean(cameraError)}
                  className="group relative p-1.5 rounded-full border-4 border-emerald-500/40 hover:border-emerald-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  title="Disparar Fotografia (Capturar)"
                  aria-label="Tirar fotografia"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white group-hover:bg-emerald-400 flex items-center justify-center transition-colors shadow-xl">
                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950" />
                  </div>
                </button>
              </div>

              {/* Right secondary button: Timer countdown */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCountdownCapture}
                  disabled={Boolean(cameraError) || countdown !== null}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-40"
                  title="Temporizador de 3 segundos"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-[11px]">3s</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

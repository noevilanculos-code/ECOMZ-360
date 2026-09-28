import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Camera,
  MapPin,
  Send,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  Battery,
  Signal
} from 'lucide-react';
import { Occurrence, MozambiqueProvince } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface EcoMobileSimulatorProps {
  onAddOccurrence?: (newOcc: Occurrence) => void;
}

export const EcoMobileSimulator: React.FC<EcoMobileSimulatorProps> = ({ onAddOccurrence }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; title: string; category: string; time: string }>>([
    { id: 'off-1', title: 'Corte de mangal na Praia Nova', category: 'Destruição de Mangais', time: 'Há 12 min' }
  ]);
  const [mobileTitle, setMobileTitle] = useState('');
  const [mobileCategory, setMobileCategory] = useState('Destruição de Mangais');
  const [mobileProvince, setMobileProvince] = useState<MozambiqueProvince>('Sofala');
  const [mobileDistrict, setMobileDistrict] = useState('Beira');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [mobilePhoto, setMobilePhoto] = useState<string>(
    '/assets/img/imagens/ChatGPT Image 18 de set. de 2026, 17_07_09.png'
  );

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileTitle.trim()) return;

    const newItem = {
      id: `off-${Date.now()}`,
      title: mobileTitle.trim(),
      category: mobileCategory,
      time: 'Agora mesmo'
    };

    if (!isOnline) {
      setOfflineQueue([newItem, ...offlineQueue]);
      setMobileTitle('');
    } else {
      // Direct submission
      if (onAddOccurrence) {
        onAddOccurrence({
          id: `occ-${Date.now()}`,
          protocol: `ECO-2026-MZ-${Math.floor(100 + Math.random() * 900)}`,
          title: mobileTitle.trim(),
          category: mobileCategory as any,
          severity: 'Médio',
          province: mobileProvince,
          district: mobileDistrict,
          locationDetails: 'Reportado via ECO-MOBILE Terreno',
          coordinates: { lat: -19.82, lng: 34.85 },
          reportedBy: 'Agente Comunitário Móvel',
          isAnonymous: false,
          timestamp: new Date().toISOString().substring(0, 10),
          status: 'Recebido',
          description: 'Registo capturado em campo pelo aplicativo ECO-MOBILE.',
          imageUrl: mobilePhoto,
          validationScore: 80
        });
      }
      setMobileTitle('');
    }
  };

  const handleManualSync = () => {
    if (offlineQueue.length === 0 || !isOnline) return;
    setSyncing(true);
    setTimeout(() => {
      offlineQueue.forEach((item) => {
        if (onAddOccurrence) {
          onAddOccurrence({
            id: `occ-${Date.now()}-${item.id}`,
            protocol: `ECO-2026-MZ-${Math.floor(100 + Math.random() * 900)}`,
            title: item.title,
            category: item.category as any,
            severity: 'Médio',
            province: mobileProvince,
            district: mobileDistrict,
            locationDetails: 'Sincronizado da fila offline ECO-MOBILE',
            coordinates: { lat: -19.82, lng: 34.85 },
            reportedBy: 'Guardião Comunitário (Offline Sync)',
            isAnonymous: false,
            timestamp: new Date().toISOString().substring(0, 10),
            status: 'Recebido',
            description: 'Item gravado localmente no dispositivo durante corte de rede e sincronizado com o ECO-DATA.',
            validationScore: 85
          });
        }
      });
      setOfflineQueue([]);
      setSyncing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>ECO-MOBILE • Aplicação Móvel & Modo Offline</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Participação Cidadã em Zonas Rurais e Baixa Conectividade
          </h2>
          <p className="text-xs text-slate-500">
            Conforme a Secção 2.7 do Documento de Extensão Funcional v1.1: operação offline garantida, GPS no terreno e sincronização automática.
          </p>
        </div>

        {/* Global Network Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setIsOnline(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              isOnline
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Rede Online (4G/WiFi)</span>
          </button>
          <button
            onClick={() => setIsOnline(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              !isOnline
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Modo Offline (Sem Rede)</span>
          </button>
        </div>
      </div>

      {/* Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Phone Bezel Simulator (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] sm:w-[350px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 relative">
            {/* Camera notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
            </div>

            {/* Inner Screen */}
            <div className="w-full bg-slate-50 rounded-[36px] overflow-hidden flex flex-col h-[650px] text-slate-800 relative">
              {/* Phone Status Bar */}
              <div className="bg-emerald-800 text-white px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold">
                <span>09:41</span>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <div className="flex items-center space-x-1 text-emerald-300">
                      <Signal className="w-3 h-3" />
                      <Wifi className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-amber-300 font-bold">
                      <WifiOff className="w-3 h-3" />
                      <span>OFFLINE</span>
                    </div>
                  )}
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* App Bar inside phone */}
              <div className="bg-emerald-700 text-white p-3 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                    MZ
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-none">ECO-MOBILE</h3>
                    <span className="text-[9px] text-emerald-200">Moçambique Guardião</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-amber-400'}`}
                  ></span>
                  <span className="text-[10px] font-bold">
                    {isOnline ? 'Conectado' : 'Local (Cache)'}
                  </span>
                </div>
              </div>

              {/* Push Alert Toast Simulator */}
              {showNotification && (
                <div className="m-3 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2 animate-in fade-in">
                  <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold leading-tight">Alerta Meteorológico INGD:</p>
                    <p className="text-[10px] text-amber-800">Previsão de maré alta e ventos de 65km/h no Canal de Moçambique.</p>
                  </div>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-amber-700 font-bold hover:text-amber-900 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Scrollable Mobile Body */}
              <div className="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
                {/* Status card */}
                <div className={`p-3 rounded-xl border ${isOnline ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">
                      {isOnline ? 'Sincronização Automática Ativa' : 'Trabalho em Campo Desconectado'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200">
                      {offlineQueue.length} na fila
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {isOnline
                      ? 'Todas as ocorrências são enviadas diretamente ao servidor ECO-DATA.'
                      : 'Os dados e fotos são gravados no armazenamento local e enviados assim que houver sinal.'}
                  </p>
                </div>

                {/* Mobile Quick Report Form */}
                <form onSubmit={handleMobileSubmit} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    + Reportar Agressão Ambiental
                  </span>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Título / Ocorrência</label>
                    <input
                      type="text"
                      placeholder="Ex: Queimada próxima à machamba"
                      value={mobileTitle}
                      onChange={(e) => setMobileTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Categoria</label>
                      <select
                        value={mobileCategory}
                        onChange={(e) => setMobileCategory(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px]"
                      >
                        <option>Destruição de Mangais</option>
                        <option>Desmatamento</option>
                        <option>Queimadas</option>
                        <option>Poluição Hídrica</option>
                        <option>Resíduos</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Distrito</label>
                      <input
                        type="text"
                        value={mobileDistrict}
                        onChange={(e) => setMobileDistrict(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Photo & GPS indicator with live camera trigger */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="w-full p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center justify-between text-[10px] text-emerald-900 font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold">
                          {mobilePhoto ? 'Tirar Outra Foto com a Câmara' : 'Ativar Câmara para Tirar Foto'}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px]">
                        ABRIR CÂMARA
                      </span>
                    </button>

                    {mobilePhoto && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-900">
                        <img src={mobilePhoto} alt="Evidência Móvel" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                          GPS: -19.82°, 34.85° • {mobileProvince}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isOnline ? 'Submeter Imediatamente' : 'Guardar na Fila Offline'}</span>
                  </button>
                </form>

                {/* Queue in phone */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Fila de Espera no Aparelho:</span>
                    <span className="text-[10px] text-slate-500">{offlineQueue.length} itens</span>
                  </div>

                  {offlineQueue.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-[10px]">
                      Nenhuma ocorrência pendente de envio.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {offlineQueue.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px]"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block truncate max-w-[170px]">{item.title}</span>
                            <span className="text-slate-500">{item.category} • {item.time}</span>
                          </div>
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Phone Bar */}
              <div className="bg-white border-t border-slate-200 p-2 flex justify-around text-[10px] font-bold text-slate-600">
                <span className="text-emerald-700">Ocorrências</span>
                <span>Alertas</span>
                <span>Projetos</span>
                <span>Perfil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Technical Explanation & Sync Console (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Sync Status & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Consola de Sincronização Bidirecional
                </h3>
                <p className="text-xs text-slate-500">
                  Gestão dos pacotes de dados offline armazenados na memória local do navegador (IndexedDB)
                </p>
              </div>

              <button
                onClick={handleManualSync}
                disabled={offlineQueue.length === 0 || !isOnline || syncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'A sincronizar...' : 'Sincronizar Agora'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Estado de Conexão</span>
                <p className={`text-xs font-black mt-0.5 flex items-center gap-1 ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  <span>{isOnline ? 'Online (Conectado)' : 'Offline (Local)'}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Itens em Espera</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">
                  {offlineQueue.length} ocorrências pendentes
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Compressão de Fotos</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">
                  WebP Otimizado (&lt;120KB)
                </p>
              </div>
            </div>
          </div>

          {/* Card: Architectural Specifications from Documento v1.1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade com a Secção 2.7 do Documento de Extensão</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Armazenamento Local Criptografado:</strong> As ocorrências, fotos comprimidas e coordenadas capturadas no mato são mantidas com integridade até a reconexão.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Notificações Push Georreferenciadas:</strong> Comunidades locais recebem avisos imediatos de ciclones, cheias ou riscos de queimadas sem precisar abrir o app.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Compatibilidade com USSD / SMS:</strong> Para cidadãos sem smartphone, a plataforma aceita reportes simplificados via canal SMS do INGD.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal in Mobile Simulator */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={(photo) => {
          setMobilePhoto(photo);
          setHasPhoto(true);
        }}
        currentCoordinates={{ lat: -19.82, lng: 34.85 }}
        locationName={`${mobileDistrict}, ${mobileProvince}`}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  ShieldAlert,
  X,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MozambiqueProvince, SeverityLevel } from '../types';

export interface CriticalPushNotification {
  id: string;
  title: string;
  category: 'Ciclone Tropical' | 'Cheia / Inundação' | 'Seca Severa' | 'Queimada Descontrolada' | 'Desmatamento Crítico';
  severity: 'Crítico';
  provinces: MozambiqueProvince[];
  district?: string;
  message: string;
  issuedAt: string;
  source: string;
  actionUrl?: string;
  isRead: boolean;
  priorityLevel: 'EMERGÊNCIA NACIONAL' | 'ALERTA VERMELHO' | 'RISCO IMINENTE';
}

const CRITICAL_NOTIFICATIONS_STORAGE_KEY = 'ecomz_critical_notifications';
const PUSH_PERMISSION_STORAGE_KEY = 'ecomz_push_permission';

// Initial critical notifications (Ciclones, Cheias, Secas, Queimadas severas)
export const INITIAL_CRITICAL_NOTIFICATIONS: CriticalPushNotification[] = [
  {
    id: 'push-crit-001',
    title: 'Ciclone Tropical de Categoria 3 em Aproximação',
    category: 'Ciclone Tropical',
    severity: 'Crítico',
    provinces: ['Sofala', 'Zambézia', 'Inhambane'],
    district: 'Canal de Moçambique & Beira',
    message: 'Rajadas superiores a 160 km/h e marés de tempestade. Alerta de evacuação imediata em áreas litorais baixas dos rios Púnguè e Búzi emitido pelo INGD/INAM.',
    issuedAt: 'Há 12 minutos',
    source: 'INGD / INAM / Observatório ECO-MZ',
    actionUrl: '/alertas',
    isRead: false,
    priorityLevel: 'EMERGÊNCIA NACIONAL'
  },
  {
    id: 'push-crit-002',
    title: 'Risco Máximo de Cheia e Transbordo da Bacia do Zambeze',
    category: 'Cheia / Inundação',
    severity: 'Crítico',
    provinces: ['Zambézia', 'Tete', 'Sofala'],
    district: 'Caia, Marromeu & Chinde',
    message: 'Nível hidrométrico acima da cota de alerta em 1.8 metros após abertura controlada de descarregadores de montante. Populações ribeirinhas devem buscar cotas altas.',
    issuedAt: 'Há 45 minutos',
    source: 'ARA-Centro / Direcção Nacional de Recursos Hídricos',
    actionUrl: '/alertas',
    isRead: false,
    priorityLevel: 'ALERTA VERMELHO'
  },
  {
    id: 'push-crit-003',
    title: 'Seca Hidrológica Severa & Esgotamento de Furos Comunitários',
    category: 'Seca Severa',
    severity: 'Crítico',
    provinces: ['Gaza', 'Inhambane', 'Tete'],
    district: 'Chigubo, Chicualacuala e Funhalouro',
    message: 'Fase 4 de escassez hídrica extrema. Ativação de brigadas de emergência de abastecimento com camiões-cisterna e apoio a furos solares profundos.',
    issuedAt: 'Há 2 horas',
    source: 'Comité de Resiliência à Seca / PMA Moçambique',
    actionUrl: '/recursos-comunitarios',
    isRead: false,
    priorityLevel: 'RISCO IMINENTE'
  },
  {
    id: 'push-crit-004',
    title: 'Foco de Queimada de Alta Intensidade Próximo a Parque Nacional',
    category: 'Queimada Descontrolada',
    severity: 'Crítico',
    provinces: ['Niassa', 'Cabo Delgado'],
    district: 'Mecula (Reserva do Niassa)',
    message: 'Frente de fogo de 6 km alimentada por ventos de 50 km/h com risco de transpor o corredor biológico. Fiscais da ANAC e voluntários comunitários mobilizados.',
    issuedAt: 'Há 3 horas',
    source: 'AQUA Fiscalização / ANAC Moçambique',
    actionUrl: '/ocorrencias',
    isRead: true,
    priorityLevel: 'ALERTA VERMELHO'
  }
];

export const PushNotificationManager: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole } = useApp();

  const [notifications, setNotifications] = useState<CriticalPushNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CRITICAL_NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_CRITICAL_NOTIFICATIONS;
  });

  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PUSH_PERMISSION_STORAGE_KEY) === 'granted';
    }
    return false;
  });

  const [activeToast, setActiveToast] = useState<CriticalPushNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(CRITICAL_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Request browser Web Push notification permission
  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          localStorage.setItem(PUSH_PERMISSION_STORAGE_KEY, 'granted');
          // Send welcome test notification
          dispatchBrowserNotification(
            'ECO-MZ 360 • Alertas Críticos Ativados',
            'Receberá alertas em tempo real sobre ciclones, cheias, secas e queimadas severas.'
          );
        } else {
          setPushEnabled(false);
          localStorage.setItem(PUSH_PERMISSION_STORAGE_KEY, 'denied');
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    } else {
      // Fallback in-app
      setPushEnabled(true);
      localStorage.setItem(PUSH_PERMISSION_STORAGE_KEY, 'granted');
    }
  };

  const dispatchBrowserNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png',
          badge: '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png',
          tag: 'eco-mz-critical-alert'
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  };

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      // Audio synth beep for critical alert
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioContext may be restricted by user gesture
    }
  };

  // Trigger a new real-time critical occurrence
  const triggerNewCriticalPush = (
    title: string,
    category: CriticalPushNotification['category'],
    provinces: MozambiqueProvince[],
    district: string,
    message: string
  ) => {
    const newAlert: CriticalPushNotification = {
      id: `push-crit-${Date.now()}`,
      title,
      category,
      severity: 'Crítico',
      provinces,
      district,
      message,
      issuedAt: 'Agora mesmo',
      source: 'AQUA Fiscalização / INGD Alerta Rápido',
      actionUrl: '/alertas',
      isRead: false,
      priorityLevel: 'EMERGÊNCIA NACIONAL'
    };

    setNotifications((prev) => [newAlert, ...prev]);
    setActiveToast(newAlert);
    playAlertSound();
    dispatchBrowserNotification(`⚠️ ALERTA CRÍTICO: ${title}`, message);

    // Auto-dismiss toast after 9 seconds
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newAlert.id ? null : current));
    }, 9000);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  return (
    <>
      {/* 1. FLOATING TOAST PUSH NOTIFICATION (Real-Time Banner when an alert triggers) */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-rose-500 p-4 relative overflow-hidden backdrop-blur-md">
            {/* Top red alert glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-bounce">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      {activeToast.priorityLevel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeToast.issuedAt}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
                    {activeToast.title}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissToast}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Fechar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              {activeToast.message}
            </p>

            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold text-slate-300">
                  {activeToast.provinces.join(', ')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    dismissToast();
                    navigate(activeToast.actionUrl || '/alertas');
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver Procedimento</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME PUSH NOTIFICATIONS BAR / MODAL TRIGGER (Fixed bottom-left or inspectable) */}
      <div className="fixed bottom-20 lg:bottom-6 left-5 z-40 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsSimulatorOpen(true)}
          className="p-3 bg-slate-900/90 hover:bg-slate-900 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer backdrop-blur-md group"
          title="Gestor de Notificações Push Críticas em Tempo Real"
        >
          <div className="relative">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            )}
          </div>
          <span className="hidden sm:inline">Push Críticos</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. SIMULATOR & PUSH CONFIGURATION DRAWER/MODAL */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Sistema de Notificações Push • Ocorrências Críticas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alertas imediatos para cidadãos e inspectores (AQUA/INGD) sobre ciclones, cheias e secas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Push Status and Browser Permissions Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                  <span>Permissões Web Push no Navegador:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                      pushEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {pushEnabled ? 'Ativo / Autorizado' : 'Pendente / Não Solicitado'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Receba alertas no desktop e celular mesmo quando a aplicação estiver minimizada.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    soundEnabled
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  }`}
                  title={soundEnabled ? 'Som de sirene ativado' : 'Mudo'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {!pushEnabled ? (
                  <button
                    type="button"
                    onClick={requestPushPermission}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Ativar Push do Navegador</span>
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Push Habilitado</span>
                  </span>
                )}
              </div>
            </div>

            {/* Test Simulation Buttons (Ciclone, Cheia, Seca) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Disparar Alerta Crítico em Tempo Real (Simulação de Fiscalização / INGD):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Clique Teste</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerNewCriticalPush(
                      'Alerta de Ciclone Tropical • Categoria 4',
                      'Ciclone Tropical',
                      ['Sofala', 'Zambézia'],
                      'Beira e Dondo',
                      'Alerta Máximo: rajadas de 185 km/h projetadas nas próximas 12 horas. Abrigos de emergência ativados.'
                    )
                  }
                  className="p-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs font-bold text-left hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex flex-col justify-between cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Ciclone Tropical</span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                    Simular alerta de ciclone e ventos extremos
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerNewCriticalPush(
                      'Risco de Inundação e Cheia no Baixo Limpopo',
                      'Cheia / Inundação',
                      ['Gaza'],
                      'Chókwè e Xai-Xai',
                      'Descargas a montante elevaram o rio além da cota crítica. Retirar rebanhos e bens de áreas ribeirinhas.'
                    )
                  }
                  className="p-3 rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 text-xs font-bold text-left hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all flex flex-col justify-between cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className="flex items-center space-x-1.5 text-sky-600 dark:text-sky-400 mb-1">
                    <Droplets className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Cheia / Inundação</span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                    Simular alarme de cheias e transbordos fluviais
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerNewCriticalPush(
                      'Emergência por Seca Severa & Colapso Hídrico',
                      'Seca Severa',
                      ['Tete', 'Inhambane'],
                      'Changara e Mabote',
                      'Défice hídrico prolongado atingindo 95% do gado. Mobilização de brigadas de assistência alimentar.'
                    )
                  }
                  className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold text-left hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all flex flex-col justify-between cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Seca Severa</span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                    Simular emergência climática de estiagem
                  </span>
                </button>
              </div>
            </div>

            {/* List of Critical Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Histórico de Notificações Críticas ({notifications.length})</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                      !item.isRead
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                          {item.category}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {item.issuedAt}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{item.provinces.join(', ')}</span>
                      </div>
                      <span className="font-mono text-slate-400">{item.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsSimulatorOpen(false);
                  navigate('/alertas');
                }}
                className="px-4 py-2 rounded-xl bg-[#062B3D] hover:bg-[#083a52] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Ver Todos os Alertas Oficiais</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

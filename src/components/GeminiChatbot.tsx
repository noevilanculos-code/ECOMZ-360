import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Search,
  MapPin,
  ExternalLink,
  Shield,
  TreePine,
  Microscope,
  Users,
  Brain,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Navigation,
  ChevronDown,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';

export type ChatRole = 'fiscal' | 'gestor' | 'cientista' | 'comunitario';
export type ChatModel = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
export type GroundingMode = 'none' | 'search' | 'maps';

interface GroundingSource {
  type: 'web' | 'maps';
  title: string;
  uri: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  roleUsed?: ChatRole;
  modelUsed?: string;
  groundingUsed?: GroundingMode;
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
  isFallback?: boolean;
}

const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Sofala (Beira)': { lat: -19.8436, lng: 34.8389 },
  'Maputo Cidade': { lat: -25.9692, lng: 32.5732 },
  'Maputo Província': { lat: -25.6667, lng: 32.3333 },
  'Gaza (Xai-Xai)': { lat: -25.0444, lng: 33.6444 },
  'Inhambane': { lat: -23.8650, lng: 35.3833 },
  'Manica (Chimoio)': { lat: -18.9333, lng: 32.8833 },
  'Tete': { lat: -16.1564, lng: 33.5863 },
  'Zambézia (Quelimane)': { lat: -17.8786, lng: 36.8883 },
  'Nampula': { lat: -15.1165, lng: 39.2666 },
  'Niassa (Lichinga)': { lat: -13.3125, lng: 35.2406 },
  'Cabo Delgado (Pemba)': { lat: -12.9732, lng: 40.5178 }
};

const roleDetails: Record<
  ChatRole,
  { label: string; short: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  fiscal: {
    label: 'Fiscal Ambiental',
    short: 'Fiscal',
    icon: Shield,
    desc: 'Lei n.º 20/97, infrações da AQUA e fiscalização'
  },
  gestor: {
    label: 'Gestor de Conservação',
    short: 'Gestor',
    icon: TreePine,
    desc: 'Restauração de mangais e projetos de sustentabilidade'
  },
  cientista: {
    label: 'Cientista Climático',
    short: 'Cientista',
    icon: Microscope,
    desc: 'Análise de ciclones, dados costeiros e clima'
  },
  comunitario: {
    label: 'Apoio Comunitário',
    short: 'Comunidade',
    icon: Users,
    desc: 'Prevenção de queimadas e práticas agrícolas locais'
  }
};

const quickSuggestionsByRole: Record<ChatRole, string[]> = {
  fiscal: [
    'Quais as sanções da Lei 20/97 para corte de madeira nativa?',
    'Como registar um auto de notícia ambiental no ECO-MZ?',
    'Quais os limites para exploração em zonas de proteção?'
  ],
  gestor: [
    'Qual o plano para restaurar 50 hectares de mangal na Beira?',
    'Como obter o Selo Verde de Sustentabilidade?',
    'Quais espécies nativas do Miombo têm maior regeneração?'
  ],
  cientista: [
    'Impactos ecológicos dos ciclones no Canal de Moçambique?',
    'Como mitigar a salinização costeira do solo?',
    'Localize no Google Maps as principais reservas marinhas de Moçambique'
  ],
  comunitario: [
    'Como criar aceiros para proteger machambas de queimadas?',
    'Quais as técnicas simples para prevenir fogo descontrolado?',
    'Como acionar o apoio do comité local CGRN?'
  ]
};

interface GeminiChatbotProps {
  embedded?: boolean;
  initialRole?: ChatRole;
  initialPrompt?: string;
  initialGrounding?: GroundingMode;
  onClose?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  embedded = false,
  initialRole = 'fiscal',
  initialPrompt,
  initialGrounding = 'none',
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Olá! Sou o **EcoBot MZ**, o assistente de inteligência ambiental do ECO-MZ 360 alimentado pelo **Google Gemini** com integração de dados ao vivo do **Google Maps**.\n\nComo posso ajudar na sua operação hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleUsed: initialRole,
      modelUsed: 'gemini-3.5-flash',
      groundingUsed: initialGrounding
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>(initialRole);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<GroundingMode>(initialGrounding);
  const [selectedProvince, setSelectedProvince] = useState<string>('Sofala (Beira)');
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Dropdown menus state
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showMapsMenu, setShowMapsMenu] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const mapsMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setShowRoleMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setShowSettingsMenu(false);
      }
      if (mapsMenuRef.current && !mapsMenuRef.current.contains(target)) {
        setShowMapsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não disponível no navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGpsError(null);
        setIsLocating(false);
        setGroundingMode('maps');
        setShowMapsMenu(false);
      },
      (err) => {
        console.warn('GPS indisponível:', err);
        setGpsError('Não foi possível obter a localização GPS. Verifique as permissões do navegador.');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        }));

      const currentCoords =
        deviceLocation ||
        PROVINCE_COORDINATES[selectedProvince] || { lat: -18.665695, lng: 35.529562 };

      let targetModel = selectedModel;
      if (groundingMode === 'maps') {
        targetModel = 'gemini-3.5-flash';
      }

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          message: textToSend.trim(),
          model: targetModel,
          role: selectedRole,
          grounding: groundingMode,
          location: {
            latitude: currentCoords.lat,
            longitude: currentCoords.lng
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Erro ao processar mensagem');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text || 'Sem resposta disponível.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: selectedRole,
        modelUsed: data.modelUsed || targetModel,
        groundingUsed: data.groundingUsed || groundingMode,
        groundingSources: data.groundingSources || [],
        searchQueries: data.searchQueries || [],
        isFallback: Boolean(data.isFallback)
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `Não foi possível obter resposta: ${err.message}. Verifique a sua conexão.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: selectedRole,
        modelUsed: selectedModel,
        groundingUsed: groundingMode,
        isFallback: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Histórico limpo. Como posso ajudar com a legislação ou ambiente de Moçambique?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: selectedRole,
        modelUsed: selectedModel,
        groundingUsed: groundingMode
      }
    ]);
  };

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.trim().replace(/^[•\-*]\s*/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-inherit my-1 leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-inherit leading-relaxed my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-inherit">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const ActiveRoleIcon = roleDetails[selectedRole].icon;
  const isOnlyWelcome = messages.length <= 1;

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 ${embedded ? 'h-full' : 'h-full'}`}>
      {/* SLIM, MINIMAL TOP BAR - Zero Clutter */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex items-center justify-between shrink-0 z-20">
        {/* Left: Bot Identity */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                EcoBot MZ
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Gemini 3.5
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Inteligência Ambiental & Maps
            </span>
          </div>
        </div>

        {/* Right: Clean, Compact Tool Controls */}
        <div className="flex items-center space-x-2">
          {/* Compact Role Selector Pill */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Trocar papel do assistente"
            >
              <ActiveRoleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline font-semibold">{roleDetails[selectedRole].short}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Papel do Assistente
                </div>
                {(Object.keys(roleDetails) as ChatRole[]).map((r) => {
                  const role = roleDetails[r];
                  const Icon = role.icon;
                  const isCurrent = selectedRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start space-x-2 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs leading-none">{role.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{role.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Google Maps Grounding Pill */}
          <div className="relative" ref={mapsMenuRef}>
            <button
              onClick={() => {
                if (groundingMode === 'maps') {
                  setGroundingMode('none');
                } else {
                  setGroundingMode('maps');
                  setSelectedModel('gemini-3.5-flash');
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowMapsMenu(!showMapsMenu);
              }}
              className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                groundingMode === 'maps'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title="Ativar/desativar dados do Google Maps (botão direito para trocar província)"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Maps</span>
              {groundingMode === 'maps' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMapsMenu(!showMapsMenu);
                  }}
                  className="p-0.5 hover:bg-emerald-700 rounded"
                >
                  <ChevronDown className="w-3 h-3 text-emerald-200" />
                </button>
              )}
            </button>

            {/* Mini Region Selector Popover */}
            {showMapsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200">
                    Região do Google Maps
                  </span>
                  <button
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{deviceLocation ? 'GPS OK' : 'Meu GPS'}</span>
                  </button>
                </div>
                {gpsError && (
                  <p className="text-[10px] text-rose-500 dark:text-rose-400 px-1 py-1 font-medium">{gpsError}</p>
                )}

                <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                  {Object.keys(PROVINCE_COORDINATES).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProvince(p);
                        setDeviceLocation(null);
                        setGroundingMode('maps');
                        setShowMapsMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        selectedProvince === p && !deviceLocation
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Model Settings Popover */}
          <div className="relative" ref={settingsMenuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Configurações do modelo Gemini"
            >
              <Brain className="w-3.5 h-3.5" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Motor Gemini
                </div>

                <button
                  onClick={() => {
                    setSelectedModel('gemini-3.5-flash');
                    setShowSettingsMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.5-flash'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs">Gemini 3.5 Flash</div>
                  <div className="text-[10px] text-slate-400 font-normal">Geral & Google Maps Data</div>
                </button>

                <button
                  onClick={() => {
                    setSelectedModel('gemini-3.1-pro-preview');
                    setGroundingMode('none');
                    setShowSettingsMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.1-pro-preview'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs">Gemini 3.1 Pro</div>
                  <div className="text-[10px] text-slate-400 font-normal">Tarefas complexas e profundas</div>
                </button>

                <button
                  onClick={() => {
                    setSelectedModel('gemini-3.1-flash-lite');
                    setGroundingMode('none');
                    setShowSettingsMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.1-flash-lite'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs">Gemini 3.1 Flash Lite</div>
                  <div className="text-[10px] text-slate-400 font-normal">Respostas instantâneas</div>
                </button>
              </div>
            )}
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearHistory}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
            title="Limpar conversa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Button (if rendered in modal) */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES THREAD - Maximum Vertical Room & Clean Readability */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const hasSources = m.groundingSources && m.groundingSources.length > 0;
          const isSourcesOpen = expandedSources[m.id];

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-3xl mx-auto ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Minimal Clean Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs ${
                  isUser
                    ? 'bg-slate-800 dark:bg-slate-700 text-white font-semibold'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Body */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-xs space-y-1.5 shadow-2xs ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-slate-800'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Text Content */}
                <div className="text-[13px] leading-relaxed select-text space-y-1">
                  {renderFormattedText(m.text)}
                </div>

                {/* Grounding Sources - Minimal Accordion Style */}
                {hasSources && (
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => toggleSources(m.id)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>
                        {m.groundingSources!.length} {m.groundingSources!.length === 1 ? 'local verificado no Google Maps' : 'locais verificados no Google Maps'}
                      </span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isSourcesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSourcesOpen && (
                      <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                        {m.groundingSources!.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors text-xs group"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 group-hover:text-emerald-600">
                              {src.title}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold shrink-0 flex items-center gap-1">
                              Maps <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Metadata: Timestamp & Copy */}
                <div className="flex items-center justify-between text-[10px] opacity-60 pt-1">
                  <span>{m.timestamp}</span>
                  <button
                    onClick={() => handleCopy(m.id, m.text)}
                    className="hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                    title="Copiar mensagem"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-3 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs shadow-2xs flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>O EcoBot está a gerar a resposta com Gemini...</span>
            </div>
          </div>
        )}

        {/* Center Suggestions (ONLY shown when conversation is empty/fresh) */}
        {isOnlyWelcome && !loading && (
          <div className="max-w-xl mx-auto pt-6 pb-2 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sugestões rápidas para começar:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestionsByRole[selectedRole].map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSend(sug)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 text-xs font-medium text-left transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{sug}</span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FLOATING SLEEK INPUT BAR - Modern & Unobtrusive */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto relative flex items-center"
        >
          <input
            type="text"
            placeholder={
              groundingMode === 'maps'
                ? `Pergunte sobre locais no Google Maps (${selectedProvince})...`
                : 'Pergunte sobre legislação, crimes ambientais ou mangais...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full text-xs sm:text-sm pl-4 pr-24 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 shadow-2xs transition-all"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            {/* Quick toggle for Maps inside the bar */}
            <button
              type="button"
              onClick={() => {
                setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps');
                if (groundingMode !== 'maps') setSelectedModel('gemini-3.5-flash');
              }}
              className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                groundingMode === 'maps'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={groundingMode === 'maps' ? 'Google Maps Ativo' : 'Ativar Google Maps'}
            >
              <MapPin className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center font-bold"
              title="Enviar mensagem"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

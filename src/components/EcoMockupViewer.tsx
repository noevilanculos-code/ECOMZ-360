import React, { useState } from 'react';
import {
  Layers,
  Image as ImageIcon,
  ZoomIn,
  ExternalLink,
  CheckCircle2,
  Eye,
  Layout,
  Grid,
  FileText,
  MapPin,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface MockupFile {
  id: string;
  name: string;
  filename: string;
  path: string;
  title: string;
  description: string;
  dimensions: string;
  highlights: string[];
}

const MOCKUP_FILES: MockupFile[] = [
  {
    id: '17_07_09',
    name: 'Mockup 1 — Dashboard & Telas Internas',
    filename: 'ChatGPT Image 18 de set. de 2026, 17_07_09.png',
    path: '/assets/img/imagens/ChatGPT%20Image%2018%20de%20set.%20de%202026,%2017_07_09.png',
    title: 'Visão Geral do Dashboard ECO-MZ 360 & Telas Internas',
    description: 'Apresenta o painel principal com banner de boas-vindas costeiro, 4 cartões de métricas (Ocorrências, Projetos, Alertas, Cidadãos), mapa interativo com marcadores regionais, feed lateral de ocorrências recentes e grade inferior com 8 telas internas do sistema.',
    dimensions: '1536 × 1024 px',
    highlights: [
      'Banner principal duplo com mensagem de impacto e chamada "Ver Mapa →"',
      '4 KPIs: Ocorrências (243), Projetos (18), Alertas (7), Cidadãos (1.246)',
      'Mapa ambiental central com legenda de marcadores',
      'Fluxo de telas: Filtros, Tabela de Ocorrências, Acompanhamento, Simulações, Relatórios, Perfil e Login'
    ]
  },
  {
    id: '17_08_41',
    name: 'Mockup 2 — Matriz das 12 Telas do Sistema',
    filename: 'ChatGPT Image 18 de set. de 2026, 17_08_41.png',
    path: '/assets/img/imagens/ChatGPT%20Image%2018%20de%20set.%20de%202026,%2017_08_41.png',
    title: 'Matriz Completa dos 12 Módulos e Telas do ECO-MZ 360',
    description: 'Guia visual detalhado contendo a arquitetura de informação completa em 12 módulos: Splash, Login, Dashboard, Mapa, Lista de Ocorrências, Detalhe, Lista de Projetos, Simulações, Notícias, Avisos, Perfil do Usuário e Painel de Administração.',
    dimensions: '1205 × 1305 px',
    highlights: [
      'Tela 1: Splash / Boas-Vindas com identidade verde e carregamento',
      'Tela 2: Login & Autenticação segura com opção social',
      'Tela 3: Dashboard com cartões de métricas e ocorrências rápidas',
      'Tela 4: Mapa Ambiental com camadas e legendas flutuantes',
      'Tela 5: Gestão de Ocorrências com filtros de status e botão "+ Nova Ocorrência"',
      'Tela 6: Detalhe da Ocorrência com fotos, coordenadas GPS e metadados',
      'Tela 7: Lista de Projetos com barras de progresso percentual',
      'Tela 8: Simulações de impacto e cenários de reflorestamento',
      'Tela 9: Notícias e artigos sobre preservação em Moçambique',
      'Tela 10: Central de Avisos e Alertas meteorológicos / desastres',
      'Tela 11: Perfil do Administrador Noé Samuel',
      'Tela 12: Administração em grade 2x3 (Utilizadores, Localidades, Categorias, Config, Logs, Backup)'
    ]
  },
  {
    id: '17_13_44',
    name: 'Mockup 3 — Painel Analítico Integrado',
    filename: 'ChatGPT Image 18 de set. de 2026, 17_13_44.png',
    path: '/assets/img/imagens/ChatGPT%20Image%2018%20de%20set.%20de%202026,%2017_13_44.png',
    title: 'Arquitetura do Painel ECO-MZ 360 com 4 Colunas Inferiores',
    description: 'Layout expandido com menu lateral azul slate profundo, barra superior de pesquisa, clima e perfil, banners de paisagens moçambicanas, mapa com marcadores, ocorrências recentes com badges de status, feed ECO-PULSE e as 4 colunas inferiores (Projetos em Destaque, Simulações, Indicadores ECO-DASH e Últimas Notícias).',
    dimensions: '1672 × 941 px',
    highlights: [
      'Cabeçalho com clima e data: "Seg, 26 de Maio de 2025 • 14:35"',
      'Feed em tempo real ECO-PULSE na lateral direita',
      'Card motivacional: "Pequenas ações, grandes impactos!"',
      'Coluna 1: Projetos com barras de progresso (65%, 100%, 0%)',
      'Coluna 2: Simulações com modelos de cenários e botão "+ Nova Simulação"',
      'Coluna 3: ECO-DASH (Ar: Boa, Água: Moderada, Cobertura: 78%, Temperatura: 26°C)',
      'Coluna 4: Lista vertical de últimas notícias ambientais'
    ]
  }
];

interface EcoMockupViewerProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenSplash?: () => void;
  onOpenLogin?: () => void;
  onOpenProfile?: () => void;
  onOpenAdmin?: () => void;
}

export const EcoMockupViewer: React.FC<EcoMockupViewerProps> = ({
  onNavigateToTab,
  onOpenSplash,
  onOpenLogin,
  onOpenProfile,
  onOpenAdmin
}) => {
  const [selectedMockup, setSelectedMockup] = useState<MockupFile>(MOCKUP_FILES[0]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageZoom, setImageZoom] = useState<number>(1);

  const screens12 = [
    { num: 1, name: 'Splash / Boas-Vindas', tab: 'dashboard', action: onOpenSplash, desc: 'Identidade ECO-MZ 360, logotipo e carregamento dos 21 módulos.' },
    { num: 2, name: 'Login & Autenticação', tab: 'dashboard', action: onOpenLogin, desc: 'Acesso seguro de técnicos, cidadãos, gestores e administradores.' },
    { num: 3, name: 'Início / Painel Principal', tab: 'dashboard', desc: 'Visão executiva com 4 KPIs, destaques deslizantes, mapa, ocorrências recentes e feeds.' },
    { num: 4, name: 'Mapa Ambiental Interativo', tab: 'territorio', desc: 'Satélite de Moçambique com marcadores coloridos e camadas.' },
    { num: 5, name: 'Gestão de Ocorrências', tab: 'territorio', desc: 'Filtros por status, busca e botão "+ Nova Ocorrência".' },
    { num: 6, name: 'Detalhe da Ocorrência', tab: 'territorio', desc: 'Evidências fotográficas, coordenadas GPS e histórico.' },
    { num: 7, name: 'Lista de Projetos', tab: 'projetos', desc: 'Acompanhamento com barras de progresso percentual.' },
    { num: 8, name: 'Painel de Simulações', tab: 'analise', desc: 'Modelagem de cenários de reflorestamento e prevenção.' },
    { num: 9, name: 'Notícias & Mídia', tab: 'educacao', desc: 'Artigos, matérias e comunicação institucional.' },
    { num: 10, name: 'Avisos & Alertas', tab: 'alertas', desc: 'Alertas meteorológicos, inundações e canais do INGD.' },
    { num: 11, name: 'Perfil do Administrador', tab: 'dashboard', action: onOpenProfile, desc: 'Gestão da conta de Noé Samuel (Administrador Geral).' },
    { num: 12, name: 'Painel de Administração', tab: 'admin', action: onOpenAdmin, desc: 'Grade 2x3: Utilizadores, Localidades, Categorias, Config, Logs, Backup.' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Modelos de Interface Oficiais (UI Mockups)</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Arquitetura Visual e Modelos de Design
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Modelos de interface de referência localizados em <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-xs">assets/img/imagens/</code>. Todas as seções, componentes, cartões de métricas, mapa e navegação do sistema foram implementados fielmente a partir destes designs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              3 Mockups • 12 Telas
            </span>
          </div>
        </div>
      </div>

      {/* Mockup Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {MOCKUP_FILES.map((m) => {
          const isSelected = selectedMockup.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMockup(m);
                setImageZoom(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Mockup Inspector Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">{selectedMockup.title}</span>
              <span className="text-[11px] text-slate-500 font-mono">({selectedMockup.dimensions})</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 font-bold"
                  title="Diminuir zoom"
                >
                  -
                </button>
                <span className="px-2 font-mono text-[11px] text-slate-500 font-semibold">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={() => setImageZoom(Math.min(2.5, imageZoom + 0.25))}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 font-bold"
                  title="Aumentar zoom"
                >
                  +
                </button>
              </div>

              <a
                href={selectedMockup.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Abrir imagem em alta resolução em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Alternar tela cheia"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Container with Scroll & Zoom */}
          <div className="p-4 bg-slate-950/5 flex items-center justify-center min-h-[480px] max-h-[640px] overflow-auto">
            <div
              style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 ease-out"
            >
              <img
                src={selectedMockup.path}
                alt={selectedMockup.title}
                className="max-w-full h-auto rounded-lg shadow-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-mono">Ficheiro: {selectedMockup.filename}</span>
            <span className="text-emerald-700 font-semibold">✓ Carregado com sucesso do diretório de assets</span>
          </div>
        </div>

        {/* Right Column: Spec Highlights & Live Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: Design Specs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Especificações do Mockup</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedMockup.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Elementos Chave Implementados:
              </p>
              {selectedMockup.highlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Direct Jump to Live Screens */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Acessar Telas Vivas no Sistema</span>
            </h3>
            <p className="text-xs text-emerald-800">
              Navegue diretamente para os módulos equivalentes implementados na aplicação viva:
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => onNavigateToTab?.('dashboard')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>Dashboard Principal Unificado</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab?.('territorio')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>Mapa Ambiental & Ocorrências</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab?.('projetos')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>Ação & Projetos em Execução</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab?.('analise')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>Simulador de Cenários Ecológicos</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab?.('ecobot')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>EcoBot Gemini (Search & Maps Live)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 12 Mockup Screens from Image 17_08_41 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-600" />
              <span>A Matriz de 12 Telas do ECO-MZ 360 (Mockup 17_08_41)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estrutura arquitetural dos 12 módulos desenhados no modelo e mapeados para as funcionalidades da aplicação.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            12 Módulos Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {screens12.map((s) => (
            <div
              key={s.num}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono">
                    Tela {s.num}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ativo</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {s.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {s.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  if (s.action) {
                    s.action();
                  } else {
                    onNavigateToTab?.(s.tab);
                  }
                }}
                className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start"
              >
                <span>Abrir no Sistema</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Overlay if toggled */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-white text-xs font-mono">{selectedMockup.title}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
            >
              Fechar Tela Cheia
            </button>
          </div>
          <img
            src={selectedMockup.path}
            alt={selectedMockup.title}
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

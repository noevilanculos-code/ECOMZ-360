import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  Sparkles,
  TreePine,
  Shield,
  Layers,
  Compass,
  CheckCircle2,
  TrendingUp,
  FolderKanban,
  Users,
  Target
} from 'lucide-react';
import { EnvironmentalProject, MozambiqueProvince } from '../types';

export interface HighlightProjectItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  province: MozambiqueProvince | string;
  district: string;
  leadEntity: string;
  imageUrl: string;
  progress: number;
  status: 'Planeado' | 'Em Execução' | 'Concluído';
  metrics: {
    label: string;
    value: string;
    detail?: string;
  }[];
  projectId?: string;
  targetTab?: string;
}

// Curated high-resolution environmental strategic initiatives across Mozambique
const DEFAULT_STRATEGIC_HIGHLIGHTS: HighlightProjectItem[] = [
  {
    id: 'destaque-mangais-beira',
    tag: 'Defesa Costeira & Clima',
    title: 'Restauração de Mangais da Costa de Sofala',
    subtitle: 'Barreira biológica contra ciclones tropicais no Canal de Moçambique',
    shortDescription: 'Plantio maciço de 180.000 propágulos nativos para restaurar 2.500 hectares de mangal degradado na orla da Beira e Delta do Zambeze, protegendo mais de 4.200 famílias ribeirinhas.',
    province: 'Sofala',
    district: 'Beira, Dondo e Delta do Zambeze',
    leadEntity: 'Associação Amigos do Mangal & MTA',
    imageUrl: '/assets/img/eco/mangais.jpg',
    progress: 68,
    status: 'Em Execução',
    metrics: [
      { label: 'Área Restaurada', value: '2.500 ha', detail: 'Meta 2026' },
      { label: 'Propágulos Fixados', value: '180.000', detail: 'Brigadas locais' },
      { label: 'Famílias Protegidas', value: '4.200+', detail: 'Orla costeira' }
    ],
    projectId: 'proj-001',
    targetTab: 'projetos'
  },
  {
    id: 'destaque-gorongosa-patrulha',
    tag: 'Demonstração • Biodiversidade & Fauna Bravia',
    title: 'Monitorização territorial na região da Gorongosa',
    subtitle: 'Visualização demonstrativa de conservação e resposta ambiental',
    shortDescription: 'Exemplo demonstrativo de acompanhamento de áreas de conservação e ações terrestres. Não representa telemetria, imagens de satélite ou dados operacionais em tempo real.',
    province: 'Sofala',
    district: 'Gorongosa, Cheringoma e Maringué',
    leadEntity: 'Exemplo demonstrativo ECO-MZ 360',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=85',
    progress: 84,
    status: 'Em Execução',
    metrics: [
      { label: 'Eficácia de Patrulha', value: '99.4%', detail: 'Zero incidentes críticos' },
      { label: 'Guardas Formados', value: '142', detail: 'Patrulhas diárias' },
      { label: 'Área Coberta', value: '4.067 km²', detail: '100% monitorada' }
    ],
    projectId: 'proj-gorongosa',
    targetTab: 'mapa'
  },
  {
    id: 'destaque-queimadas-niassa',
    tag: 'Prevenção de Fogo Florestal',
    title: 'Brigadas Comunitárias de Corta-Fogo no Niassa',
    subtitle: 'Prevenção ativa de incêndios florestais nas maiores matas de miombo',
    shortDescription: 'Criação de 450 km de faixas corta-fogo em florestas autóctones e capacitação de 35 comités aldeões em técnicas de queima controlada e alerta precoce por rádio comunitária.',
    province: 'Niassa',
    district: 'Lichinga, Marrupa e Mecula',
    leadEntity: 'Rede Ambiental de Lichinga & ANAC',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    progress: 52,
    status: 'Em Execução',
    metrics: [
      { label: 'Corta-Fogos Abertos', value: '240 km', detail: 'De 450 km previstos' },
      { label: 'Comités Ativos', value: '35 Aldeias', detail: 'Brigadas rurais' },
      { label: 'Redução de Focos', value: '-47%', detail: 'Face a 2025' }
    ],
    projectId: 'proj-002',
    targetTab: 'projetos'
  },
  {
    id: 'destaque-muralha-verde-gaza',
    tag: 'Florestas & Agrofloresta',
    title: 'Muralha Verde Comunitária do Sul',
    subtitle: 'Fixação de solos áridos e combate à desertificação no vale do Limpopo',
    shortDescription: 'Reflorestamento de zonas semiáridas com 620.000 mudas de espécies autóctones resistentes (Mafurreiras, Canhoeiros e Embondeiros), gerando renda sustentável através de óleos naturais.',
    province: 'Gaza',
    district: 'Chigubo, Guijá e Panda',
    leadEntity: 'Fundo de Desenvolvimento Florestal & MTA',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=85',
    progress: 60,
    status: 'Em Execução',
    metrics: [
      { label: 'Mudas no Solo', value: '620.000', detail: 'Espécies nativas' },
      { label: 'Comunidades Rurais', value: '32', detail: 'Cooperativas' },
      { label: 'Carbono Estimado', value: '~45k ton', detail: 'Seqüestro 5 anos' }
    ],
    projectId: 'proj-gaza',
    targetTab: 'projetos'
  },
  {
    id: 'destaque-qualidade-ar-maputo',
    tag: 'Saúde Ambiental & Ar Limpo',
    title: 'Rede de Telemetria da Qualidade do Ar de Maputo e Matola',
    subtitle: 'Monitorização contínua de partículas PM2.5 e emissões industriais',
    shortDescription: '12 estações automáticas com sensores ópticos IoT que alimentam os servidores centrais do MTA e AQUA, emitindo boletins horários abertos à população e centros de saúde.',
    province: 'Maputo Cidade',
    district: 'Matola, Machava e Baía de Maputo',
    leadEntity: 'AQUA & Conselhos Municipais',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85',
    progress: 75,
    status: 'Em Execução',
    metrics: [
      { label: 'Estações no Terreno', value: '12 IoT', detail: 'Operação 24/7' },
      { label: 'Índice Médio IQA', value: '42 (Bom)', detail: 'Padrão internacional' },
      { label: 'Frequência de Dados', value: '5 min', detail: 'Tempo real' }
    ],
    projectId: 'proj-ar',
    targetTab: 'ecopulse'
  },
  {
    id: 'destaque-santuario-bazaruto',
    tag: 'Santuários Marinhos & Recifes',
    title: 'Santuário de Recifes de Coral & Dugongos de Bazaruto',
    subtitle: 'Proteção marítima da última colónia saudável de dugongos no Índico Ocidental',
    shortDescription: 'Patrulhas náuticas apoiadas por pescadores artesanais para garantir zonas de não-arrasto, monitorização batimétrica de corais e regeneração de pradarias submarinas.',
    province: 'Inhambane',
    district: 'Vilankulo & Bazaruto',
    leadEntity: 'ANAC & Administração do PNAB',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=1600&auto=format&fit=crop&q=85',
    progress: 90,
    status: 'Em Execução',
    metrics: [
      { label: 'Dugongos Catalogados', value: '~250', detail: 'População viável' },
      { label: 'Área Marinha', value: '1.430 km²', detail: 'Zona protegida' },
      { label: 'Pesca Sustentável', value: '100%', detail: 'Acordo comunitário' }
    ],
    projectId: 'proj-bazaruto',
    targetTab: 'mapa'
  }
];

const getMatchingProjectImage = (category: string, title: string): string => {
  const text = `${category} ${title}`.toLowerCase();
  if (text.includes('mangal') || text.includes('mangais') || text.includes('costa') || text.includes('marinh')) {
    return '/assets/img/eco/mangais.jpg';
  }
  if (text.includes('resíduo') || text.includes('lixo') || text.includes('reciclagem')) {
    return '/assets/img/eco/residuos.jpg';
  }
  if (text.includes('queimada') || text.includes('fogo') || text.includes('incêndio')) {
    return '/assets/img/eco/queimadas.jpg';
  }
  if (text.includes('hídric') || text.includes('água') || text.includes('rio')) {
    return '/assets/img/eco/poluicao_rios.jpg';
  }
  if (text.includes('erosão') || text.includes('ravina') || text.includes('duna')) {
    return '/assets/img/eco/erosao.jpg';
  }
  if (text.includes('biodiversidade') || text.includes('educação') || text.includes('fauna')) {
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=85';
  }
  return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=85';
};

interface FeaturedHighlightsSliderProps {
  projects?: EnvironmentalProject[];
  onNavigateToTab?: (tab: string) => void;
  onSelectProject?: (proj: EnvironmentalProject) => void;
  className?: string;
  autoplayIntervalMs?: number;
}

// Slide transition variants for Framer Motion with direction awareness
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 }
    }
  })
};

export const FeaturedHighlightsSlider: React.FC<FeaturedHighlightsSliderProps> = ({
  projects,
  onNavigateToTab,
  onSelectProject,
  className = '',
  autoplayIntervalMs = 6000
}) => {
  // Merge live projects from context with curated strategic highlights
  const slidesData: HighlightProjectItem[] = useMemo(() => {
    if (!projects || projects.length === 0) {
      return DEFAULT_STRATEGIC_HIGHLIGHTS;
    }

    // Convert live projects into slide items if available, combined with category-matched imagery
    const liveItems: HighlightProjectItem[] = projects.slice(0, 4).map((p) => {
      return {
        id: p.id,
        tag: p.category,
        title: p.title,
        subtitle: `Iniciativa de impacto provincial em ${p.province} (${p.district})`,
        shortDescription: p.description,
        province: p.province,
        district: p.district,
        leadEntity: p.leadEntity,
        imageUrl: getMatchingProjectImage(p.category, p.title),
        progress: p.progress,
        status: p.status,
        metrics: [
          { label: 'Progresso da Obra', value: `${p.progress}%`, detail: p.status },
          { label: 'Orçamento Executado', value: `${(p.budgetRaisedMZN / 1000000).toFixed(1)}M MT`, detail: `De ${(p.budgetTotalMZN / 1000000).toFixed(1)}M MT` },
          { label: 'Voluntários Ativos', value: `${p.volunteersEnrolled}`, detail: `De ${p.volunteerSpots} vagas` }
        ],
        projectId: p.id,
        targetTab: 'projetos'
      };
    });

    // Fill remaining slots with strategic initiatives to ensure 6 dynamic slides
    const needed = Math.max(0, 6 - liveItems.length);
    const supplemental = DEFAULT_STRATEGIC_HIGHLIGHTS.slice(0, needed);
    return [...liveItems, ...supplemental];
  }, [projects]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const totalSlides = slidesData.length;

  const currentItem = slidesData[currentIndex] || slidesData[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const handleSelectIndex = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
    setProgress(0);
  };

  // Autoplay and progress bar interval
  useEffect(() => {
    if (isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / autoplayIntervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPaused, autoplayIntervalMs, handleNext]);

  // Handle action navigation
  const handleActionClick = () => {
    if (currentItem.projectId && onSelectProject && projects) {
      const match = projects.find((p) => p.id === currentItem.projectId);
      if (match) {
        onSelectProject(match);
        return;
      }
    }

    if (currentItem.targetTab && onNavigateToTab) {
      onNavigateToTab(currentItem.targetTab);
    }
  };

  return (
    <section
      aria-label="Destaques e Iniciativas Estratégicas de Moçambique"
      className={`w-full bg-[#062B3D] text-white rounded-3xl overflow-hidden shadow-2xl border border-[#0d3f56] transition-all relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Header: Clean title with subtle arrows */}
      <div className="px-5 sm:px-8 py-3.5 border-b border-[#0d3f56] flex items-center justify-between gap-4 bg-[#052332]/95 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-sm text-white tracking-wide">
            Projetos & Ações em Destaque
          </span>
        </div>

        {/* Directional navigation arrows (minimalist & clean) */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#07364A] active:scale-95 transition-all cursor-pointer"
            aria-label="Anterior"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#07364A] active:scale-95 transition-all cursor-pointer"
            aria-label="Próximo"
            title="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Slide Container with Framer Motion Animated Transitions */}
      <div className="relative min-h-[420px] sm:min-h-[400px] lg:min-h-[380px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentItem.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full grid grid-cols-1 lg:grid-cols-12"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -100 || offset.x < -80) {
                handleNext();
              } else if (swipe > 100 || offset.x > 80) {
                handlePrev();
              }
            }}
          >
            {/* Left Column: Rich Project Story, Status & Metrics (7 cols on desktop) */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between z-10">
              <div>
                {/* Meta details with clean typography */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-3 font-medium">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    {currentItem.tag}
                  </span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="text-slate-200 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {currentItem.province}
                  </span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="text-slate-300">{currentItem.district}</span>
                </div>

                {/* Catchy headline */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  {currentItem.title}
                </h3>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-semibold text-emerald-300 mt-2 leading-snug">
                  {currentItem.subtitle}
                </p>

                {/* Short narrative description */}
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed font-normal line-clamp-3">
                  {currentItem.shortDescription}
                </p>

                {/* Dynamic Progress & Metrics Grid */}
                <div className="mt-5 p-4 rounded-2xl bg-[#052332]/80 border border-[#0d3f56]">
                  {/* Progress Bar with Framer Motion entry */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Status: <strong className="text-white">{currentItem.status}</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentItem.progress}% concluído
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${currentItem.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  {/* 3 Metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#0d3f56]/70">
                    {currentItem.metrics.map((m, idx) => (
                      <div key={idx} className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block truncate">
                          {m.label}
                        </span>
                        <span className="text-base sm:text-lg font-black text-white block mt-0.5 tracking-tight truncate">
                          {m.value}
                        </span>
                        {m.detail && (
                          <span className="text-[10px] text-emerald-400 font-medium block truncate mt-0.5">
                            {m.detail}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action and Lead Entity row */}
              <div className="pt-6 mt-4 border-t border-[#0d3f56]/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="text-slate-500">Coordenação:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {currentItem.leadEntity}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className="px-5 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#00B956] text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2 group cursor-pointer active:scale-95"
                  >
                    <span>Explorar Projeto</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: High-Resolution Photographic Visual with Motion Zoom (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[380px] overflow-hidden bg-[#041a25]">
              <motion.img
                key={currentItem.id + '-image'}
                src={currentItem.imageUrl}
                alt={currentItem.title}
                initial={{ scale: 1.08, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&auto=format&fit=crop&q=85';
                }}
              />

              {/* Seamless dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#062B3D] via-[#062B3D]/30 to-transparent pointer-events-none" />

              {/* Floating badges on photo */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                  {currentItem.status}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 text-slate-200 backdrop-blur-xs border border-white/10">
                  Moçambique
                </span>
              </div>

              {/* Photo Caption & Location overlay at bottom */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-300 drop-shadow-md">
                <span className="font-semibold truncate max-w-[240px]">
                  {currentItem.district}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Observatório Ambiental
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Linear Progress Bar with Framer Motion width transition */}
      <div className="w-full h-1 bg-[#052332] relative overflow-hidden" aria-hidden="true">
        <motion.div
          className="h-full bg-emerald-400"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* 4. Interactive Navigation Dots */}
      <div className="px-6 py-3.5 bg-[#052332] border-t border-[#0d3f56] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {slidesData.map((item, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={item.id + '-dot'}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                className="relative py-2 px-1 focus:outline-none cursor-pointer group"
                aria-label={`Ir para destaque ${idx + 1}`}
              >
                <motion.div
                  className={`h-2 rounded-full transition-colors duration-300 ${
                    isActive
                      ? 'bg-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-[#0d3f56] hover:bg-slate-600'
                  }`}
                  animate={{
                    width: isActive ? 28 : 8,
                    backgroundColor: isActive ? '#34d399' : '#1e405b'
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

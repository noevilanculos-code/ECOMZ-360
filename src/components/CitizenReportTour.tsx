import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Send,
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileDown
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

interface CitizenReportTourProps {
  onStartReport?: () => void;
  variant?: 'compact' | 'banner';
}

interface TourStep {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tips: string[];
  icon: React.ElementType;
  accentColor: string;
  imageUrl: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    badge: 'Passo 1 de 3 • Registo Visual',
    title: '1. Tire uma Foto e Descreva o que Viu',
    subtitle: 'Mostre o problema de forma simples e direta',
    description:
      'Viu lixo acumulado, corte ilegal de árvores, queimada descontrolada ou água poluída no seu bairro? Abra a câmara no formulário (ou escolha uma foto do telemóvel) e escreva em poucas palavras o que está a acontecer.',
    tips: [
      'Escolha o tipo de problema (ex: Queimadas, Poluição de Rios, Mangais ou Lixo).',
      'Pode usar a câmara ao vivo com data e hora automáticas.',
      'Não precisa usar palavras difíceis — conte apenas o que observou.'
    ],
    icon: Camera,
    accentColor: 'from-emerald-500 to-teal-600',
    imageUrl: '/assets/img/eco/mangais.jpg'
  },
  {
    stepNumber: 2,
    badge: 'Passo 2 de 3 • Localização Fácil',
    title: '2. Indique Onde Está a Acontecer',
    subtitle: 'Com um toque no GPS ou escolhendo o seu Distrito',
    description:
      'Para que a equipa técnica consiga chegar ao local certo, indique a Província e o Distrito. Se estiver no local, basta tocar em "Capturar Meu GPS Atual" ou apontar no mapa interativo.',
    tips: [
      'Um único clique preenche as coordenadas GPS automaticamente.',
      'Pode acrescentar um ponto de referência (ex: "Perto da escola ou da ponte").',
      'Funciona em todas as 11 províncias e 154 distritos de Moçambique.'
    ],
    icon: MapPin,
    accentColor: 'from-blue-500 to-cyan-600',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg'
  },
  {
    stepNumber: 3,
    badge: 'Passo 3 de 3 • Envio Seguro',
    title: '3. Envie em Segurança (Mesmo em Anonimato)',
    subtitle: 'Receba o seu código para acompanhar a solução',
    description:
      'Decida se quer identificar-se ou enviar como Denúncia Anónima (protegida pela Lei do Ambiente n.º 20/97). Ao tocar em "Submeter", recebe na hora um código de protocolo e pode baixar o comprovativo em PDF!',
    tips: [
      'A sua identidade fica 100% protegida se marcar a opção Anónima.',
      'Guarde o código (ex: ECO-2026-MZ-001) para ver quando o problema for resolvido.',
      'Pode descarregar o comprovativo oficial da denúncia em PDF.'
    ],
    icon: Send,
    accentColor: 'from-amber-500 to-emerald-600',
    imageUrl: '/assets/img/eco/residuos.jpg'
  }
];

export const CitizenReportTour: React.FC<CitizenReportTourProps> = ({
  onStartReport,
  variant = 'compact'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const current = TOUR_STEPS[activeStep];
  const StepIcon = current.icon;

  const handleOpen = () => {
    setActiveStep(0);
    setIsOpen(true);
  };

  const handleDownloadGuidePDF = () => {
    exportToPDF({
      title: 'Guia do Cidadao: Como Fazer uma Denuncia Ambiental em 3 Passos',
      subtitle: 'Manual rapido e amigavel de participacao comunitaria no ECO-MZ 360',
      category: 'Guia Comunitario',
      region: 'Mocambique (11 Provincias)',
      author: 'Observatorio Ambiental ECO-MZ 360',
      summary:
        'Qualquer cidadao pode comunicar problemas ambientais no seu bairro ou comunidade de forma simples, gratuita e segura (incluindo opcao de anonimato garantida pela Lei n. 20/97).',
      metrics: [
        { label: 'Passo 1', value: 'Tirar foto do problema e escrever uma breve descricao' },
        { label: 'Passo 2', value: 'Indicar a Provincia, Distrito ou ativar o GPS com 1 clique' },
        { label: 'Passo 3', value: 'Submeter (com ou sem anonimato) e guardar o protocolo oficial' }
      ],
      recommendations: [
        'Mantenha uma distancia segura ao fotografar queimadas ou descargas quimicas.',
        'Adicione sempre um ponto de referencia conhecido na comunidade para ajudar as brigadas.',
        'Utilize o numero de protocolo gerado para acompanhar a resolucao na plataforma.'
      ],
      filename: 'guia-denuncia-cidada-3-passos.pdf'
    });
  };

  return (
    <>
      {/* Clean, Unobtrusive Trigger */}
      {variant === 'banner' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Primeira vez a comunicar um problema ambiental?
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  3 Passos Simples
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Veja o guia rápido e amigável para enviar uma denúncia em menos de 1 minuto.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleOpen}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Como Fazer uma Denúncia (Tour)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadGuidePDF}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              title="Baixar Guia em PDF"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Como Denunciar em 3 Passos</span>
        </button>
      )}

      {/* Interactive 3-Step Tour Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header */}
            <div className="bg-[#062B3D] text-white px-6 py-4 flex items-center justify-between border-b border-[#0a4861]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A651] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Guia Interativo do Cidadão Guardião
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Como Fazer uma Denúncia Ambiental em 3 Passos
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleDownloadGuidePDF}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Descarregar este guia em PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Baixar Guia (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Fechar guia"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Selector Pills */}
            <div className="px-6 pt-5 pb-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                {TOUR_STEPS.map((st, idx) => {
                  const Icon = st.icon;
                  const isCurrent = idx === activeStep;
                  const isDone = idx < activeStep;
                  return (
                    <button
                      key={st.stepNumber}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase opacity-80">
                          Passo {st.stepNumber}
                        </div>
                        <div className="text-xs font-extrabold truncate">
                          {st.stepNumber === 1 ? 'Foto e Relato' : st.stepNumber === 2 ? 'Localização' : 'Envio Seguro'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Step Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Visual Illustration Card */}
                <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 md:h-56 bg-slate-950">
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-sm">
                      {current.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${current.accentColor} flex items-center justify-center shadow-md shrink-0`}>
                      <StepIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold leading-tight">
                      {current.subtitle}
                    </span>
                  </div>
                </div>

                {/* Friendly Explanation */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {current.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {current.description}
                  </p>

                  <div className="space-y-2 pt-1">
                    {current.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legal Reassurance Strip */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>100% Gratuito e Protegido:</strong> A sua participação ajuda a proteger as nossas florestas, rios e comunidades.
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                {activeStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Passo Anterior</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                  >
                    Fechar Guia
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {activeStep < TOUR_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Próximo Passo ({activeStep + 2}/3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onStartReport?.();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-black shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Fazer uma Denúncia Agora</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

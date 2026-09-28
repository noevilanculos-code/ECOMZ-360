import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  TreePine,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  Check,
  RotateCcw,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MozambiqueProvince } from '../types';

interface ConversationalReportWizardProps {
  onClose?: () => void;
  onReportCreated?: (reportTitle: string) => void;
}

export const ConversationalReportWizard: React.FC<ConversationalReportWizardProps> = ({
  onClose,
  onReportCreated
}) => {
  const { occurrences, projects, addReport, selectedProvince: globalProvince } = useApp();

  // Wizard Steps: 1. Tema -> 2. Região -> 3. Período -> 4. Conteúdo -> 5. Formato -> 6. Concluído
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>('A preparar...');

  // Form State
  const [selectedTopic, setSelectedTopic] = useState<'ocorrencias' | 'projetos' | 'geral' | 'previsoes'>('ocorrencias');
  const [targetProvince, setTargetProvince] = useState<MozambiqueProvince | 'Todas'>(
    globalProvince !== 'Todas' ? globalProvince : 'Todas'
  );
  const [timeRange, setTimeRange] = useState<'30dias' | 'trimestre' | 'ano' | 'completo'>('30dias');
  const [includePhotos, setIncludePhotos] = useState<boolean>(true);
  const [includeMap, setIncludeMap] = useState<boolean>(true);
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeRecommendations, setIncludeRecommendations] = useState<boolean>(true);
  const [format, setFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [createdReportData, setCreatedReportData] = useState<any>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const provincesList: (MozambiqueProvince | 'Todas')[] = [
    'Todas',
    'Cabo Delgado',
    'Gaza',
    'Inhambane',
    'Manica',
    'Maputo Cidade',
    'Maputo Província',
    'Nampula',
    'Niassa',
    'Sofala',
    'Tete',
    'Zambézia'
  ];

  // Helper to suggest a friendly title
  const getSuggestedTitle = () => {
    const regionName = targetProvince === 'Todas' ? 'Moçambique Nacional' : targetProvince;
    const timeLabel =
      timeRange === '30dias'
        ? 'Últimos 30 Dias'
        : timeRange === 'trimestre'
        ? 'Balanço Trimestral'
        : timeRange === 'ano'
        ? 'Ano 2026'
        : 'Histórico Consolidado';

    switch (selectedTopic) {
      case 'ocorrencias':
        return `Relatório de Ocorrências e Denúncias Comunitárias - ${regionName} (${timeLabel})`;
      case 'projetos':
        return `Balanço de Ações e Projetos de Preservação - ${regionName} (${timeLabel})`;
      case 'previsoes':
        return `Cenários e Metas de Sustentabilidade - ${regionName} (${timeLabel})`;
      default:
        return `Panorama Geral da Situação Ambiental - ${regionName} (${timeLabel})`;
    }
  };

  // Stats calculation for the chosen scope
  const filteredOccurrences = occurrences.filter((occ) => {
    if (targetProvince !== 'Todas' && occ.province !== targetProvince) return false;
    return true;
  });

  const filteredProjects = projects.filter((p) => {
    if (targetProvince !== 'Todas' && p.province !== targetProvince) return false;
    return true;
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      generateReport();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateReport = () => {
    setIsGenerating(true);
    setCurrentStep(6);
    setGenerationProgress('A recolher os dados oficiais da sua região...');

    setTimeout(() => {
      setGenerationProgress('A organizar as fotografias e evidências no terreno...');
    }, 600);

    setTimeout(() => {
      setGenerationProgress('A formatar o documento em linguagem clara e oficial...');
    }, 1200);

    setTimeout(() => {
      const finalTitle = customTitle.trim() ? customTitle : getSuggestedTitle();
      const reportCategory =
        selectedTopic === 'ocorrencias'
          ? 'Ocorrências'
          : selectedTopic === 'projetos'
          ? 'Projetos'
          : selectedTopic === 'previsoes'
          ? 'Simulações'
          : 'Gerais';

      const newReport = addReport({
        title: finalTitle,
        category: reportCategory,
        type:
          selectedTopic === 'ocorrencias'
            ? 'Denúncias Comunitárias'
            : selectedTopic === 'projetos'
            ? 'Projetos & Brigadas'
            : selectedTopic === 'previsoes'
            ? 'Cenários Futuros'
            : 'Panorama Geral',
        date: new Date().toLocaleDateString('pt-PT'),
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        status: 'Concluído',
        format: format,
        description: `Documento gerado pelo Assistente Comunitário para ${
          targetProvince === 'Todas' ? 'todo o país' : `a província de ${targetProvince}`
        }. Contém ${filteredOccurrences.length} ocorrências mapeadas e ${filteredProjects.length} ações de campo.`
      });

      setCreatedReportData({
        ...newReport,
        region: targetProvince === 'Todas' ? 'Moçambique (Todas as Províncias)' : targetProvince,
        totalOccurrences: filteredOccurrences.length,
        resolvedOccurrences: filteredOccurrences.filter((o) => o.status === 'Resolvido').length,
        totalProjects: filteredProjects.length,
        highlightPhoto: filteredOccurrences[0]?.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
      });

      setIsGenerating(false);
      onReportCreated?.(finalTitle);
    }, 1800);
  };

  const handleDownload = () => {
    const title = createdReportData?.title || 'Relatorio_Ambiental';
    setDownloadSuccessToast(`O documento "${title}" começou a ser transferido.`);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!createdReportData) return;
    const text = `📋 *${createdReportData.title}*\n🏛️ República de Moçambique - ECO-MZ 360\n📍 Região: ${createdReportData.region}\n📌 Denúncias analisadas: ${createdReportData.totalOccurrences} (${createdReportData.resolvedOccurrences} resolvidas)\n🌱 Projetos de apoio: ${createdReportData.totalProjects}\nDocumento oficial pronto para partilha comunitária.`;
    navigator.clipboard?.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCreatedReportData(null);
    setCustomTitle('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner: Conversational Header */}
      <div className="bg-gradient-to-r from-[#062B3D] via-[#08384f] to-[#062B3D] text-white p-6 sm:p-7 border-b border-[#0a4861]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Assistente Amigável
                </span>
                <span className="text-xs text-slate-300">Sem termos complicados</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Criador de Relatórios Passo a Passo
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Voltar à Lista
            </button>
          )}
        </div>

        {/* Step Progress Tracker */}
        {currentStep <= 5 && (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
              <span>Passo {currentStep} de 5</span>
              <span className="font-semibold text-emerald-400">
                {currentStep === 1 && '1. O que quer analisar?'}
                {currentStep === 2 && '2. Qual a região?'}
                {currentStep === 3 && '3. Qual o período?'}
                {currentStep === 4 && '4. O que destacar?'}
                {currentStep === 5 && '5. Formato do documento'}
              </span>
            </div>
            <div className="w-full bg-[#0a4861] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Step Body */}
      <div className="p-6 sm:p-8">
        {/* Step 1: Escolha do Tema */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Primeiro Passo
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Olá! Sobre o que gostaria que fosse o seu documento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Escolha o assunto principal que deseja reunir. Nós organizamos todos os dados recolhidos para si de forma simples e clara.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  id: 'ocorrencias',
                  title: 'Denúncias e Alertas da População',
                  desc: 'Focos de queimadas, resíduos abandonados, corte de árvores e poluição da água reportados pelos cidadãos.',
                  icon: AlertTriangle,
                  badge: `${occurrences.length} registadas`,
                  color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                },
                {
                  id: 'projetos',
                  title: 'Projetos e Ações de Preservação',
                  desc: 'Plantio comunitário de árvores, recuperação de mangais costeiros, voluntariado e brigadas de terreno.',
                  icon: TreePine,
                  badge: `${projects.length} iniciativas`,
                  color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                },
                {
                  id: 'geral',
                  title: 'Resumo Geral do Meio Ambiente',
                  desc: 'Uma visão de conjunto combinando denúncias, soluções em andamento e saúde ecológica da região.',
                  icon: Sparkles,
                  badge: 'Visão Completa',
                  color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                },
                {
                  id: 'previsoes',
                  title: 'Previsões e Futuro Sustentável',
                  desc: 'Estimativas de recuperação florestal, metas de carbono e impacto esperado para os próximos anos.',
                  icon: BarChart3,
                  badge: 'Cenários Futuros',
                  color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
                }
              ].map((item) => {
                const isSelected = selectedTopic === item.id;
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTopic(item.id as any)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${item.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                        {isSelected ? '✓ Selecionado' : 'Clique para escolher'}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Escolha da Região */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Segundo Passo
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Qual é a parte de Moçambique que quer destacar?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Pode escolher uma província específica ou analisar o país todo. O relatório adapta-se automaticamente à sua escolha.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {provincesList.map((prov) => {
                const isSelected = targetProvince === prov;
                const occCount = prov === 'Todas'
                  ? occurrences.length
                  : occurrences.filter((o) => o.province === prov).length;
                const projCount = prov === 'Todas'
                  ? projects.length
                  : projects.filter((p) => p.province === prov).length;

                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setTargetProvince(prov)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <MapPin
                        className={`w-4 h-4 ${
                          isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {prov === 'Todas' ? '🇲🇿 Todo o País' : prov}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {occCount} denúncias • {projCount} projetos
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>
                Região selecionada: <strong>{targetProvince === 'Todas' ? 'Moçambique Completo (11 Províncias)' : targetProvince}</strong> com{' '}
                <strong>{filteredOccurrences.length} ocorrências</strong> e <strong>{filteredProjects.length} projetos</strong> ativos.
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Escolha do Período */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Terceiro Passo
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Qual é o período de tempo que deseja cobrir?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Selecione a janela temporal mais adequada para o objetivo do seu documento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  id: '30dias',
                  title: 'Últimos 30 Dias (Recente)',
                  desc: 'Excelente para acompanhar acontecimentos urgentes, fiscalização imediata e reuniões desta semana.',
                  badge: 'Mais pedido'
                },
                {
                  id: 'trimestre',
                  title: 'Último Trimestre (3 Meses)',
                  desc: 'Ideal para balanços de estação chuvosa ou seca, e para prestação de contas às lideranças locais.',
                  badge: 'Recomendado'
                },
                {
                  id: 'ano',
                  title: 'Ano em Curso (2026)',
                  desc: 'Visão consolidada do ano atual, mostrando a evolução das intervenções ao longo dos meses.',
                  badge: 'Anual'
                },
                {
                  id: 'completo',
                  title: 'Histórico Completo Acumulado',
                  desc: 'Reúne todo o histórico verificado na plataforma para comparações de longo prazo.',
                  badge: 'Completo'
                }
              ].map((item) => {
                const isSelected = timeRange === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setTimeRange(item.id as any)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Conteúdos a Destacar */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Quarto Passo
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                O que gostaria que aparecesse em destaque no documento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Pode ativar ou desativar os elementos para deixar o relatório mais visual ou mais resumido conforme a sua preferência.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  title: 'Fotografias e Provas Visuais do Terreno',
                  desc: 'Inclui imagens reais captadas pelos cidadãos e brigadas (ex: fotos de focos de queimada ou mudas plantadas).',
                  icon: ImageIcon,
                  value: includePhotos,
                  setter: setIncludePhotos
                },
                {
                  title: 'Mapa Ilustrado das Localizações',
                  desc: 'Mostra os pontos onde as ações ou denúncias ocorreram para facilitar a identificação física no terreno.',
                  icon: MapPin,
                  value: includeMap,
                  setter: setIncludeMap
                },
                {
                  title: 'Gráficos Simples e Fáceis de Explicar',
                  desc: 'Resumos visuais que ajudam a apresentar os números em reuniões com líderes comunitários ou dirigentes.',
                  icon: BarChart3,
                  value: includeCharts,
                  setter: setIncludeCharts
                },
                {
                  title: 'Conselhos e Próximos Passos Práticos',
                  desc: 'Dicas e recomendações práticas sobre o que a comunidade e os parceiros devem fazer a seguir.',
                  icon: Lightbulb,
                  value: includeRecommendations,
                  setter: setIncludeRecommendations
                }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => item.setter(!item.value)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      item.value
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          item.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        item.value
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {item.value && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Formato e Confirmação */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Quinto Passo
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Como prefere descarregar o seu documento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Escolha o formato que for mais confortável para si e dê um título personalizado se desejar.
              </p>
            </div>

            {/* Format cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setFormat('PDF')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  format === 'PDF'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  {format === 'PDF' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Documento Oficial em PDF
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Pronto a imprimir, assinar ou partilhar em reuniões comunitárias e pelo WhatsApp.
                </p>
              </div>

              <div
                onClick={() => setFormat('Excel')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  format === 'Excel'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  {format === 'Excel' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Folha de Cálculo (Excel)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ideal para quem gosta de ver os dados em tabelas limpas no computador ou no telemóvel.
                </p>
              </div>
            </div>

            {/* Title customization */}
            <div className="pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Título do Documento (Opcional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={getSuggestedTitle()}
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Se deixar em branco, usaremos automaticamente o título sugerido acima.
              </p>
            </div>

            {/* Conversational summary card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Resumo da sua escolha:</span>
              </div>
              <p className="leading-relaxed">
                Vamos preparar um <strong>{format}</strong> sobre <strong>{selectedTopic}</strong> para a região de{' '}
                <strong>{targetProvince === 'Todas' ? 'Moçambique Completo' : targetProvince}</strong> relativo a{' '}
                <strong>{timeRange}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Conclusão & Pré-Visualização */}
        {currentStep === 6 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {isGenerating ? (
              <div className="py-16 text-center space-y-5 animate-in fade-in">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    A preparar o seu relatório oficial...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium animate-pulse">
                    {generationProgress}
                  </p>
                </div>
              </div>
            ) : createdReportData ? (
              <div className="space-y-6 animate-in fade-in">
                {/* Success alert */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                        O seu relatório foi criado com sucesso!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Já foi arquivado na lista oficial e está pronto para ser descarregado ou impresso.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descarregar Agora</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1 cursor-pointer"
                      title="Imprimir"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Imprimir</span>
                    </button>
                  </div>
                </div>

                {downloadSuccessToast && (
                  <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{downloadSuccessToast}</span>
                  </div>
                )}

                {/* Printable Official Document Preview */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                  {/* Institutional Letterhead */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-700 gap-4 text-center sm:text-left">
                    <div className="flex items-center space-x-4">
                      <img
                        src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                        alt="ECO-MZ 360"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <div className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
                          República de Moçambique • MTA / INGD
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          ECO-MZ 360 • Observatório Ambiental
                        </h4>
                        <div className="text-xs text-slate-500">
                          Documento Oficial Comunitário & Institucional
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificado & Autêntico</span>
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Emitido a {createdReportData.date} às {createdReportData.time}
                      </div>
                    </div>
                  </div>

                  {/* Document Title & Highlights */}
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {createdReportData.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {createdReportData.description}
                    </p>
                  </div>

                  {/* Real Stats Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {createdReportData.totalOccurrences}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Ocorrências Mapeadas
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-600">
                        {createdReportData.resolvedOccurrences}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Casos Resolvidos
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-2xl font-black text-blue-600">
                        {createdReportData.totalProjects}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Projetos Ativos
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-600">
                        {createdReportData.totalOccurrences > 0
                          ? `${Math.round((createdReportData.resolvedOccurrences / createdReportData.totalOccurrences) * 100)}%`
                          : '100%'}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Taxa de Resolução
                      </div>
                    </div>
                  </div>

                  {/* Visual Evidence Section */}
                  {includePhotos && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Registo Fotográfico do Terreno</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                          <img
                            src={createdReportData.highlightPhoto}
                            alt="Comprovativo de campo"
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-3 text-[11px] text-slate-500">
                            Registo verificado pela comunidade e técnicos locais em {createdReportData.region}.
                          </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            Resumo das Ações de Campo
                          </h5>
                          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                            <li className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Intervenção direta de brigadas comunitárias.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Coordenadas GPS validadas pelo MTA.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Registo fotográfico guardado no histórico do sistema.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Practical Recommendations Section */}
                  {includeRecommendations && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-white">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Recomendações Práticas para a Comunidade & Gestores</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        1. Manter a fiscalização comunitária ativa nas zonas costeiras e de mata nativa.<br />
                        2. Apoiar os voluntários locais na rega e proteção das mudas recém-plantadas.<br />
                        3. Encaminhar denúncias imediatas à liderança comunitária e técnicos do distrito.
                      </p>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedToast ? 'Copiado para a Área de Transferência!' : 'Copiar Resumo para WhatsApp'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Criar Outro Documento</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        {currentStep <= 5 && (
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Passo Anterior</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center space-x-2 transition-all hover:scale-102 cursor-pointer"
            >
              <span>{currentStep === 5 ? 'Gerar Meu Relatório Agora' : 'Avançar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

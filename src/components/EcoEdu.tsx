import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Download,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  Share2,
  Globe
} from 'lucide-react';
import { EducationalModule } from '../types';
import { INITIAL_EDU_MODULES } from '../data/mockData';
import { exportToPDF } from '../utils/pdfExport';

export const EcoEdu: React.FC = () => {
  const [modules, setModules] = useState<EducationalModule[]>(INITIAL_EDU_MODULES);
  const [selectedModule, setSelectedModule] = useState<EducationalModule | null>(INITIAL_EDU_MODULES[0]);
  const [activeQuizStep, setActiveQuizStep] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [certificateGenerated, setCertificateGenerated] = useState<boolean>(false);

  const sampleQuiz = [
    {
      question: 'Qual é a função primordial dos mangais na proteção costeira de cidades como a Beira e Quelimane?',
      options: [
        'Aumentar a temperatura das águas estuarinas.',
        'Dissipar a energia mecânica de ondas ciclónicas e reter sedimentos contra a erosão.',
        'Servir apenas para extração de lenha doméstica comercial.',
        'Impedir o crescimento de caranguejos e peixes de viveiro.'
      ],
      correctIndex: 1
    },
    {
      question: 'Segundo a Lei n.º 20/97 de Moçambique, a responsabilidade de restaurar um dano ambiental recai sobre:',
      options: [
        'Apenas as organizações não governamentais internacionais.',
        'O poluidor / degradador, sob o princípio do poluidor-pagador.',
        'Apenas os líderes comunitários locais.',
        'Nenhuma entidade legalmente tipificada.'
      ],
      correctIndex: 1
    }
  ];

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === sampleQuiz[activeQuizStep].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    if (activeQuizStep + 1 < sampleQuiz.length) {
      setActiveQuizStep((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setActiveQuizStep(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setQuizScore(0);
    setCertificateGenerated(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ECO-EDU • Academia Ambiental de Moçambique</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Módulos Pedagógicos e Certificação Cidadã
          </h2>
          <p className="text-xs text-slate-500">
            Educação ecológica adaptada ao currículo nacional e realidades comunitárias (mangais, miombo, bacias do Zambeze).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>PT • Changana • Sena • Makhuwa</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Modules List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 px-1">Módulos de Formação</h3>
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => {
                setSelectedModule(mod);
                resetQuiz();
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                selectedModule?.id === mod.id
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  {mod.level}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">{mod.duration}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{mod.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{mod.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{mod.lessonsCount} lições práticas</span>
                <span className="text-emerald-700 font-bold">Aceder Conteúdo →</span>
              </div>
            </div>
          ))}

          {/* Offline Guide Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
            <span className="font-bold flex items-center space-x-1.5 text-emerald-400">
              <Download className="w-3.5 h-3.5" />
              <span>Kits Escolares para Baixar</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Materiais pedagógicos em PDF formatados para impressão em escolas e comunidades.
            </p>
            <button
              type="button"
              onClick={() =>
                exportToPDF({
                  title: 'Cartilha Escolar de Educacao Ambiental — ECO-MZ 360',
                  subtitle: 'Manual Pratico de Preservacao de Mangais, Florestas e Bacias Hidrograficas',
                  category: 'Educacao Ambiental',
                  region: 'Mocambique (Escolas & Comunidades)',
                  summary:
                    'Material didatico oficial para sensibilizacao de estudantes, professores e comites comunitarios sobre a protecao dos ecossistemas naturais de Mocambique.',
                  recommendations: [
                    'Proteger as raizes dos mangais contra o corte ilegal para lenha e carvao.',
                    'Preservar as matas ciliares nas margens dos rios para evitar a erosao e o assoreamento.',
                    'Separar os residuos solidos e evitar queimadas descontroladas nas epocas secas.'
                  ],
                  filename: 'cartilha-escolar-ambiental-ecomz360.pdf'
                })
              }
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
            >
              Descarregar Cartilha Escolar (PDF)
            </button>
          </div>
        </div>

        {/* Selected Module Detail & Interactive Quiz */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          {selectedModule && (
            <div>
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Nível: {selectedModule.level}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedModule.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedModule.description}</p>
              </div>

              {/* Module Infographic / Illustration */}
              <div className="my-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 bg-slate-900 flex items-center justify-center">
                <img
                  src={selectedModule.id === 'edu-002' ? '/assets/img/eco/poluicao_rios.jpg' : '/assets/img/eco/mangais.jpg'}
                  alt={selectedModule.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold">
                    {selectedModule.id === 'edu-002'
                      ? 'Ilustração: Proteção das Bacias Hidrográficas e Matas Ciliares em Moçambique'
                      : 'Ilustração: Ecossistema de Mangais e Defesa Costeira em Sofala e Zambézia'}
                  </span>
                </div>
              </div>

              {/* Interactive Evaluation / Quiz */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Teste Rápido de Conhecimento e Certificação</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pergunta {activeQuizStep + 1} de {sampleQuiz.length}
                  </span>
                </div>

                {!quizFinished ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-800">
                      {sampleQuiz[activeQuizStep].question}
                    </p>

                    <div className="space-y-2">
                      {sampleQuiz[activeQuizStep].options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedAnswer(i)}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                            selectedAnswer === i
                              ? 'bg-emerald-100/70 border-emerald-500 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                        className={`px-4 py-2 rounded-lg text-xs font-bold ${
                          selectedAnswer !== null
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {activeQuizStep + 1 === sampleQuiz.length ? 'Finalizar Teste' : 'Próxima Questão'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">
                      Parabéns! Obteve {quizScore} de {sampleQuiz.length} respostas corretas ({Math.round((quizScore / sampleQuiz.length) * 100)}%)
                    </h5>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      O seu aproveitamento atesta a aptidão básica em gestão de ecossistemas moçambicanos.
                    </p>

                    {certificateGenerated ? (
                      <div className="p-4 bg-white rounded-xl border border-emerald-400 text-left max-w-md mx-auto shadow-xs space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>REPÚBLICA DE MOÇAMBIQUE • ECO-MZ 360</span>
                          <span>CERT-2026-EDU-{Math.floor(1000 + Math.random() * 9000)}</span>
                        </div>
                        <h6 className="text-xs font-bold text-emerald-900 text-center uppercase tracking-wider">
                          Certificado de Conclusão Ecológica
                        </h6>
                        <p className="text-[11px] text-slate-700 text-center">
                          Confere-se o presente certificado por conclusão com distinção do módulo <strong>{selectedModule.title}</strong>.
                        </p>
                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100">
                          <span>Emitido em: {new Date().toLocaleDateString('pt-MZ')}</span>
                          <span className="font-bold text-emerald-700">Válido Nacionalmente</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            exportToPDF({
                              title: 'Certificado de Conclusao Ecologica — ECO-MZ 360',
                              subtitle: `Modulo Concluido: ${selectedModule.title}`,
                              category: 'Certificacao Cidada',
                              region: 'Republica de Mocambique',
                              summary: `Confere-se o presente certificado de participacao e aproveitamento pedagogico (${Math.round(
                                (quizScore / sampleQuiz.length) * 100
                              )}%) na Academia Ambiental ECO-MZ 360.`,
                              metrics: [
                                { label: 'Modulo Formativo', value: selectedModule.title },
                                { label: 'Pontuacao Obtida', value: `${quizScore} / ${sampleQuiz.length}` },
                                { label: 'Validade', value: 'Nacional (ECO-EDU)' }
                              ],
                              filename: 'certificado-conclusao-ecologica.pdf'
                            })
                          }
                          className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Exportar Certificado (PDF)</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCertificateGenerated(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                      >
                        Emitir Certificado Digital
                      </button>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={resetQuiz}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        Repetir Avaliação
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

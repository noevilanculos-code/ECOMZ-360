import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  Trash2,
  LogIn,
  LogOut,
  Send,
  HelpCircle,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  WORKSPACE_SCOPES
} from '../lib/googleAuth';
import {
  GoogleDriveFormFile,
  GoogleFormDetails,
  GoogleFormResponsesList,
  listUserForms,
  getFormDetails,
  getFormResponses,
  createGoogleForm,
  addQuestionsToForm
} from '../lib/googleFormsApi';

export const EcoForms: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [formsList, setFormsList] = useState<GoogleDriveFormFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Form for Details & Responses
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormDetails, setSelectedFormDetails] = useState<GoogleFormDetails | null>(null);
  const [selectedFormResponses, setSelectedFormResponses] = useState<GoogleFormResponsesList | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New Form Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState<
    {
      title: string;
      description?: string;
      type: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'PARAGRAPH';
      options?: string[];
      required?: boolean;
    }[]
  >([]);

  // Environmental Templates
  const templates = [
    {
      id: 'queimadas',
      name: 'Inquérito de Queimadas no Miombo (Niassa / Tete / Manica)',
      description: 'Mapeamento comunitário de focos de queimada de machambas e proteção de aldeias.',
      title: 'ECO-MZ: Inquérito Comunitário sobre Queimadas Descontroladas',
      intro: 'Questionário oficial do programa de prevenção de queimadas comunitárias da plataforma ECO-MZ 360.',
      questions: [
        {
          title: 'Qual é a sua Província e Distrito?',
          type: 'RADIO' as const,
          options: ['Niassa (Lichinga / Marrupa)', 'Tete (Moatize / Angónia)', 'Manica (Gondola / Sussundenga)', 'Outro'],
          required: true
        },
        {
          title: 'Com que frequência observou focos de queimada não controlada nos últimos 30 dias?',
          type: 'RADIO' as const,
          options: ['Diariamente', '2 a 3 vezes por semana', 'Raramente', 'Nenhuma vez'],
          required: true
        },
        {
          title: 'A sua comunidade aplica faixas corta-fogo ao redor das machambas antes da queima?',
          type: 'RADIO' as const,
          options: ['Sim, sempre', 'Na maioria das vezes', 'Raramente', 'Não, desconhecemos a técnica'],
          required: true
        },
        {
          title: 'Quais as medidas prioritárias necessárias para apoiar a sua aldeia?',
          type: 'CHECKBOX' as const,
          options: [
            'Ferramentas corta-fogo e abafadores',
            'Treinamento de brigadistas voluntários',
            'Sistemas de alerta rápido por rádio comunitária',
            'Apoio com sementes e alternativas ao corte e queima'
          ],
          required: true
        },
        {
          title: 'Observações adicionais ou denúncia de focos ativos:',
          type: 'PARAGRAPH' as const,
          required: false
        }
      ]
    },
    {
      id: 'mangais',
      name: 'Censo de Restauração de Mangais e Pesca (Sofala / Zambézia)',
      description: 'Avaliação de regeneração costeira e benefícios para as comunidades de pesca artesanal.',
      title: 'ECO-MZ: Censo de Restauração de Mangais e Pesca Artesanal',
      intro: 'Inquérito integrado para avaliar a saúde dos estuários e o retorno de peixes e caranguejos.',
      questions: [
        {
          title: 'Qual é o seu setor costeiro?',
          type: 'RADIO' as const,
          options: ['Sofala (Beira / Búzi / Dondo)', 'Zambézia (Quelimane / Chinde)', 'Nampula (Angoche / Ilha de Moçambique)', 'Outro'],
          required: true
        },
        {
          title: 'Notou corte ilegal recente de mangleiros na sua zona?',
          type: 'RADIO' as const,
          options: ['Sim, para produção de carvão/estacas', 'Sim, para expansão de salinas/habitação', 'Não, a área está protegida', 'Não sei responder'],
          required: true
        },
        {
          title: 'Como avalia a abundância de peixe e camarão nos últimos 12 meses?',
          type: 'RADIO' as const,
          options: ['Aumentou após o replantio', 'Estável', 'Diminuiu acentuadamente', 'Não pesco'],
          required: true
        },
        {
          title: 'Gostaria de participar no próximo mutirão de plantio de propágulos?',
          type: 'RADIO' as const,
          options: ['Sim, como voluntário ativo', 'Sim, como líder comunitário', 'Apenas receber informações', 'Não posso no momento'],
          required: true
        }
      ]
    },
    {
      id: 'residuos',
      name: 'Avaliação de Resíduos e Plásticos Urbanos (Maputo / Beira / Nampula)',
      description: 'Diagnóstico de coleta seletiva, depósitos clandestinos e reciclagem nas autarquias.',
      title: 'ECO-MZ: Diagnóstico Autárquico de Gestão de Resíduos Sólidos',
      intro: 'Inquérito de satisfação e hábitos de descarte de plásticos para subsidiar planos municipais.',
      questions: [
        {
          title: 'Qual é o seu município de residência?',
          type: 'RADIO' as const,
          options: ['Maputo Cidade', 'Matola', 'Beira', 'Nampula', 'Outro'],
          required: true
        },
        {
          title: 'Com que regularidade o camião de lixo recolhe resíduos no seu bairro?',
          type: 'RADIO' as const,
          options: ['Diariamente', '2 a 3 vezes por semana', 'Semanalmente', 'Raramente / Nunca'],
          required: true
        },
        {
          title: 'Faz separação de materiais recicláveis (plástico, vidro, papelão)?',
          type: 'RADIO' as const,
          options: ['Sim, separo e entrego a catadores/ecopontos', 'Gostaria, mas não há pontos de entrega', 'Não separo'],
          required: true
        },
        {
          title: 'Descreva pontos críticos de lixeiras clandestinas no seu bairro:',
          type: 'PARAGRAPH' as const,
          required: false
        }
      ]
    }
  ];

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, userToken) => {
        setUser(authedUser);
        setToken(userToken);
        loadForms(userToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFormsList([]);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadForms = async (accessToken?: string) => {
    const t = accessToken || token;
    if (!t) return;
    setLoadingForms(true);
    setErrorMsg(null);
    try {
      const files = await listUserForms(t);
      setFormsList(files);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao carregar formulários.');
    } finally {
      setLoadingForms(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadForms(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao autenticar com a Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setFormsList([]);
    setSelectedFormId(null);
    setSelectedFormDetails(null);
    setSelectedFormResponses(null);
  };

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    setFormTitle(tmpl.title);
    setFormDescription(tmpl.intro);
    setQuestions(tmpl.questions);
    setShowCreateModal(true);
  };

  const handleOpenBlankCreate = () => {
    setFormTitle('Inquérito Ambiental Comunitário - Moçambique');
    setFormDescription('Formulário de recolha de dados para proteção ambiental e participação cívica.');
    setQuestions([
      {
        title: 'Nome ou Aldeia / Bairro:',
        type: 'TEXT',
        required: true
      },
      {
        title: 'Qual a principal agressão ambiental observada na sua área?',
        type: 'RADIO',
        options: ['Desmatamento Ilegal', 'Queimada Descontrolada', 'Poluição da Água', 'Erosão Costeira', 'Lixo a Céu Aberto'],
        required: true
      },
      {
        title: 'Propostas de melhoria ou observações:',
        type: 'PARAGRAPH',
        required: false
      }
    ]);
    setShowCreateModal(true);
  };

  // Explicit Confirmation before creating/mutating Form (Skill requirement)
  const handleInitiateCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg('Por favor defina o título do formulário.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteCreateForm = async () => {
    if (!token) return;
    setIsCreatingForm(true);
    setErrorMsg(null);
    setShowConfirmModal(false);

    try {
      // 1. Create form
      const created = await createGoogleForm(token, formTitle.trim());

      // 2. Add description and questions via batchUpdate
      if (questions.length > 0 || formDescription) {
        await addQuestionsToForm(token, created.formId, formDescription.trim(), questions);
      }

      setSuccessMsg(`Formulário "${formTitle}" criado com sucesso no seu Google Forms!`);
      setShowCreateModal(false);
      setTimeout(() => setSuccessMsg(null), 5000);

      // Refresh forms list
      await loadForms(token);

      // Automatically inspect the newly created form
      await handleSelectForm(created.formId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao criar formulário no Google Forms.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleSelectForm = async (formId: string) => {
    if (!token) return;
    setSelectedFormId(formId);
    setLoadingDetails(true);
    setSelectedFormDetails(null);
    setSelectedFormResponses(null);

    try {
      const [details, responses] = await Promise.all([
        getFormDetails(token, formId).catch((err) => {
          console.warn('Could not fetch form details:', err);
          return null;
        }),
        getFormResponses(token, formId).catch((err) => {
          console.warn('Could not fetch form responses:', err);
          return null;
        })
      ]);

      setSelectedFormDetails(details);
      setSelectedFormResponses(responses);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao carregar dados do formulário.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Forms • Inquéritos Ambientais de Moçambique</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Integração com Google Forms & Pesquisas Comunitárias
          </h2>
          <p className="text-xs text-slate-500">
            Crie questionários ambientais diretamente na sua conta Google, distribua para comunidades rurais e monitore respostas em tempo real.
          </p>
        </div>

        {/* Auth status & Official Google Sign-in button */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Utilizador'}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left text-xs pr-2 hidden sm:block">
                <p className="font-bold text-slate-900 leading-tight">
                  {user.displayName || 'Conta Google'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Terminar Sessão Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button format */
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center space-x-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-xs text-slate-700 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'A conectar à Google...' : 'Entrar com a Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Aviso do Google Forms:</p>
            <p>{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="font-medium flex-1">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Unauthenticated Guide or Main Interface */}
      {!user ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Conecte a sua Conta Google para Aceder ao Google Forms
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Com a autorização do utilizador, a plataforma ECO-MZ 360 pode criar inquéritos
              ambientais no seu Google Drive, recolher respostas de brigadistas e analisar a percepção ecológica das comunidades.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google Forms Agora</span>
            </button>
          </div>

          {/* Scopes Transparency info */}
          <div className="pt-6 border-t border-slate-100 max-w-lg mx-auto text-left text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Permissões Utilizadas (Google Workspace):</span>
            </span>
            <p>• Criar e editar formulários no Google Forms (forms.body)</p>
            <p>• Ler respostas enviadas pelos cidadãos (forms.responses.readonly)</p>
            <p>• Localizar inquéritos de pesquisa no seu Google Drive (drive.file)</p>
          </div>
        </div>
      ) : (
        /* Authenticated Main Dashboard */
        <div className="space-y-6">
          {/* Quick Actions & Templates */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  Modelos Prontos • Moçambique
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Lançar Novo Inquérito no Google Forms
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOpenBlankCreate}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Criar Inquérito Personalizado</span>
                </button>
                <button
                  onClick={() => loadForms()}
                  disabled={loadingForms}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Atualizar lista de formulários"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingForms ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-lg cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-300">
                      {tmpl.questions.length} perguntas formatadas
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-200">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 pt-1">
                    <span>Usar Modelo</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Split View: Forms in Drive vs Details/Responses */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Forms in Drive */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Formulários no seu Google Drive ({formsList.length})</span>
                </h3>
                {loadingForms && (
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>A carregar...</span>
                  </span>
                )}
              </div>

              {formsList.length === 0 && !loadingForms ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Ainda não possui formulários do Google Forms no seu Google Drive.
                  </p>
                  <button
                    onClick={handleOpenBlankCreate}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    + Criar o seu primeiro formulário agora
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {formsList.map((form) => {
                    const isSelected = selectedFormId === form.id;
                    return (
                      <div
                        key={form.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            onClick={() => handleSelectForm(form.id)}
                            className="cursor-pointer flex-1"
                          >
                            <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-emerald-700">
                              {form.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Modificado:{' '}
                                {new Date(form.modifiedTime).toLocaleDateString('pt-MZ', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </p>
                          </div>

                          {form.webViewLink && (
                            <a
                              href={form.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Abrir no editor Google Forms"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <button
                            onClick={() => handleSelectForm(form.id)}
                            className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>{isSelected ? 'A Inspecionar' : 'Ver Respostas & Perguntas'}</span>
                          </button>

                          <a
                            href={`https://docs.google.com/forms/d/${form.id}/viewform`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-slate-900 flex items-center space-x-1 font-medium"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Link Responder</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form Inspection & Responses Panel */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              {loadingDetails ? (
                <div className="py-20 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    A carregar dados do formulário e respostas via API do Google Forms...
                  </p>
                </div>
              ) : selectedFormId && selectedFormDetails ? (
                <div className="space-y-5">
                  {/* Selected Form Header */}
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Formulário Selecionado
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {selectedFormDetails.info.title}
                      </h3>
                      {selectedFormDetails.info.description && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {selectedFormDetails.info.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://docs.google.com/forms/d/${selectedFormId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir no Google Forms</span>
                      </a>
                    </div>
                  </div>

                  {/* Responses Counter & Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Total de Respostas
                      </span>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {selectedFormResponses?.responses?.length || 0}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Perguntas Cadastradas
                      </span>
                      <p className="text-2xl font-black text-emerald-700 mt-0.5">
                        {selectedFormDetails.items?.length || 0}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Estado do Inquérito
                      </span>
                      <p className="text-xs font-bold text-emerald-800 mt-2 flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A Aceitar Respostas</span>
                      </p>
                    </div>
                  </div>

                  {/* Questions Preview in Form */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">
                      Perguntas do Questionário ({selectedFormDetails.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {selectedFormDetails.items && selectedFormDetails.items.length > 0 ? (
                        selectedFormDetails.items.map((item, idx) => (
                          <div
                            key={item.itemId || idx}
                            className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                {idx + 1}. {item.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.questionItem?.question.choiceQuestion ? 'Múltipla Escolha' : 'Texto Aberto'}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-slate-500">{item.description}</p>
                            )}
                            {item.questionItem?.question.choiceQuestion?.options && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.questionItem.question.choiceQuestion.options.map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className="px-2 py-0.5 bg-white text-slate-700 text-[10px] rounded border border-slate-200"
                                  >
                                    ○ {opt.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Formulário sem perguntas configuradas ainda.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submissions List if available */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Submissões Recentes Registadas ({selectedFormResponses?.responses?.length || 0})
                    </h4>

                    {selectedFormResponses?.responses && selectedFormResponses.responses.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedFormResponses.responses.map((sub, sIdx) => (
                          <div
                            key={sub.responseId || sIdx}
                            className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-500 text-[10px]">
                              <span>
                                Respondente: <strong>{sub.respondentEmail || 'Anónimo'}</strong>
                              </span>
                              <span>
                                Data:{' '}
                                {new Date(sub.lastSubmittedTime || sub.createTime).toLocaleString(
                                  'pt-MZ'
                                )}
                              </span>
                            </div>
                            {sub.answers && (
                              <div className="pt-1 text-[11px] text-slate-700 space-y-0.5">
                                {Object.entries(sub.answers).map(([qId, ans]) => (
                                  <p key={qId} className="truncate">
                                    • Resposta:{' '}
                                    <span className="font-semibold text-slate-900">
                                      {ans.textAnswers?.answers?.map((a) => a.value).join(', ') ||
                                        'Sem texto'}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                        Nenhuma resposta submetida até ao momento. Partilhe o link do formulário com a sua comunidade!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center space-y-2">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">Nenhum Formulário Selecionado</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Selecione um formulário na lista à esquerda ou utilize um dos modelos rápidos para criar um novo inquérito comunitário.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold">Criar Inquérito no Google Forms</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInitiateCreate} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Formulário *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição / Instruções</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Perguntas a Incluir ({questions.length})</label>
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions([
                        ...questions,
                        {
                          title: 'Nova Questão Ambiental',
                          type: 'RADIO',
                          options: ['Sim', 'Não', 'Em Avaliação'],
                          required: true
                        }
                      ])
                    }
                    className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Adicionar Pergunta</span>
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-500 text-[11px]">Pergunta #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600"
                        title="Remover pergunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enunciado da pergunta..."
                      value={q.title}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].title = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                    />

                    <div className="flex items-center space-x-2">
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].type = e.target.value as any;
                          setQuestions(updated);
                        }}
                        className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                      >
                        <option value="RADIO">Múltipla Escolha (Opção Única)</option>
                        <option value="CHECKBOX">Caixas de Seleção (Múltiplas)</option>
                        <option value="TEXT">Resposta Curta</option>
                        <option value="PARAGRAPH">Parágrafo Longo</option>
                      </select>

                      <label className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={q.required !== false}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].required = e.target.checked;
                            setQuestions(updated);
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span>Obrigatória</span>
                      </label>
                    </div>

                    {(q.type === 'RADIO' || q.type === 'CHECKBOX') && (
                      <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                        <span className="block font-semibold">Opções (separadas por vírgula):</span>
                        <input
                          type="text"
                          value={(q.options || []).join(', ')}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].options = e.target.value.split(',').map((s) => s.trim());
                            setQuestions(updated);
                          }}
                          placeholder="Opção 1, Opção 2, Opção 3"
                          className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5"
                >
                  <span>Avançar para Confirmação</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before Workspace Mutation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Criação no Google Forms
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja criar um novo formulário intitulado <strong>"{formTitle}"</strong> com{' '}
              <strong>{questions.length}</strong> perguntas no seu Google Drive com a conta{' '}
              <strong>{user?.email}</strong>?
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-0.5">
              <p>• O formulário será criado através da API oficial do Google Forms.</p>
              <p>• Poderá partilhar o link de resposta e visualizar as submissões a qualquer momento.</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={isCreatingForm}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isCreatingForm}
                onClick={handleExecuteCreateForm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                {isCreatingForm ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>A Criar na Google...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmar e Criar Formulário</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

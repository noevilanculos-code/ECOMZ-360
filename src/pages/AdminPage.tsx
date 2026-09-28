import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  MapPin,
  Layers,
  Settings,
  FileCheck,
  Database,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  Download,
  Upload,
  RefreshCw,
  X,
  Trash2,
  Edit,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { occurrences, projects, registeredUsers, reviewRegisteredUser, canManageUsers } = useApp();
  const [activeSubModule, setActiveSubModule] = useState<
    null | 'utilizadores' | 'localidades' | 'categorias' | 'config' | 'logs' | 'backup'
  >(null);

  const [notification, setNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!canManageUsers) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        Esta área está disponível apenas para contas administrativas autorizadas.
      </div>
    );
  }

  const adminModules = [
    {
      id: 'utilizadores',
      title: 'Utilizadores',
      desc: 'Gerir contas de utilizadores, perfis de acesso e permissões no sistema.',
      icon: Users,
      iconColor: 'bg-emerald-50 text-[#00A651] dark:bg-emerald-950/60 dark:text-emerald-400',
      btnPrimary: true,
      checklist: [
        'Adicionar e editar utilizadores',
        'Definir perfis e permissões',
        'Acompanhar atividade dos utilizadores'
      ],
      btnText: 'Gerir Utilizadores'
    },
    {
      id: 'localidades',
      title: 'Localidades',
      desc: 'Gerir regiões, distritos e áreas geográficas para organização dos dados e ocorrências.',
      icon: MapPin,
      iconColor: 'bg-blue-50 text-[#1687E8] dark:bg-blue-950/60 dark:text-blue-400',
      btnPrimary: false,
      checklist: [
        'Adicionar e editar localidades',
        'Configurar regiões e distritos',
        'Associar dados geográficos'
      ],
      btnText: 'Gerir Localidades'
    },
    {
      id: 'categorias',
      title: 'Categorias',
      desc: 'Gerir categorias de ocorrências, projetos e classificações ambientais.',
      icon: Layers,
      iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      btnPrimary: false,
      checklist: [
        'Criar e editar categorias',
        'Definir ícones e cores',
        'Configurar subcategorias'
      ],
      btnText: 'Gerir Categorias'
    },
    {
      id: 'config',
      title: 'Configurações',
      desc: 'Ajustar parâmetros gerais da plataforma, notificações e integrações.',
      icon: Settings,
      iconColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      btnPrimary: false,
      checklist: [
        'Configurações do sistema',
        'Notificações e alertas',
        'Integrações externas'
      ],
      btnText: 'Ajustar Configurações'
    },
    {
      id: 'logs',
      title: 'Logs de Auditoria',
      desc: 'Visualizar o histórico de ações e alterações realizadas no sistema.',
      icon: FileCheck,
      iconColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      btnPrimary: false,
      checklist: [
        'Registo de acessos e ações',
        'Filtros por utilizador e período',
        'Exportar relatórios de auditoria'
      ],
      btnText: 'Ver Logs'
    },
    {
      id: 'backup',
      title: 'Backup',
      desc: 'Gerir cópias de segurança do sistema e dos dados.',
      icon: Database,
      iconColor: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
      btnPrimary: false,
      checklist: [
        'Executar backup manual',
        'Agendar backups automáticos',
        'Restaurar dados'
      ],
      btnText: 'Gerir Backup'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#07364A] border border-[#0a4861] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#00B956]" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#00B956]">
                Sistema ECO-MZ 360
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Administração
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Gerir utilizadores, localidades, categorias, configurações e toda a operação da plataforma.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-[#07364A]/80 px-4 py-2.5 rounded-2xl border border-[#0a4861]">
            <span>Gestão eficiente para um ambiente mais sustentável</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3x2 Matrix of Administrative Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Icon and Title */}
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl ${module.iconColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {module.title}
                  </h3>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {module.desc}
                </p>

                {/* Checklist with Green Checkmarks */}
                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {module.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00A651] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button matching 08_DESKTOP_ADMINISTRACAO.png */}
              <div className="pt-6 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (module.id === 'config') {
                      navigate('/configuracoes');
                    } else {
                      setActiveSubModule(module.id as any);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98 ${
                    module.btnPrimary
                      ? 'bg-[#00A651] hover:bg-[#008f45] text-white shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/60 text-[#1687E8] hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  }`}
                >
                  <span>{module.btnText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-Module Management Modal */}
      {activeSubModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00A651]" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
                  Gestão Central — {activeSubModule}
                </h3>
              </div>
              <button
                onClick={() => setActiveSubModule(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Utilizadores Content */}
            {activeSubModule === 'utilizadores' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    {registeredUsers.filter((record) => record.approvalStatus === 'pending').length} pedidos aguardam confirmação
                  </span>
                  <button
                    onClick={() => triggerToast('Novo utilizador institucional adicionado à fila de validação.')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Utilizador</span>
                  </button>
                </div>
                {registeredUsers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700">
                    Ainda não há contas registadas para rever neste navegador.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {registeredUsers.map((record) => {
                      const roleLabels: Record<string, string> = {
                        cidadao: 'Cidadão',
                        tecnico: 'Inspector Técnico',
                        gestor: 'Gestor de Projetos',
                        instituicao: 'Instituição Parceira',
                        admin: 'Administrador'
                      };
                      const statusLabels = {
                        pending: 'Pendente',
                        approved: 'Aprovado',
                        rejected: 'Rejeitado'
                      };
                      const statusClasses = {
                        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                        rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      };

                      return (
                        <div key={record.profile.email} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 font-bold text-slate-900 dark:text-white">
                              <span>{record.profile.name}</span>
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                {roleLabels[record.role]}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusClasses[record.approvalStatus]}`}>
                                {statusLabels[record.approvalStatus]}
                              </span>
                            </div>
                            <div className="mt-1 break-all text-slate-500 dark:text-slate-400">{record.profile.email}</div>
                            <div className="mt-1 text-[10px] text-slate-400">
                              Pedido em {new Date(record.requestedAt).toLocaleDateString('pt-MZ')}
                            </div>
                          </div>
                          {record.approvalStatus === 'pending' && record.role !== 'cidadao' && (
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  reviewRegisteredUser(record.profile.email, 'approved');
                                  triggerToast(`Perfil de ${record.profile.name} aprovado.`);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Aprovar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  reviewRegisteredUser(record.profile.email, 'rejected');
                                  triggerToast(`Pedido de ${record.profile.name} rejeitado.`);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                              >
                                <X className="h-4 w-4" /> Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Localidades Content */}
            {activeSubModule === 'localidades' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">11 Províncias e 154 Distritos configurados no ECO-MZ 360:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.values(MOZAMBIQUE_PROVINCES).map((prov) => (
                    <div key={prov.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                      <div className="font-bold text-slate-800 dark:text-white">{prov.name}</div>
                      <div className="text-[11px] text-slate-400">Capital: {prov.capital} | Pop: {prov.population}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorias Content */}
            {activeSubModule === 'categorias' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">8 Categorias Ambientais da Lei 20/97:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Desmatamento e Abate Ilegal',
                    'Queimadas Descontroladas',
                    'Poluição Hídrica e Rios',
                    'Erosão Costeira e Pluvial',
                    'Resíduos Sólidos Urbanos',
                    'Destruição de Mangais',
                    'Caça Furtiva & Biodiversidade',
                    'Mineração Ilegal Fluvial'
                  ].map((c) => (
                    <div key={c} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-200/60 dark:border-slate-700 font-bold text-slate-800 dark:text-white">
                      ✓ {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs Content */}
            {activeSubModule === 'logs' && (
              <div className="space-y-2 text-xs">
                {[
                  { time: 'Hoje 10:24', user: 'Noé Samuel', action: 'Validação da ocorrência ECO-001 (Rio Inhampué)' },
                  { time: 'Hoje 09:17', user: 'Elias Mufunde', action: 'Atualização do progresso do Projeto PROJ-001 (68%)' },
                  { time: 'Ontem 18:30', user: 'Sistema Automático', action: 'Geração de backup institucional v1.1.0' }
                ].map((l, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{l.action}</div>
                      <div className="text-slate-400">{l.user}</div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{l.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Backup Content */}
            {activeSubModule === 'backup' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">Último Backup do Banco de Dados</div>
                  <div className="text-slate-400">Realizado hoje às 04:00 UTC (Tamanho: 48.2 MB)</div>
                  <button
                    onClick={() => triggerToast('Backup manual iniciado com sucesso!')}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                  >
                    Executar Backup Agora
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveSubModule(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

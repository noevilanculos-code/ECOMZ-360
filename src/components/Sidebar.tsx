import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  AlertTriangle,
  FolderKanban,
  FlaskConical,
  Bell,
  Newspaper,
  Megaphone,
  Activity,
  FileText,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Sparkles,
  Database,
  Cpu,
  HeartHandshake,
  DollarSign,
  Award,
  GraduationCap,
  MessageSquare,
  Package,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type MainNavTab =
  | 'dashboard'
  | 'mapa'
  | 'ocorrencias'
  | 'projetos'
  | 'simulacoes'
  | 'alertas'
  | 'noticias'
  | 'avisos'
  | 'ecopulse'
  | 'relatorios'
  | 'configuracoes'
  | 'administracao'
  | 'perfil'
  | 'ecobot'
  | 'educacao'
  | 'voluntariado'
  | 'fundos'
  | 'certificacao'
  | 'forum'
  | 'recursos-comunitarios'
  | 'api-docs'
  | 'modo-offline'
  | 'auditoria-dados'
  | 'diagnostico';

interface SidebarProps {
  activeTab: MainNavTab | string;
  onSelectTab: (tab: MainNavTab) => void;
  urgentAlertCount?: number;
  onOpenMobileViewer?: () => void;
  onOpenEcoBot?: () => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  urgentAlertCount = 3,
  onOpenMobileViewer,
  onOpenEcoBot,
  isMobileMenuOpen = false,
  onCloseMobileMenu
}) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, activeRole, setActiveRole } = useApp();

  // Filter management tools based on user profile so citizens and other roles have a clean, focused experience
  type ManagementItemType = {
    id: MainNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    roles?: string[];
  };

  const rawManagementItems: ManagementItemType[] = [
    { id: 'diagnostico', label: 'Níveis de Risco Territorial', icon: Cpu, roles: ['tecnico', 'gestor', 'instituicao', 'admin'] },
    { id: 'simulacoes', label: 'Cenários & Impacto Ambiental', icon: FlaskConical, roles: ['tecnico', 'gestor', 'instituicao', 'admin'] },
    { id: 'relatorios', label: 'Relatórios Oficiais (jsPDF)', icon: FileText, roles: ['tecnico', 'instituicao', 'gestor', 'admin'] },
    { id: 'auditoria-dados', label: 'Histórico & Auditoria', icon: Database, roles: ['tecnico', 'gestor', 'admin'] },
    { id: 'administracao', label: 'Administração do Sistema', icon: ShieldCheck, roles: ['admin'] },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'configuracoes', label: 'Preferências', icon: Settings }
  ];

  const managementItems: ManagementItemType[] = rawManagementItems.filter(
    (item) => !item.roles || item.roles.includes(activeRole)
  );

  const navGroups: Array<{
    groupTitle: string;
    items: Array<{
      id: MainNavTab;
      label: string;
      icon: React.ElementType;
      badge?: string | number;
      badgeColor?: string;
    }>;
  }> = [
    {
      groupTitle: 'Acesso Principal',
      items: [
        { id: 'dashboard', label: 'Início', icon: Home },
        { id: 'mapa', label: 'Mapa Ambiental', icon: MapPin },
        { id: 'ocorrencias', label: activeRole === 'cidadao' ? 'Fazer Denúncia / Ocorrências' : 'Denúncias & Ocorrências', icon: AlertTriangle },
        { id: 'alertas', label: 'Alertas de Emergência', icon: Bell, badge: urgentAlertCount, badgeColor: 'bg-rose-500 text-white' },
        { id: 'ecopulse', label: 'Acontecimentos Recentes', icon: Activity }
      ]
    },
    {
      groupTitle: 'Participação & Comunidade',
      items: [
        { id: 'recursos-comunitarios', label: 'Recursos Comunitários (Kits & Água)', icon: Package },
        { id: 'voluntariado', label: 'Voluntariado Comunitário', icon: HeartHandshake },
        { id: 'educacao', label: 'Educação Ambiental', icon: GraduationCap },
        { id: 'projetos', label: 'Projetos de Conservação', icon: FolderKanban },
        { id: 'forum', label: 'Comunidade & Debate', icon: MessageSquare },
        { id: 'fundos', label: 'Apoiar Iniciativas', icon: DollarSign },
        { id: 'certificacao', label: 'Selo Verde Moçambique', icon: Award }
      ]
    },
    {
      groupTitle: 'Informação & Ferramentas',
      items: [
        { id: 'noticias', label: 'Notícias Ambientais', icon: Newspaper },
        { id: 'avisos', label: 'Comunicados Oficiais', icon: Megaphone },
        { id: 'ecobot', label: 'Assistente Ambiental', icon: Sparkles }
      ]
    },
    {
      groupTitle: activeRole === 'cidadao' ? 'Minha Conta & Documentos' : 'Gestão & Acompanhamento',
      items: managementItems
    }
  ];

  const handleTabClick = (tab: MainNavTab) => {
    onSelectTab(tab);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar Container - Deep Blue (#062B3D, #07364A) matching branding palette */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#062B3D] text-slate-200 flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-[#07364A] select-none`}
      >
        {/* Top: Logo & Branding - Prominent, bold and clearly visible */}
        <div className="p-4 sm:p-5 border-b border-[#07364A] bg-[#04202e]/60">
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => handleTabClick('dashboard')}
            title="ECO-MZ 360 - Início"
          >
            {/* Clean official emblem - Increased size for strong brand visibility */}
            <div className="relative shrink-0">
              <img
                src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                alt="ECO-MZ 360"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-105 transition-transform drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  ECO<span className="text-[#00B956]">-MZ</span>
                </span>
                <span className="text-xs font-bold text-slate-100 px-1.5 py-0.5 rounded bg-[#07364A] border border-[#0a4861] shadow-xs">
                  360
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1 truncate">
                Observatório Nacional
              </p>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A651] animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">Plataforma Ativa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#07364A]">
          {navGroups.map((group, gIdx) => (
            <div key={group.groupTitle} className={gIdx > 0 ? 'pt-3 border-t border-[#07364A]/70' : ''}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-item-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#00A651] text-white shadow-xs font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-[#07364A]/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300'
                          }`}
                        />
                        <span className="tracking-wide truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-black rounded-full leading-none shadow-xs shrink-0 ${
                            item.badgeColor || (isActive ? 'bg-white text-[#062B3D]' : 'bg-rose-500 text-white')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User Session & Quick Profile Action (100% Functional) */}
        <div className="p-3 border-t border-[#07364A] bg-[#04202e]">
          {isLoggedIn ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#062B3D] border border-[#0a4861]/80 hover:border-emerald-500/50 transition-colors">
              <button
                onClick={() => handleTabClick('perfil')}
                className="flex items-center space-x-2.5 min-w-0 flex-1 text-left group focus:outline-none"
                title="Abrir Meu Perfil"
              >
                <div className="w-8 h-8 rounded-lg bg-[#00A651]/20 border border-[#00A651]/40 flex items-center justify-center text-[#00B956] font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {user?.name || 'Gabinete Técnico'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.organization || 'MTA / INGD'}
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors shrink-0"
                title="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/login');
                if (onCloseMobileMenu) onCloseMobileMenu();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Aceder ao Sistema</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

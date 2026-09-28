import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Map,
  Newspaper,
  Briefcase,
  MoreHorizontal,
  AlertTriangle,
  FlaskConical,
  Bell,
  Megaphone,
  Activity,
  FileText,
  User,
  ShieldCheck,
  Settings,
  X,
  GraduationCap,
  HeartHandshake,
  DollarSign,
  Award,
  MessageSquare,
  Database,
  Cpu,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notices, activeRole } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const pathname = location.pathname;

  const isActive = (path: string) => {
    if (
      (path === '/inicio' || path === '/dashboard') &&
      (pathname === '/' || pathname === '/dashboard' || pathname === '/inicio' || pathname === '/mobile/dashboard' || pathname === '/mobile/inicio')
    ) {
      return true;
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Início', path: '/inicio', icon: Home },
    { label: 'Mapa', path: '/mapa', icon: Map },
    { label: 'Denunciar', path: '/ocorrencias', icon: AlertTriangle },
    { label: 'Projetos', path: '/projetos', icon: Briefcase }
  ];

  const allMoreItems: Array<{
    label: string;
    path: string;
    icon: React.ElementType;
    color: string;
    badge?: string;
    roles?: string[];
  }> = [
    { label: 'Alertas de Emergência', path: '/alertas', icon: Bell, color: 'text-rose-500', badge: '7' },
    { label: 'Recursos Comunitários (Kits & Água)', path: '/recursos-comunitarios', icon: Package, color: 'text-emerald-500' },
    { label: 'Educação Ambiental', path: '/educacao', icon: GraduationCap, color: 'text-emerald-500' },
    { label: 'Voluntariado Comunitário', path: '/voluntariado', icon: HeartHandshake, color: 'text-teal-500' },
    { label: 'Comunidade & Debate', path: '/forum', icon: MessageSquare, color: 'text-indigo-400' },
    { label: 'Apoiar Iniciativas', path: '/fundos', icon: DollarSign, color: 'text-green-500' },
    { label: 'Selo Verde Moçambique', path: '/certificacao', icon: Award, color: 'text-amber-400' },
    { label: 'Notícias Ambientais', path: '/noticias', icon: Newspaper, color: 'text-blue-500' },
    { label: 'Comunicados Oficiais', path: '/avisos', icon: Megaphone, color: 'text-blue-500' },
    { label: 'Acontecimentos Recentes', path: '/eco-pulse', icon: Activity, color: 'text-emerald-500' },
    { label: 'Relatórios & Boletins', path: '/relatorios', icon: FileText, color: 'text-cyan-500', roles: ['tecnico', 'gestor', 'instituicao', 'admin'] },
    { label: 'Níveis de Risco Territorial', path: '/diagnostico', icon: Cpu, color: 'text-rose-500', roles: ['tecnico', 'gestor', 'instituicao', 'admin'] },
    { label: 'Cenários & Impacto', path: '/simulacoes', icon: FlaskConical, color: 'text-purple-500', roles: ['gestor', 'instituicao', 'admin'] },
    { label: 'Histórico de Atividades', path: '/auditoria-dados', icon: Database, color: 'text-slate-400', roles: ['gestor', 'admin'] },
    { label: 'Administração', path: '/administracao', icon: ShieldCheck, color: 'text-emerald-600', roles: ['admin'] },
    { label: 'Meu Perfil', path: '/perfil', icon: User, color: 'text-indigo-500' },
    { label: 'Preferências', path: '/configuracoes', icon: Settings, color: 'text-slate-500' }
  ];

  const moreItems = allMoreItems.filter((item) => !item.roles || item.roles.includes(activeRole));

  const handleNav = (path: string) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Drawer / Modal "Mais" */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                  alt="ECO-MZ 360"
                  className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                    ECO-MZ 360
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                    Mais Módulos & Recursos
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isSelected = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      {item.badge && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full">
                          {item.badge} ativos
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Mobile & Tablet - Deep Blue navigation */}
      <nav
        aria-label="Navegação Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#062B3D] border-t border-[#07364A] px-3 py-2 flex items-center justify-around shadow-xl select-none safe-bottom"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                active
                  ? 'text-[#00B956] font-bold scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] mt-1" />}
            </button>
          );
        })}

        {/* Mais Tab Button */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isMoreMenuOpen
              ? 'text-[#00B956] font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight leading-none">Mais</span>
        </button>
      </nav>
    </>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe2,
  Users,
  Compass,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  TreePine,
  Bell,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  ClipboardList,
  Database,
  Search,
  Sun,
  Moon,
  Layers,
  Home,
  MessageSquare,
  Smartphone,
  DollarSign,
  Settings,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserRole, CycleStage } from '../types';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeCycleStage: CycleStage;
  setActiveCycleStage: (stage: CycleStage) => void;
  urgentAlertCount: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenSplash?: () => void;
  onOpenLogin?: () => void;
  onOpenProfile?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  activeCycleStage,
  setActiveCycleStage,
  urgentAlertCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenSplash,
  onOpenLogin,
  onOpenProfile,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Internal fallback if not controlled externally
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('ecomz_theme') === 'dark'
      );
    }
    return false;
  });

  const effectiveDarkMode = isDarkMode !== undefined ? isDarkMode : internalDarkMode;

  const handleToggleTheme = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      const next = !internalDarkMode;
      setInternalDarkMode(next);
      if (typeof window !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
          localStorage.setItem('ecomz_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          localStorage.setItem('ecomz_theme', 'light');
        }
      }
    }
  };

  const CYCLE_STAGES: CycleStage[] = [
    'OBSERVAR',
    'LOCALIZAR',
    'DIAGNOSTICAR',
    'SIMULAR',
    'PLANEAR',
    'EXECUTAR',
    'MONITORIZAR',
    'AVALIAR',
    'INFORMAR'
  ];

  const roleLabels: Record<UserRole, { label: string; desc: string; badge: string }> = {
    cidadao: { label: 'Cidadão', desc: 'Participação, reportes e voluntariado', badge: 'bg-emerald-100 text-emerald-800' },
    tecnico: { label: 'Técnico', desc: 'Validação de terreno e tarefas', badge: 'bg-blue-100 text-blue-800' },
    gestor: { label: 'Gestor', desc: 'Dashboards, metas e decisões', badge: 'bg-indigo-100 text-indigo-800' },
    instituicao: { label: 'Instituição', desc: 'Projetos, financiamento e Selo Verde', badge: 'bg-amber-100 text-amber-800' },
    admin: { label: 'Administrador', desc: 'Auditoria, utilizadores e API', badge: 'bg-purple-100 text-purple-800' }
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, badge: 'MOCKUP UI' },
    { id: 'territorio', label: 'Território & Mapa', icon: Globe2, badge: 'ECO-MAP' },
    { id: 'dados', label: 'Núcleo de Dados', icon: Database, badge: 'ECO-DATA' },
    { id: 'projetos', label: 'Ação & Projetos', icon: TreePine, badge: 'PROJETOS' },
    { id: 'analise', label: 'Diagnóstico & Simulação', icon: Cpu, badge: 'SIMULADOR' },
    { id: 'alertas', label: 'Alertas & Avisos', icon: ShieldAlert, badge: '3 Ativos', urgent: true },
    { id: 'participacao', label: 'Voluntariado & Selo', icon: Users, badge: 'COMUNIDADE' },
    { id: 'educacao', label: 'Educação & Fórum', icon: Compass, badge: 'ECO-EDU' },
    { id: 'ecobot', label: 'EcoBot Gemini', icon: Sparkles, badge: 'AI & MAPS' },
    { id: 'php-mysql', label: 'PHP & MySQL', icon: Database, badge: 'LAMP STACK' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top Banner: Cycle Indicator & Regional Context */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs px-4 py-1.5 hidden md:block dark:border-b dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-400">CICLO AMBIENTAL ECO-MZ:</span>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {CYCLE_STAGES.map((stage, idx) => {
                const isActive = activeCycleStage === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => setActiveCycleStage(stage)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}. {stage}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="text-slate-300 font-medium">Equipa: Noé Samuel (Líder) · Elias Mufunde · Roque Maurício · Joel Viano</span>
            <span className="h-3 w-px bg-slate-700"></span>
            <span>MTA & INGD Alinhado</span>
            <span className="h-3 w-px bg-slate-700"></span>
            <span className="inline-flex items-center text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
              Rede Nacional Ativa
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-4">
          {/* Logo & Brand - Prominent Official Size */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3.5 text-left focus:outline-none group"
            >
              <img
                src="/assets/img/imagens/logo/ECOMZ-LOGO-09.png"
                alt="ECO-MZ 360 Logo"
                className="h-14 sm:h-16 lg:h-18 w-auto max-w-[240px] sm:max-w-[300px] object-contain group-hover:scale-102 transition-transform drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO-09.svg';
                }}
              />
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-3.5 hidden lg:block">
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  ECO-MZ 360
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  Observação & Gestão Ambiental
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar (Matching Mockup 17_08_41 & 17_13_44) with Buscar Button */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-2">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar no sistema..."
                className="w-full pl-8 pr-18 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Buscar"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden 2xl:flex items-center space-x-0.5">
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.urgent && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] rounded-full font-bold animate-pulse">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Weather, Dark Mode, Alerts Bell, & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Weather & Time Widget (Exact text from mockup 17_13_44) */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-[11px] text-slate-600 dark:text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium">Seg, 26 de Maio de 2025 • 14:35</span>
            </div>

            {/* Theme Selector (Claro / Escuro / Sistema) */}
            <ThemeSelector />

            {/* Notification Bell with Badge 3 (From mockups) */}
            <button
              onClick={() => setActiveTab('alertas')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="3 Alertas Ativos no Sistema"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* User Profile Pill: Noé Samuel (Administrador) as in mockups */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-200 dark:ring-emerald-900 transition-all hover:scale-105"
                title="Abrir Perfil do Utilizador (Tela 11)"
              >
                NS
              </button>
              <div className="hidden sm:block text-left">
                <button
                  onClick={onOpenProfile}
                  className="text-xs font-bold text-slate-900 dark:text-white leading-tight hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors block text-left"
                  title="Abrir Perfil do Utilizador (Tela 11)"
                >
                  Noé Samuel
                </button>
                <div className="flex items-center space-x-1">
                  <select
                    id="role-select"
                    value={activeRole}
                    onChange={(e) => setActiveRole(e.target.value as UserRole)}
                    className="bg-transparent text-[10px] text-slate-500 dark:text-slate-400 font-semibold focus:outline-none cursor-pointer p-0"
                  >
                    <option value="admin">Administrador</option>
                    <option value="gestor">Gestor</option>
                    <option value="tecnico">Técnico</option>
                    <option value="cidadao">Cidadão</option>
                    <option value="instituicao">Instituição</option>
                  </select>
                </div>
              </div>

              {/* Admin Panel Gear Button (Tela 12) */}
              <button
                onClick={onOpenAdmin}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Painel de Administração Grade 2x3 (Tela 12)"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="2xl:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {/* Theme Selector in Mobile Menu */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Tema da Interface:
            </span>
            <ThemeSelector showLabel={true} />
          </div>

          <div className="py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mudar Etapa do Ciclo:</p>
            <div className="flex flex-wrap gap-1">
              {CYCLE_STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    setActiveCycleStage(stage);
                  }}
                  className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                    activeCycleStage === stage
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal leading-tight">{item.badge}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Mockup Screen Launchers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2">
            <button
              onClick={() => {
                onOpenSplash?.();
                setMobileMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium"
            >
              Tela 1 (Splash)
            </button>
            <button
              onClick={() => {
                onOpenLogin?.();
                setMobileMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium"
            >
              Tela 2 (Login)
            </button>
            <button
              onClick={() => {
                onOpenProfile?.();
                setMobileMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium"
            >
              Tela 11 (Perfil)
            </button>
            <button
              onClick={() => {
                onOpenAdmin?.();
                setMobileMenuOpen(false);
              }}
              className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-md font-bold"
            >
              Tela 12 (Admin)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

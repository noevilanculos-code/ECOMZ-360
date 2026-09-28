import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Menu,
  Sparkles,
  Shield,
  User,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '../types';
import { ThemeSelector } from './ThemeSelector';
import { useApp } from '../context/AppContext';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  onOpenEcoBot: () => void;
  onOpenAlerts: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  urgentAlertCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  onOpenEcoBot,
  onOpenAlerts,
  onOpenProfile,
  onOpenAdmin,
  onOpenLogin,
  activeRole,
  setActiveRole,
  isDarkMode,
  onToggleDarkMode,
  urgentAlertCount = 3
}) => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'MZ';

  const userShortName = user?.name
    ? user.name.split(' ').slice(0, 2).join(' ')
    : 'Utilizador';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ocorrencias?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button, Brand Badge & Search Field */}
        <div className="flex items-center space-x-3.5 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F5F8FA] dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Abrir Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Emblema Oficial com Tamanho Destacado */}
          <div className="flex items-center space-x-3 shrink-0 lg:hidden">
            <img
              src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
              alt="ECO-MZ 360"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
              }}
            />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-[#062B3D] dark:text-white tracking-tight leading-tight">
                ECO-MZ <span className="text-[#00A651]">360</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-tight hidden sm:inline">
                Observatório Nacional
              </span>
            </div>
          </div>

          {/* Search Bar with Search Button */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar no sistema..."
                className="w-full pl-10 pr-24 py-2 bg-[#F5F8FA] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] focus:bg-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Executar busca"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Notification Bell, User Profile, Dark Mode, Date Widget */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Notification Bell with Badge */}
          <button
            id="header-bell-button"
            onClick={onOpenAlerts}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Alertas Ambientais Urgentes"
            aria-label="Alertas"
          >
            <Bell className="w-4 h-4" />
            {urgentAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                {urgentAlertCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              id="header-user-profile-button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#062B3D] text-[#00B956] flex items-center justify-center font-bold text-xs ring-1 ring-[#07364A] shadow-2xs shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {userShortName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {user?.functionTitle || (activeRole === 'admin'
                    ? 'Administrador'
                    : activeRole === 'cidadao'
                    ? 'Cidadão Guardião'
                    : activeRole === 'tecnico'
                    ? 'Inspector AQUA'
                    : activeRole === 'gestor'
                    ? 'Gestor FNDS'
                    : 'Instituição / INGD')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Utilizador ECO-MZ 360'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || 'utilizador@example.invalid'}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {user?.role || activeRole}
                  </span>
                </div>

                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Alternar Papel de Acesso:
                  </p>
                  <select
                    value={activeRole}
                    onChange={(e) => setActiveRole(e.target.value as UserRole)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="admin">Administrador (MTA / Universal)</option>
                    <option value="gestor">Gestor Ambiental (FNDS)</option>
                    <option value="tecnico">Inspector Ambiental (AQUA)</option>
                    <option value="cidadao">Cidadão Guardião (Comunidade)</option>
                    <option value="instituicao">Instituição Parceira (INGD)</option>
                  </select>
                </div>

                <div className="py-1">
                  <button
                    onClick={onOpenProfile}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Meu Perfil</span>
                  </button>
                  {activeRole === 'admin' && (
                    <button
                      onClick={onOpenAdmin}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Painel de Administração</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={onOpenLogin}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector (Claro / Escuro / Sistema - Ícone Único Minimizador) */}
          <div className="inline-flex items-center">
            <ThemeSelector />
          </div>

          {/* Date & Time Widget (Seg, 26 de Maio de 2025 · 14:35) */}
          <div className="hidden xl:flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 shadow-2xs font-medium">
            <span>Seg, 26 de Maio de 2025 • 14:35</span>
          </div>
        </div>
      </div>
    </header>
  );
};

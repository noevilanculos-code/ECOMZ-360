import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ThemeSelectorProps {
  className?: string;
  variant?: 'icon' | 'compact' | 'segmented';
  showLabel?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showLabel = false
}) => {
  const { themeMode, setThemeMode, cycleThemeMode, isDarkMode } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Information based on current mode
  const currentConfig = {
    light: {
      label: 'Claro',
      nextLabel: 'Escuro',
      title: 'Tema Claro • Clique para alternar para Escuro (ou clique direito para menu)',
      icon: Sun,
      iconColor: 'text-amber-500 hover:text-amber-600',
      iconFill: 'fill-amber-500/20',
      badgeBg: 'bg-amber-500',
      buttonBg: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-300'
    },
    dark: {
      label: 'Escuro',
      nextLabel: 'Sistema',
      title: 'Tema Escuro • Clique para alternar para Sistema (ou clique direito para menu)',
      icon: Moon,
      iconColor: 'text-emerald-400 hover:text-emerald-300',
      iconFill: 'fill-emerald-400/20',
      badgeBg: 'bg-emerald-400',
      buttonBg: 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-emerald-300 shadow-2xs'
    },
    system: {
      label: 'Sistema',
      nextLabel: 'Claro',
      title: `Tema do Sistema (Automático: ${isDarkMode ? 'Escuro' : 'Claro'}) • Clique para alternar para Claro`,
      icon: Monitor,
      iconColor: 'text-sky-600 dark:text-sky-400 hover:text-sky-500',
      iconFill: 'fill-sky-500/20',
      badgeBg: 'bg-sky-500',
      buttonBg: 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-200/80 text-sky-700 dark:bg-slate-800/90 dark:border-slate-700 dark:text-sky-300'
    }
  }[themeMode];

  const IconComponent = currentConfig.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    cycleThemeMode();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu((prev) => !prev);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Single Minimized Icon Button */}
      <button
        type="button"
        id="theme-toggle-icon-btn"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`relative group flex items-center justify-center rounded-xl p-2 sm:p-2.5 transition-all duration-200 cursor-pointer border shadow-2xs ${currentConfig.buttonBg}`}
        title={currentConfig.title}
        aria-label={`Alternar tema: atualmente ${currentConfig.label}. Clique para mudar para ${currentConfig.nextLabel}.`}
      >
        {/* Single Varying Icon */}
        <IconComponent
          className={`w-4 h-4 transition-all duration-300 transform group-hover:scale-110 ${currentConfig.iconColor} ${currentConfig.iconFill}`}
        />

        {/* Micro Indicator Dot indicating active mode */}
        <span
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 transition-colors ${currentConfig.badgeBg}`}
          title={`Modo: ${currentConfig.label}`}
        />

        {/* Optional text badge when showLabel is true */}
        {showLabel && (
          <span className="ml-1.5 text-[11px] font-bold leading-none select-none pr-0.5">
            {currentConfig.label}
          </span>
        )}
      </button>

      {/* Quick Direct-Select Popover Menu (accessible via right-click) */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-44 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Selecione o Tema
          </div>

          <button
            type="button"
            onClick={() => {
              setThemeMode('light');
              setShowMenu(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              themeMode === 'light'
                ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Claro</span>
            </span>
            {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setThemeMode('dark');
              setShowMenu(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escuro</span>
            </span>
            {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setThemeMode('system');
              setShowMenu(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              themeMode === 'system'
                ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Monitor className="w-3.5 h-3.5 text-sky-500" />
              <span>Sistema</span>
            </span>
            {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-sky-500" />}
          </button>
        </div>
      )}
    </div>
  );
};

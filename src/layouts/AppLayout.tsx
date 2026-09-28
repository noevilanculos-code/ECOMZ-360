import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, MainNavTab } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { BottomNavigation } from '../components/BottomNavigation';
import { EcoBotModal } from '../components/EcoBotModal';
import { PushNotificationManager } from '../components/PushNotificationManager';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeRole,
    setActiveRole,
    isDarkMode,
    toggleDarkMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    notices
  } = useApp();

  const [isEcoBotOpen, setIsEcoBotOpen] = useState(false);

  // Derive activeTab from current route pathname
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard' || path === '/inicio' || path === '/mobile/dashboard' || path === '/mobile/inicio') return 'dashboard';
    if (path.startsWith('/mapa')) return 'mapa';
    if (path.startsWith('/ocorrencias')) return 'ocorrencias';
    if (path.startsWith('/projetos')) return 'projetos';
    if (path.startsWith('/simulacoes')) return 'simulacoes';
    if (path.startsWith('/alertas')) return 'alertas';
    if (path.startsWith('/noticias')) return 'noticias';
    if (path.startsWith('/avisos')) return 'avisos';
    if (path.startsWith('/eco-pulse')) return 'ecopulse';
    if (path.startsWith('/ecobot') || path.startsWith('/chat')) return 'ecobot';
    if (path.startsWith('/relatorios')) return 'relatorios';
    if (path.startsWith('/educacao')) return 'educacao';
    if (path.startsWith('/voluntariado')) return 'voluntariado';
    if (path.startsWith('/fundos')) return 'fundos';
    if (path.startsWith('/certificacao')) return 'certificacao';
    if (path.startsWith('/forum') || path.startsWith('/eco-forum')) return 'forum';
    if (path.startsWith('/recursos-comunitarios') || path.startsWith('/eco-recursos')) return 'recursos-comunitarios';
    if (path.startsWith('/auditoria-dados')) return 'auditoria-dados';
    if (path.startsWith('/diagnostico')) return 'diagnostico';
    if (path.startsWith('/configuracoes')) return 'configuracoes';
    if (path.startsWith('/administracao')) return 'administracao';
    if (path.startsWith('/perfil')) return 'perfil';
    return 'dashboard';
  };

  const handleSelectTab = (tab: MainNavTab | string) => {
    if (tab === 'dashboard') {
      navigate('/inicio');
      return;
    }
    if (tab === 'ecobot') {
      navigate('/ecobot');
      return;
    }
    if (tab === 'ecopulse') {
      navigate('/eco-pulse');
      return;
    }
    navigate(`/${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* 1. Left Institutional Sidebar (Desktop sticky / Mobile drawer) */}
      <Sidebar
        activeTab={getActiveTab()}
        onSelectTab={handleSelectTab}
        urgentAlertCount={7}
        onOpenEcoBot={() => setIsEcoBotOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Center/Right Container */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Top Header */}
        <TopHeader
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenEcoBot={() => setIsEcoBotOpen(true)}
          onOpenAlerts={() => navigate('/alertas')}
          onOpenProfile={() => navigate('/perfil')}
          onOpenAdmin={() => navigate('/administracao')}
          onOpenLogin={() => navigate('/login')}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          urgentAlertCount={7}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Outlet />
        </main>

        {/* Desktop Institutional Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors hidden sm:block">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">ECO-MZ 360</span>
              <span>— Plataforma Inteligente de Gestão Ambiental de Moçambique</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <span>República de Moçambique</span>
              <span>•</span>
              <span>MTA / INGD Alinhado</span>
              <span>•</span>
              <span>Versão 1.1 Produção</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. Mobile Persistent Bottom Navigation */}
      <BottomNavigation />

      {/* 4. Floating EcoBot AI Assistant button */}
      <button
        onClick={() => setIsEcoBotOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-5 z-40 p-3.5 bg-[#00A651] hover:bg-[#008f45] text-white rounded-full shadow-xl flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Consultar Assistente EcoBot MZ"
      >
        <Sparkles className="w-5 h-5 text-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold">
          EcoBot MZ
        </span>
      </button>

      {/* EcoBot Modal */}
      <EcoBotModal
        isOpen={isEcoBotOpen}
        onClose={() => setIsEcoBotOpen(false)}
      />

      {/* Real-time Critical Push Notification Manager (Ciclones, Cheias, Secas) */}
      <PushNotificationManager />
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { OccurrencesPage } from './pages/OccurrencesPage';
import { OccurrenceDetailPage } from './pages/OccurrenceDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { NewsPage } from './pages/NewsPage';
import { NoticesPage } from './pages/NoticesPage';
import { PulsePage } from './pages/PulsePage';
import { ReportsPage } from './pages/ReportsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertsPage } from './pages/AlertsPage';
import { EcoBotPage } from './pages/EcoBotPage';
import { EducationPage } from './pages/EducationPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { FundPage } from './pages/FundPage';
import { CertPage } from './pages/CertPage';
import { CommunityPage } from './pages/CommunityPage';
import { CommunityResourcesPage } from './pages/CommunityResourcesPage';
import { DataAuditPage } from './pages/DataAuditPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { ApiPortalPage } from './pages/ApiPortalPage';
import { MobileModePage } from './pages/MobileModePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Root index redirect: if logged in go to /dashboard, else /login
const RootRedirect: React.FC = () => {
  const { isLoggedIn } = useApp();
  return <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Authentication & Onboarding Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Direct Mobile Aliases matching Master Prompt Section 3 */}
          <Route path="/mobile/splash" element={<SplashPage />} />
          <Route path="/mobile/login" element={<LoginPage />} />

          {/* Main Layout Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inicio" element={<DashboardPage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/ocorrencias" element={<OccurrencesPage />} />
            <Route path="/ocorrencias/:id" element={<OccurrenceDetailPage />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/projetos/:id" element={<ProjectDetailPage />} />
            <Route path="/simulacoes" element={<SimulationsPage />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/avisos" element={<NoticesPage />} />
            <Route path="/eco-pulse" element={<PulsePage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/perfil" element={<UserProfilePage />} />
            <Route path="/administracao" element={<AdminPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/alertas" element={<AlertsPage />} />
            <Route path="/ecobot" element={<EcoBotPage />} />
            <Route path="/chat" element={<EcoBotPage />} />
            <Route path="/educacao" element={<EducationPage />} />
            <Route path="/eco-edu" element={<EducationPage />} />
            <Route path="/voluntariado" element={<VolunteerPage />} />
            <Route path="/eco-volunteer" element={<VolunteerPage />} />
            <Route path="/fundos" element={<FundPage />} />
            <Route path="/eco-fund" element={<FundPage />} />
            <Route path="/certificacao" element={<CertPage />} />
            <Route path="/eco-cert" element={<CertPage />} />
            <Route path="/forum" element={<CommunityPage />} />
            <Route path="/eco-forum" element={<CommunityPage />} />
            <Route path="/recursos-comunitarios" element={<CommunityResourcesPage />} />
            <Route path="/eco-recursos" element={<CommunityResourcesPage />} />
            <Route path="/auditoria-dados" element={<DataAuditPage />} />
            <Route path="/eco-data" element={<DataAuditPage />} />
            <Route path="/diagnostico" element={<DiagnosticsPage />} />
            <Route path="/eco-diag" element={<DiagnosticsPage />} />

            {/* Removed API Portal & Offline Mode Modules redirected to /inicio */}
            <Route path="/api-docs" element={<Navigate to="/inicio" replace />} />
            <Route path="/eco-api" element={<Navigate to="/inicio" replace />} />
            <Route path="/modo-offline" element={<Navigate to="/inicio" replace />} />
            <Route path="/eco-mobile" element={<Navigate to="/inicio" replace />} />
            <Route path="/mobile/api-docs" element={<Navigate to="/inicio" replace />} />
            <Route path="/mobile/modo-offline" element={<Navigate to="/inicio" replace />} />

            {/* Mobile In-Layout Aliases */}
            <Route path="/mobile/dashboard" element={<DashboardPage />} />
            <Route path="/mobile/inicio" element={<DashboardPage />} />
            <Route path="/mobile/mapa" element={<MapPage />} />
            <Route path="/mobile/ecobot" element={<EcoBotPage />} />
            <Route path="/mobile/ocorrencias" element={<OccurrencesPage />} />
            <Route path="/mobile/ocorrencias/:id" element={<OccurrenceDetailPage />} />
            <Route path="/mobile/projetos" element={<ProjectsPage />} />
            <Route path="/mobile/simulacoes" element={<SimulationsPage />} />
            <Route path="/mobile/noticias" element={<NewsPage />} />
            <Route path="/mobile/avisos" element={<NoticesPage />} />
            <Route path="/mobile/perfil" element={<UserProfilePage />} />
            <Route path="/mobile/administracao" element={<AdminPage />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

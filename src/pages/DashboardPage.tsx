import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EcoMainDashboard } from '../components/EcoMainDashboard';
import { useApp } from '../context/AppContext';
import { Occurrence, EnvironmentalProject } from '../types';

export const DashboardPage: React.FC<{ onOpenEcoBot?: () => void }> = ({ onOpenEcoBot }) => {
  const navigate = useNavigate();
  const { occurrences, projects } = useApp();

  const handleSelectOccurrence = useCallback((occ: Occurrence) => {
    navigate(`/ocorrencias/${occ.id}`);
  }, [navigate]);

  const handleSelectProject = useCallback((proj: EnvironmentalProject) => {
    navigate(`/projetos/${proj.id}`);
  }, [navigate]);

  const handleNewOccurrence = useCallback(() => {
    navigate('/ocorrencias?novo=true', { state: { openNew: true } });
  }, [navigate]);

  const handleNewProject = useCallback(() => {
    navigate('/projetos');
  }, [navigate]);

  const handleNavigateToTab = useCallback((tab: string) => {
    if (tab === 'ecopulse') navigate('/eco-pulse');
    else navigate(`/${tab}`);
  }, [navigate]);

  return (
    <EcoMainDashboard
      occurrences={occurrences}
      projects={projects}
      onSelectOccurrence={handleSelectOccurrence}
      onSelectProject={handleSelectProject}
      onNewOccurrence={handleNewOccurrence}
      onNewProject={handleNewProject}
      onNavigateToTab={handleNavigateToTab}
      onOpenEcoBot={() => onOpenEcoBot?.()}
    />
  );
};

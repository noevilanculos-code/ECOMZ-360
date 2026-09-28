import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClimateSimulationMap } from '../components/ClimateSimulationMap';
import { CycloneSimulationEngine } from '../components/CycloneSimulationEngine';
import { CoastalInundationTideSim } from '../components/CoastalInundationTideSim';
import { EcoSim } from '../components/EcoSim';
import { useApp } from '../context/AppContext';
import { EnvironmentalProject } from '../types';
import { Globe, SlidersHorizontal, Wind, Waves, Sparkles } from 'lucide-react';

export const SimulationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useApp();
  const [activeSimulationMode, setActiveSimulationMode] = useState<
    'clima_mapa' | 'inundacao_mares' | 'ciclones_ingd' | 'ecosim_parametros'
  >('clima_mapa');

  const handleExportSimToProject = (draft: Partial<EnvironmentalProject>) => {
    const newProj: EnvironmentalProject = {
      id: `proj-${Date.now()}`,
      title: draft.title || 'Projeto Gerado no Simulador ECO-MZ',
      category: draft.category || 'Desmatamento',
      province: draft.province || 'Sofala',
      district: draft.district || 'Beira',
      leadEntity: draft.leadEntity || 'Consórcio ECO-MZ 360',
      status: 'Planeado',
      progress: 0,
      budgetTotalMZN: draft.budgetTotalMZN || 2500000,
      budgetRaisedMZN: 0,
      startDate: new Date().toISOString().substring(0, 10),
      targetDate: '2028-12-31',
      description: draft.description || '',
      keyMetric: draft.keyMetric || 'Área recuperada / Proteção Costeira',
      keyMetricAchieved: draft.keyMetricAchieved || '0 / 100 meta',
      volunteerSpots: draft.volunteerSpots || 40,
      volunteersEnrolled: 0
    };
    addProject(newProj);
    navigate(`/projetos/${newProj.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Simulation Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSimulationMode('clima_mapa')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSimulationMode === 'clima_mapa'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulação Climática & Mapa Leaflet</span>
          </button>

          <button
            onClick={() => setActiveSimulationMode('inundacao_mares')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSimulationMode === 'inundacao_mares'
                ? 'bg-[#062B3D] text-white shadow-xs ring-2 ring-cyan-400/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inundação Costeira, Vento & Maré</span>
          </button>

          <button
            onClick={() => setActiveSimulationMode('ciclones_ingd')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSimulationMode === 'ciclones_ingd'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulador de Ciclones & Gestão INGD</span>
          </button>

          <button
            onClick={() => setActiveSimulationMode('ecosim_parametros')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSimulationMode === 'ecosim_parametros'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modelagem de Transição</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-2 hidden sm:block">
          Módulo Preditivo Territorial de Moçambique
        </div>
      </div>

      {/* Render Active View */}
      {activeSimulationMode === 'clima_mapa' ? (
        <ClimateSimulationMap
          onExportToProject={handleExportSimToProject}
          onNewOccurrence={() => navigate('/ocorrencias?novo=true')}
        />
      ) : activeSimulationMode === 'inundacao_mares' ? (
        <CoastalInundationTideSim />
      ) : activeSimulationMode === 'ciclones_ingd' ? (
        <CycloneSimulationEngine />
      ) : (
        <EcoSim onExportToProject={handleExportSimToProject} />
      )}
    </div>
  );
};



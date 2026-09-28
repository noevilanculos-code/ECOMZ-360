import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EcoProjects } from '../components/EcoProjects';
import { EcoAction } from '../components/EcoAction';
import { EcoFund } from '../components/EcoFund';
import { useApp } from '../context/AppContext';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, occurrences, addProject } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'projetos' | 'acao' | 'fundos'>('projetos');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
        <button
          onClick={() => setActiveSubTab('projetos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'projetos'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Projetos & Orçamentos
        </button>
        <button
          onClick={() => setActiveSubTab('acao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'acao'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tarefas de Campo
        </button>
        <button
          onClick={() => setActiveSubTab('fundos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'fundos'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Apoio & Financiamento
        </button>
      </div>

      {activeSubTab === 'projetos' && (
        <EcoProjects
          projects={projects}
          onSelectProject={(proj) => navigate(`/projetos/${proj.id}`)}
          onNewProject={(newProj) => addProject(newProj)}
        />
      )}

      {activeSubTab === 'acao' && (
        <EcoAction projects={projects} occurrences={occurrences} />
      )}

      {activeSubTab === 'fundos' && <EcoFund />}
    </div>
  );
};

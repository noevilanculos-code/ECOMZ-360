import React, { useState } from 'react';
import {
  TreePine,
  CheckCircle2,
  Clock,
  Coins,
  Users,
  MapPin,
  PlusCircle,
  ChevronRight,
  Filter,
  FileText
} from 'lucide-react';
import { EnvironmentalProject, MozambiqueProvince, EnvironmentalCategory } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

interface EcoProjectsProps {
  projects: EnvironmentalProject[];
  onSelectProject: (project: EnvironmentalProject) => void;
  onNewProject: (project: EnvironmentalProject) => void;
}

export const EcoProjects: React.FC<EcoProjectsProps> = ({
  projects,
  onSelectProject,
  onNewProject
}) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('Todas');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EnvironmentalCategory>('Destruição de Mangais');
  const [newProvince, setNewProvince] = useState<MozambiqueProvince>('Sofala');
  const [newDistrict, setNewDistrict] = useState('');
  const [newLeadEntity, setNewLeadEntity] = useState('');
  const [newBudget, setNewBudget] = useState('3500000');
  const [newDescription, setNewDescription] = useState('');
  const [newKeyMetric, setNewKeyMetric] = useState('Hectares regenerados');

  const filteredProjects = projects.filter((p) => {
    if (selectedFilterCategory !== 'Todas' && p.category !== selectedFilterCategory) return false;
    return true;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDistrict.trim()) return;

    const project: EnvironmentalProject = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      province: newProvince,
      district: newDistrict.trim(),
      leadEntity: newLeadEntity.trim() || 'Iniciativa Comunitária Local',
      status: 'Planeado',
      progress: 0,
      budgetTotalMZN: Number(newBudget) || 1000000,
      budgetRaisedMZN: 0,
      startDate: new Date().toISOString().substring(0, 10),
      targetDate: '2028-12-31',
      description: newDescription.trim(),
      keyMetric: newKeyMetric.trim(),
      keyMetricAchieved: `0 / 100 meta`,
      volunteerSpots: 50,
      volunteersEnrolled: 0
    };

    onNewProject(project);
    setShowCreateModal(false);
    // Reset
    setNewTitle('');
    setNewDistrict('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <TreePine className="w-3.5 h-3.5" />
            <span>ECO-PROJECTS • Gestão de Intervenções Ambientais</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Projetos Ecológicos e Programas Comunitários
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento de iniciativas de reflorestamento, conservação hídrica e gestão de resíduos em Moçambique.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Criar Novo Projeto</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {project.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    project.status === 'Em Execução'
                      ? 'bg-blue-100 text-blue-800'
                      : project.status === 'Concluído'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {project.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
            </div>

            {/* Metrics */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Progresso: {project.keyMetricAchieved}</span>
                  <strong className="text-emerald-700">{project.progress}%</strong>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Localização:</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {project.district}, {project.province}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Orçamento / Angariado:</span>
                  <span className="font-semibold text-slate-700">
                    {(project.budgetRaisedMZN / 1000000).toFixed(1)}M / {(project.budgetTotalMZN / 1000000).toFixed(1)}M MZN
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.volunteersEnrolled} voluntários ativos</span>
                </span>
                <span className="text-emerald-600 font-bold flex items-center">
                  Ver Detalhes & Tarefas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Novo Projeto Ambiental</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Projeto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Restauração da Vegetação Ciliar do Rio Búzi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EnvironmentalCategory)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Destruição de Mangais">Mangais</option>
                    <option value="Desmatamento">Desmatamento</option>
                    <option value="Queimadas Descontroladas">Queimadas</option>
                    <option value="Poluição Hídrica">Poluição Hídrica</option>
                    <option value="Resíduos Sólidos Urbanos">Resíduos Sólidos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Província</label>
                  <select
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value as MozambiqueProvince)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {Object.keys(MOZAMBIQUE_PROVINCES).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distrito *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dondo, Búzi..."
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entidade Líder</label>
                  <input
                    type="text"
                    placeholder="Ex: Associação Verde de Sofala"
                    value={newLeadEntity}
                    onChange={(e) => setNewLeadEntity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Orçamento Previsto (MZN)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição e Metas</label>
                <textarea
                  rows={3}
                  placeholder="Objetivos ecológicos, comunidades beneficiárias e metodologia..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Registar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  Target,
  DollarSign,
  CheckCircle2,
  Share2,
  TreePine,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useApp();

  const project = projects.find((p) => p.id === id);
  const [volunteersEnrolled, setVolunteersEnrolled] = useState(project?.volunteersEnrolled ?? 0);
  const [hasJoined, setHasJoined] = useState(false);

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Projeto não encontrado.</p>
        <button
          onClick={() => navigate('/projetos')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  const handleJoinVolunteer = () => {
    if (!hasJoined) {
      setVolunteersEnrolled((prev) => prev + 1);
      setHasJoined(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Voltar</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
          {project.title}
        </h1>

        <div className="w-9 h-9" />
      </div>

      {/* Main Project Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        {/* Banner with Status Badge */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80"
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center space-x-1.5 ${
                project.status === 'Concluído'
                  ? 'bg-emerald-600 text-white'
                  : project.status === 'Em Execução'
                  ? 'bg-blue-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{project.status}</span>
            </span>
          </div>

          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
            {project.id}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl sm:text-3xl font-black">{project.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {project.district}, {project.province}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {project.startDate} — {project.targetDate}
              </span>
            </div>
          </div>
        </div>

        {/* Details & Progress */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Progress Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Progresso Geral do Projeto</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-emerald-500 to-[#00A651] h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Descrição do Projeto
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-semibold">Orçamento Total</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {(project.budgetTotalMZN / 1000).toLocaleString()} mil MT
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-semibold">Meta de Impacto</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {project.keyMetricAchieved}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-semibold">Equipa & Voluntários</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {volunteersEnrolled} inscritos
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <Briefcase className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-semibold">Entidade Líder</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {project.leadEntity}
              </div>
            </div>
          </div>

          {/* Volunteer Enrollment Action */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Participe como Cidadão Guardião
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Vagas de voluntariado abertas para reflorestamento, limpeza e monitorização comunitária.
              </p>
            </div>
            <button
              onClick={handleJoinVolunteer}
              disabled={hasJoined}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer ${
                hasJoined
                  ? 'bg-emerald-800 text-white cursor-default'
                  : 'bg-[#00A651] hover:bg-[#008f45] text-white'
              }`}
            >
              {hasJoined ? '✓ Já Inscrito no Projeto' : 'Inscrever-me como Voluntário'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

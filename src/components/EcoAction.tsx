import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  UserCheck,
  Upload,
  AlertCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { EnvironmentalProject, Occurrence } from '../types';

interface EcoActionProps {
  projects: EnvironmentalProject[];
  occurrences: Occurrence[];
  onCompleteTask?: (taskId: string) => void;
}

interface ActionTask {
  id: string;
  title: string;
  projectName: string;
  assignedTeam: string;
  dueDate: string;
  status: 'Pendente' | 'Em Curso' | 'Concluído';
  location: string;
  evidenceUrl?: string;
  notes?: string;
}

export const EcoAction: React.FC<EcoActionProps> = ({ projects, occurrences }) => {
  const [tasks, setTasks] = useState<ActionTask[]>([
    {
      id: 'task-1',
      title: 'Plantação de 5.000 propágulos no Estuário do Púnguè',
      projectName: 'Restauração de Mangais da Beira',
      assignedTeam: 'Brigada de Restauração Costeira de Sofala',
      dueDate: '2026-09-28',
      status: 'Em Curso',
      location: 'Praia Nova, Beira',
      evidenceUrl: '/assets/img/eco/mangais.jpg',
      notes: 'Equipa mobilizou 40 voluntários da comunidade de pescadores locais.'
    },
    {
      id: 'task-2',
      title: 'Abertura de Faixa Corta-Fogo de 20km na Reserva do Niassa',
      projectName: 'Prevenção de Queimadas no Corredor do Niassa',
      assignedTeam: 'Guarda Florestal e Comunitária do Niassa',
      dueDate: '2026-10-05',
      status: 'Pendente',
      location: 'Posto Administrativo de Mecula, Niassa',
      notes: 'Trator e pás distribuídos aos comités comunitários.'
    },
    {
      id: 'task-3',
      title: 'Remoção e Triagem de Resíduos Plásticos na Margem do Rio Incomáti',
      projectName: 'Restauração e Limpeza do Rio Incomáti',
      assignedTeam: 'Cooperativa Recicla Marracuene',
      dueDate: '2026-09-21',
      status: 'Concluído',
      location: 'Marracuene, Maputo Província',
      evidenceUrl: '/assets/img/imagens/ChatGPT Image 18 de set. de 2026, 17_13_44.png',
      notes: '3.8 toneladas de resíduos plásticos encaminhados para a recicladora.'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'todos' | 'Em Curso' | 'Pendente' | 'Concluído'>('todos');

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'Pendente' ? 'Em Curso' : t.status === 'Em Curso' ? 'Concluído' : 'Pendente';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'todos') return true;
    return t.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>ECO-ACTION • Execução e Brigadas no Terreno</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Ordens de Serviço e Intervenções de Campo
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento de brigadas florestais, limpezas costeiras e fiscalização ambiental distrital.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1 rounded font-semibold ${
              activeFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('Em Curso')}
            className={`px-3 py-1 rounded font-semibold ${
              activeFilter === 'Em Curso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Em Curso
          </button>
          <button
            onClick={() => setActiveFilter('Concluído')}
            className={`px-3 py-1 rounded font-semibold ${
              activeFilter === 'Concluído' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {task.projectName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    task.status === 'Concluído'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.status === 'Em Curso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h3>

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p className="flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{task.assignedTeam}</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{task.location}</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Prazo Limite: {task.dueDate}</span>
                </p>
              </div>

              {task.evidenceUrl && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">Evidência Fotográfica de Campo:</span>
                  <div className="h-28 rounded-lg overflow-hidden border border-slate-200">
                    <img src={task.evidenceUrl} alt={task.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {task.notes && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/60 italic">
                  "{task.notes}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => toggleTaskStatus(task.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                  task.status === 'Concluído'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : task.status === 'Em Curso'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {task.status === 'Concluído'
                    ? 'Reabrir Tarefa'
                    : task.status === 'Em Curso'
                    ? 'Marcar como Concluída'
                    : 'Iniciar Execução no Terreno'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

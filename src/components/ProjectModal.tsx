import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  TreePine,
  Coins,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  Heart
} from 'lucide-react';
import { EnvironmentalProject } from '../types';

interface ProjectModalProps {
  project: EnvironmentalProject | null;
  onClose: () => void;
  onEnrollVolunteer?: (projectId: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onEnrollVolunteer
}) => {
  if (!project) return null;

  const [donatedAmount, setDonatedAmount] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donatedAmount) return;
    setDonateSuccess(true);
    setTimeout(() => {
      setDonateSuccess(false);
      setDonatedAmount('');
    }, 2500);
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    if (onEnrollVolunteer) {
      onEnrollVolunteer(project.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {project.category}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {project.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{project.title}</h2>
            <p className="text-xs text-slate-500">{project.leadEntity} • {project.district}, {project.province}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Financials */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Progresso da Meta: {project.keyMetricAchieved}</span>
            <strong className="text-emerald-700 text-sm">{project.progress}%</strong>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Orçamento Total:</span>
              <span className="font-bold text-slate-800">{(project.budgetTotalMZN / 1000000).toFixed(2)}M MZN</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Fundos Angariados:</span>
              <span className="font-bold text-emerald-700">{(project.budgetRaisedMZN / 1000000).toFixed(2)}M MZN</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Voluntários Inscritos:</span>
              <span className="font-bold text-teal-700">{project.volunteersEnrolled} / {project.volunteerSpots}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Objetivo e Justificação Ecológica</h4>
          <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action: Support or Volunteer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Volunteer card */}
          <div className="p-3.5 rounded-lg border border-teal-200 bg-teal-50/50 space-y-2 text-xs">
            <span className="font-bold text-teal-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Participar como Voluntário</span>
            </span>
            <p className="text-[11px] text-teal-800">
              Junte-se à brigada de campo com apoio logístico e certificação de horas ecológicas.
            </p>
            <button
              onClick={handleEnroll}
              disabled={isEnrolled}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                isEnrolled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isEnrolled ? 'Inscrição Ativa ✓' : 'Inscrever-me no Projeto'}
            </button>
          </div>

          {/* Micro-donation / funding card */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs">
            <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Apoiar via ECO-FUND (M-Pesa / Conta)</span>
            </span>
            <form onSubmit={handleDonate} className="flex gap-2">
              <input
                type="number"
                placeholder="Valor (MZN)"
                value={donatedAmount}
                onChange={(e) => setDonatedAmount(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shrink-0"
              >
                Apoiar
              </button>
            </form>
            {donateSuccess && (
              <p className="text-[10px] text-emerald-800 font-bold">
                Contribuição registada com recibo transparente emitido!
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  MapPin,
  Clock,
  Leaf,
  User,
  Camera,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OccurrenceStatus } from '../types';

export const OccurrenceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { occurrences, updateOccurrenceStatus } = useApp();

  const occurrence = occurrences.find((occ) => occ.id === id) || occurrences[0];
  const [currentStatus, setCurrentStatus] = useState<OccurrenceStatus>(occurrence?.status || 'Em Intervenção');
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!occurrence) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Ocorrência não encontrada.</p>
        <button
          onClick={() => navigate('/ocorrencias')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          Voltar para Ocorrências
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    try {
      await updateOccurrenceStatus(occurrence.id, newStatus);
      setCurrentStatus(newStatus);
      setShowStatusModal(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível atualizar a ocorrência.');
    }
  };

  const handleGoToMap = () => {
    navigate(`/mapa?lat=${occurrence.coordinates.lat}&lng=${occurrence.coordinates.lng}&id=${occurrence.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Bar matching 15_MOBILE_DETALHE_OCORRENCIA.png */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Voltar</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Detalhe da Ocorrência
        </h1>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowStatusModal(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Mais opções"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        {/* Photo with Overlay Badge */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={occurrence.imageUrl || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=1000&q=80'}
            alt={occurrence.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Status Badge overlay on top right */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center space-x-1.5 ${
                occurrence.status === 'Resolvido'
                  ? 'bg-emerald-600 text-white'
                  : occurrence.status === 'Validado'
                  ? 'bg-emerald-500 text-white'
                  : occurrence.status === 'Em Intervenção'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{occurrence.status}</span>
            </span>
          </div>

          {/* Protocol overlay on top left */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
            {occurrence.id}
          </div>

          {/* Title and location at the bottom of the photo */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-black">{occurrence.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {occurrence.locationDetails}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {occurrence.timestamp}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Descrição
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {occurrence.description}
            </p>
          </div>

          {/* Metadata Grid matching 15_MOBILE_DETALHE_OCORRENCIA.png */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Category */}
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold">Categoria</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {occurrence.category}
                </p>
              </div>
            </div>

            {/* Coordinates / Location */}
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold">Localização</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {occurrence.coordinates.lat.toFixed(4)}, {occurrence.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Reported By */}
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold">Reportado por</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {occurrence.reportedBy || 'Cidadão Guardião'}
                </p>
              </div>
            </div>

            {/* Evidence Count */}
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold">Evidências</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  3 fotos | 1 vídeo georreferenciado
                </p>
              </div>
            </div>
          </div>

          {/* Action Summary / Notes */}
          {occurrence.actionSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Intervenção e Despacho Técnico
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">
                {occurrence.actionSummary}
              </p>
              {occurrence.assignedTeam && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 font-semibold">
                  Equipa responsável: {occurrence.assignedTeam}
                </p>
              )}
            </div>
          )}

          {/* Big Green Action Button "Ver no mapa" matching 15_MOBILE_DETALHE_OCORRENCIA.png */}
          <button
            onClick={handleGoToMap}
            className="w-full py-4 rounded-2xl bg-[#00A651] hover:bg-[#008f45] active:bg-[#007839] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Navigation className="w-5 h-5" />
            <span>Ver no mapa</span>
          </button>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Alterar Estado da Ocorrência
            </h3>
            <div className="space-y-2">
              {(['Recebido', 'Em Validação', 'Validado', 'Em Intervenção', 'Resolvido'] as OccurrenceStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    currentStatus === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

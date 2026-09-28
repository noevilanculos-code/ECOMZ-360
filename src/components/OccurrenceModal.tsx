import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  Camera
} from 'lucide-react';
import { Occurrence, OccurrenceStatus } from '../types';

interface OccurrenceModalProps {
  occurrence: Occurrence | null;
  onClose: () => void;
  onUpdateStatus?: (occId: string, newStatus: OccurrenceStatus, note?: string) => void;
}

export const OccurrenceModal: React.FC<OccurrenceModalProps> = ({
  occurrence,
  onClose,
  onUpdateStatus
}) => {
  if (!occurrence) return null;

  const [techNote, setTechNote] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<OccurrenceStatus>(occurrence.status);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStatus) {
      onUpdateStatus(occurrence.id, selectedNewStatus, techNote.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {occurrence.protocol}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  occurrence.severity === 'Crítico'
                    ? 'bg-rose-100 text-rose-800'
                    : occurrence.severity === 'Alto'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Gravidade: {occurrence.severity}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {occurrence.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{occurrence.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evidence Image */}
        {occurrence.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-slate-200 h-56 bg-slate-950 relative">
            <img
              src={occurrence.imageUrl}
              alt={occurrence.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-[10px] flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>Evidência registada no local</span>
            </span>
          </div>
        )}

        {/* Geospatial and Reporter Data */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">Localização:</span>
            <span className="font-bold text-slate-800">{occurrence.district}, {occurrence.province}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Coordenadas GPS:</span>
            <span className="font-mono text-slate-700">{occurrence.coordinates.lat}, {occurrence.coordinates.lng}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Data do Registo:</span>
            <span className="font-semibold text-slate-700">{occurrence.timestamp}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Denunciante:</span>
            <span className="font-semibold text-slate-700">
              {occurrence.isAnonymous ? 'Anónimo (Protegido)' : occurrence.reportedBy}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Índice de Confiabilidade:</span>
            <span className="font-bold text-emerald-700">{occurrence.validationScore || 85}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Equipa Encarregue:</span>
            <span className="font-semibold text-blue-700">{occurrence.assignedTeam || 'A atribuir'}</span>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Descrição dos Danos Observados</h4>
          <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
            {occurrence.description}
          </p>
        </div>

        {/* Action Summary if present */}
        {occurrence.actionSummary && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Relatório da Intervenção no Terreno</h4>
            <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200 leading-relaxed flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{occurrence.actionSummary}</span>
            </div>
          </div>
        )}

        {/* Technical Validation & Status update section */}
        <form onSubmit={handleSaveUpdate} className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Atualização Técnica da Ocorrência</h4>
            <span className="text-[10px] text-slate-400">Exclusivo para Técnicos & Gestores</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Alterar Estado Operacional</label>
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as OccurrenceStatus)}
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Em Validação">Em Validação</option>
                <option value="Validado">Validado (Confirmado por Satélite / Equipa)</option>
                <option value="Em Intervenção">Em Intervenção (Brigada Ativa no Terreno)</option>
                <option value="Resolvido">Resolvido (Medidas Concluídas)</option>
                <option value="Arquivado">Arquivado / Improcedente</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nota Técnica ou Despacho</label>
              <input
                type="text"
                placeholder="Ex: Brigada de Sofala enviada ao local..."
                value={techNote}
                onChange={(e) => setTechNote(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Fechar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Guardado com Sucesso!' : 'Atualizar Estado e Registo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

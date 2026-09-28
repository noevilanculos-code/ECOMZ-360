import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  HeartHandshake,
  Download,
  Share2,
  Shield,
  QrCode,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_VOLUNTEER_OPPS } from '../data/mockData';
import { VolunteerOpportunity } from '../types';

export const VolunteerPage: React.FC = () => {
  const { user } = useApp();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(INITIAL_VOLUNTEER_OPPS);
  const [enrolledIds, setEnrolledIds] = useState<string[]>(['v-1']);
  const [selectedCertificateOpp, setSelectedCertificateOpp] = useState<VolunteerOpportunity | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleToggleEnroll = (oppId: string) => {
    if (enrolledIds.includes(oppId)) {
      setEnrolledIds(enrolledIds.filter((id) => id !== oppId));
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, enrolled: Math.max(0, (o.enrolled || 0) - 1) } : o))
      );
    } else {
      setEnrolledIds([...enrolledIds, oppId]);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, enrolled: (o.enrolled || 0) + 1 } : o))
      );
    }
  };

  const totalVolunteeringHours = enrolledIds.length * 12 + 24;

  const handleDownloadCertificate = (opp: VolunteerOpportunity) => {
    setDownloadSuccess(`Certificado oficial gerado para ${opp.title}!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Voluntariado e Ação Comunitária</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Mobilização e Voluntariado Verde
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Transformando participação passiva em impacto prático. Conecte-se diretamente às frentes de restauração costeira, plantio de miombo e brigadas municipais de conservação.
            </p>
          </div>

          {/* Volunteer Status Summary Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[200px]">
            <div className="text-2xl font-black text-[#00B956]">{totalVolunteeringHours}h</div>
            <div className="text-[11px] text-slate-200 font-semibold">Horas de Voluntariado Registadas</div>
            <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              <Award className="w-3 h-3" />
              <span>Guardião do Mangal (Nível 2)</span>
            </div>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button
            onClick={() => setDownloadSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid: Volunteer Badges & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Volunteer Profile & Achievements */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#062B3D] text-[#00B956] flex items-center justify-center font-black text-base shadow-sm">
                NS
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Voluntário Ativo • Província de Sofala
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Distintivos & Reconhecimentos
              </h4>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      🌱
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Guardião do Mangal
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        +500 propágulos plantados
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                    Ouro
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      💧
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Sentinela das Águas
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Monitorização de rios no Incomáti
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    Prata
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                      🔥
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Brigada Antifogo
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Apoio aos aceiros rurais no Miombo
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                    Bronze
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Opportunities List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Oportunidades Abertas em Moçambique</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                {opportunities.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Iniciativas de conservação em andamento
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => {
              const isEnrolled = enrolledIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                        {opp.category}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{opp.province}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#00A651]" />
                        <span>{opp.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{opp.hoursCredit || 8} horas acreditadas</span>
                      </div>
                    </div>

                    {/* Progress Bar of spots */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Vagas Preenchidas</span>
                        <span className="text-[#00A651]">
                          {opp.spotsTaken || opp.enrolled || 12} / {opp.spotsTotal || opp.spots || 20}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#00A651] transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (((opp.spotsTaken || opp.enrolled || 12)) / (opp.spotsTotal || opp.spots || 20)) * 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCertificateOpp(opp)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Certificado</span>
                    </button>

                    <button
                      onClick={() => handleToggleEnroll(opp.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isEnrolled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-[#00A651] hover:bg-[#008f45] text-white shadow-xs'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Inscrito (Cancelar)</span>
                        </>
                      ) : (
                        <>
                          <span>Quero Participar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Modal Preview */}
      {selectedCertificateOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                <FileCheck className="w-5 h-5" />
                <span>Certificado Oficial de Voluntariado Verde</span>
              </div>
              <button
                onClick={() => setSelectedCertificateOpp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Official Certificate Canvas Mock */}
            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border-2 border-amber-300/80 dark:border-amber-700/60 text-center space-y-3 relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-widest font-black text-amber-800 dark:text-amber-400">
                República de Moçambique • Ministério da Terra e Ambiente
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif">
                CERTIFICADO DE MÉRITO AMBIENTAL
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Certifica-se que <strong>{user.name}</strong> participou com dedicação cívica na iniciativa ecológica{' '}
                <strong>"{selectedCertificateOpp.title}"</strong>, totalizando{' '}
                <strong>{selectedCertificateOpp.hoursCredit || 8} horas</strong> de trabalho comunitário na Província de{' '}
                <strong>{selectedCertificateOpp.province}</strong>.
              </p>
              <div className="flex items-center justify-center space-x-4 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>Código: MZ-ECO-2026-{selectedCertificateOpp.id}</span>
                <span>Data: {selectedCertificateOpp.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedCertificateOpp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleDownloadCertificate(selectedCertificateOpp);
                  setSelectedCertificateOpp(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00A651] hover:bg-[#008f45] text-white flex items-center space-x-2 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Certificado (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

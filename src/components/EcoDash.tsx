import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  TreePine,
  Coins,
  Users,
  Building2,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { UserRole, MozambiqueProvince, Occurrence, EnvironmentalProject } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { ProvinceOccurrencesBarChart } from './ProvinceOccurrencesBarChart';

interface EcoDashProps {
  activeRole: UserRole;
  occurrences: Occurrence[];
  projects: EnvironmentalProject[];
}

export const EcoDash: React.FC<EcoDashProps> = ({
  activeRole,
  occurrences,
  projects
}) => {
  const [selectedMetricView, setSelectedMetricView] = useState<'geral' | 'provincias' | 'categorias'>('geral');

  // Aggregated metrics
  const totalOccurrences = occurrences.length;
  const resolvedOccurrences = occurrences.filter((o) => o.status === 'Resolvido').length;
  const resolutionRate = Math.round((resolvedOccurrences / totalOccurrences) * 100);

  const totalFundsMZN = projects.reduce((acc, p) => acc + p.budgetRaisedMZN, 0);
  const totalVolunteers = projects.reduce((acc, p) => acc + p.volunteersEnrolled, 0);

  // Group occurrences by category
  const categoryCounts: Record<string, number> = {};
  occurrences.forEach((occ) => {
    categoryCounts[occ.category] = (categoryCounts[occ.category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Profile Perspective Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>ECO-DASH • Painel Analítico Integrado</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Observatório de Indicadores Ambientais de Moçambique
            </h2>
            <p className="text-xs text-slate-500">
              Visão consolidada adaptada ao perfil de <strong>{activeRole.toUpperCase()}</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
              <button
                onClick={() => setSelectedMetricView('geral')}
                className={`px-3 py-1 rounded font-semibold ${
                  selectedMetricView === 'geral' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setSelectedMetricView('provincias')}
                className={`px-3 py-1 rounded font-semibold ${
                  selectedMetricView === 'provincias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Por Província
              </button>
              <button
                onClick={() => setSelectedMetricView('categorias')}
                className={`px-3 py-1 rounded font-semibold ${
                  selectedMetricView === 'categorias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Por Ameaça
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Ocorrências Totais</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-black text-slate-900">{totalOccurrences}</strong>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14% vs ago
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">11 províncias conectadas</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Taxa de Resolução</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-black text-slate-900">{resolutionRate}%</strong>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8% meta anual
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Brigadas municipais mobilizadas</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Fundos Mobilizados</span>
            <Coins className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-black text-slate-900">
              {(totalFundsMZN / 1000000).toFixed(2)}M
            </strong>
            <span className="text-[10px] font-bold text-slate-500">MZN</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Auditados com prestação pública</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Voluntários no Terreno</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-black text-slate-900">{totalVolunteers}</strong>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +45 este mês
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Com certificados emitidos</p>
        </div>
      </div>

      {/* Dynamic View Sections */}
      {selectedMetricView === 'provincias' ? (
        /* Provincial Comparison Grid & Recharts Bar Chart */
        <div className="space-y-6">
          <ProvinceOccurrencesBarChart occurrences={occurrences} />

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 mb-4">
              Comparativo de Vulnerabilidade e Atividade por Província
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(MOZAMBIQUE_PROVINCES).map((prov) => {
              const count = occurrences.filter((o) => o.province === prov.name).length;
              return (
                <div key={prov.name} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">{prov.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      Risco {prov.vulnerabilityIndex}%
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Ocorrências ativas:</span>
                      <strong className="text-slate-800">{count}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Capital:</span>
                      <span className="text-slate-700">{prov.capital}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block mb-1">Ameaça crítica:</span>
                    <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {prov.dominantThreats[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      ) : selectedMetricView === 'categorias' ? (
        /* Category Breakdown */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 mb-4">
            Distribuição de Ocorrências por Tipologia Ambiental
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalOccurrences) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span>{count} ocorrências ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* General Overview: Active Projects & Recent Interventions */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Projetos com Maior Impacto em Andamento</span>
              <span className="text-slate-400 font-normal text-[11px]">{projects.length} projetos monitorados</span>
            </h3>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/30 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{proj.title}</h4>
                      <p className="text-[10px] text-slate-500">{proj.leadEntity} • {proj.province}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      {proj.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Progresso: {proj.keyMetricAchieved}</span>
                      <strong className="text-emerald-700">{proj.progress}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Privilégios do Perfil: {activeRole.toUpperCase()}
            </h3>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Como <strong>{activeRole}</strong>, você possui acesso configurado para:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                {activeRole === 'cidadao' && (
                  <>
                    <li>Submeter denúncias georreferenciadas anónimas ou públicas.</li>
                    <li>Rastrear protocolos e acumular reputação de guardião ambiental.</li>
                    <li>Inscrever-se em campanhas de voluntariado comunitário.</li>
                  </>
                )}
                {activeRole === 'tecnico' && (
                  <>
                    <li>Validar ocorrências reportadas no terreno com parecer técnico.</li>
                    <li>Atualizar progresso de tarefas de campo e fotos de evidência.</li>
                    <li>Configurar regras de alerta precoce sem programação.</li>
                  </>
                )}
                {activeRole === 'gestor' && (
                  <>
                    <li>Aceder a dashboards interprovinciais comparativos.</li>
                    <li>Alocar orçamentos e aprovar planos de contingência de ciclones.</li>
                    <li>Exportar relatórios agendados automáticos para entidades do Estado.</li>
                  </>
                )}
                {activeRole === 'instituicao' && (
                  <>
                    <li>Candidatar a instituição ao Selo Verde Moçambique (ECO-CERT).</li>
                    <li>Publicar campanhas de financiamento transparente (ECO-FUND).</li>
                    <li>Integrar dados via chaves de acesso no ECO-API.</li>
                  </>
                )}
                {activeRole === 'admin' && (
                  <>
                    <li>Auditoria completa de logs e histórico de alterações (ECO-DATA).</li>
                    <li>Gestão de utilizadores, equipas de intervenção e chaves de API.</li>
                    <li>Supervisão global da infraestrutura nacional ECO-MZ 360.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

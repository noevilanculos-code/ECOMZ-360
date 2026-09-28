import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  TreePine,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Copy,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { EnvironmentalProject } from '../types';

interface EcoSimProps {
  onExportToProject: (draft: Partial<EnvironmentalProject>) => void;
}

interface Scenario {
  id: string;
  name: string;
  reforestationHa: number;
  wasteRecyclingPercent: number;
  mangroveKm: number;
  solarBudgetMZN: number; // in thousands MZN
  targetHorizon: 1 | 5 | 10;
}

export const EcoSim: React.FC<EcoSimProps> = ({ onExportToProject }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'sc-1',
      name: 'Cenário A: Intervenção Costeira & Mangais (Sofala/Zambézia)',
      reforestationHa: 250,
      wasteRecyclingPercent: 40,
      mangroveKm: 45,
      solarBudgetMZN: 1500000,
      targetHorizon: 5
    },
    {
      id: 'sc-2',
      name: 'Cenário B: Reflorestamento Intensivo Miombo (Niassa/Manica)',
      reforestationHa: 800,
      wasteRecyclingPercent: 25,
      mangroveKm: 10,
      solarBudgetMZN: 900000,
      targetHorizon: 5
    }
  ]);

  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-1');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const updateActiveScenario = (updates: Partial<Scenario>) => {
    setScenarios((prev) =>
      prev.map((sc) => (sc.id === activeScenarioId ? { ...sc, ...updates } : sc))
    );
  };

  const handleAddScenario = () => {
    if (scenarios.length >= 3) return;
    const newId = `sc-${scenarios.length + 1}`;
    const newScenario: Scenario = {
      id: newId,
      name: `Cenário ${String.fromCharCode(65 + scenarios.length)}: Transição Verde`,
      reforestationHa: 400,
      wasteRecyclingPercent: 50,
      mangroveKm: 25,
      solarBudgetMZN: 2000000,
      targetHorizon: 5
    };
    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newId);
  };

  // Predictive calculations based on scientific baseline for Mozambique ecosystems
  const calculateOutcomes = (s: Scenario) => {
    const years = s.targetHorizon;
    // 1 ha native forest captures ~12 tons CO2/year in Mozambique
    // 1 km mangrove captures ~35 tons CO2/year + attenuates storm surges
    const carbonCapturedTonnes = Math.round(
      (s.reforestationHa * 12 + s.mangroveKm * 35) * years
    );
    // Green jobs: ~1 job per 5 ha restored or 1 km mangrove + recycling staff
    const greenJobsCreated = Math.round(
      s.reforestationHa * 0.2 + s.mangroveKm * 1.5 + s.wasteRecyclingPercent * 0.8
    );
    // Flood risk reduction percentage (capped at 75%)
    const floodRiskReduction = Math.min(
      Math.round(s.mangroveKm * 0.8 + s.reforestationHa * 0.04),
      75
    );
    // Economic return from avoided disaster losses & recyclables in MZN
    const economicReturnMZN = Math.round(
      (carbonCapturedTonnes * 1200 + s.wasteRecyclingPercent * 150000 + s.mangroveKm * 300000) * (years * 0.6)
    );

    return {
      carbonCapturedTonnes,
      greenJobsCreated,
      floodRiskReduction,
      economicReturnMZN
    };
  };

  const handleExportProject = (s: Scenario) => {
    const outcomes = calculateOutcomes(s);
    const draft: Partial<EnvironmentalProject> = {
      title: `Projeto derivado do ${s.name}`,
      category: s.mangroveKm > 20 ? 'Destruição de Mangais' : 'Desmatamento',
      province: 'Sofala',
      district: 'Beira e Litoral',
      leadEntity: 'Consórcio ECO-SIM & Iniciativa Comunitária Local',
      status: 'Planeado',
      progress: 0,
      budgetTotalMZN: s.solarBudgetMZN + s.reforestationHa * 3000,
      budgetRaisedMZN: 0,
      startDate: new Date().toISOString().substring(0, 10),
      targetDate: '2028-12-31',
      description: `Projeto gerado a partir do simulador preditivo ECO-SIM. Meta de captura de ${outcomes.carbonCapturedTonnes.toLocaleString()} toneladas de CO₂ e criação de ${outcomes.greenJobsCreated} postos de trabalho verdes.`,
      keyMetric: 'Hectares / Km recuperados',
      keyMetricAchieved: `0 / ${s.reforestationHa + s.mangroveKm}`,
      volunteerSpots: Math.round(outcomes.greenJobsCreated * 2),
      volunteersEnrolled: 0
    };

    onExportToProject(draft);
    setExportNotification(`Cenário exportado com sucesso para o ECO-PROJECTS!`);
    setTimeout(() => setExportNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>ECO-SIM • Simulador Preditivo de Intervenções</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Projeção de Cenários e Transição Ecológica
            </h2>
            <p className="text-xs text-slate-500">
              Ajuste parâmetros de restauração, simule impactos cumulativos a 1, 5 ou 10 anos e converta simulações diretamente em projetos operacionais.
            </p>
          </div>

          {scenarios.length < 3 && (
            <button
              onClick={handleAddScenario}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Cenário Comparativo ({scenarios.length}/3)</span>
            </button>
          )}
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto text-xs">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap border transition-all ${
                activeScenarioId === sc.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {exportNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Simulator Inputs & Interactive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">Variáveis de Intervenção</h3>
            <p className="text-[11px] text-slate-500">
              Modifique os parâmetros para simular os ganhos ambientais e económicos na bacia territorial.
            </p>
          </div>

          {/* Scenario Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cenário</label>
            <input
              type="text"
              value={activeScenario.name}
              onChange={(e) => updateActiveScenario({ name: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Horizon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Horizonte de Projeção Temporal</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map((horizon) => (
                <button
                  key={horizon}
                  type="button"
                  onClick={() => updateActiveScenario({ targetHorizon: horizon as 1 | 5 | 10 })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    activeScenario.targetHorizon === horizon
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {horizon} {horizon === 1 ? 'Ano' : 'Anos'}
                </button>
              ))}
            </div>
          </div>

          {/* Slider 1: Reforestation */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Reflorestamento de Espécies Nativas</span>
              <span className="font-bold text-emerald-700">{activeScenario.reforestationHa} ha</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="25"
              value={activeScenario.reforestationHa}
              onChange={(e) => updateActiveScenario({ reforestationHa: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">Meta recomendada: 200 ha a 1000 ha</span>
          </div>

          {/* Slider 2: Mangroves */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Restauração de Faixas de Mangal</span>
              <span className="font-bold text-teal-700">{activeScenario.mangroveKm} km costeiro</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={activeScenario.mangroveKm}
              onChange={(e) => updateActiveScenario({ mangroveKm: Number(e.target.value) })}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">Reduz impacto de marés e ciclones na costa</span>
          </div>

          {/* Slider 3: Recycling */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Taxa de Recolha & Reciclagem de Resíduos</span>
              <span className="font-bold text-blue-700">{activeScenario.wasteRecyclingPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={activeScenario.wasteRecyclingPercent}
              onChange={(e) => updateActiveScenario({ wasteRecyclingPercent: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">Desvia plásticos dos sistemas de drenagem pluvial</span>
          </div>

          {/* Action: Export to Project */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleExportProject(activeScenario)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Cenário como Projeto no ECO-PROJECTS</span>
            </button>
          </div>
        </div>

        {/* Outcomes & Multi-Scenario Comparison Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Scenario Impact Cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Impacto Projetado para {activeScenario.targetHorizon} {activeScenario.targetHorizon === 1 ? 'Ano' : 'Anos'} ({activeScenario.name})</span>
            </h3>

            {(() => {
              const res = calculateOutcomes(activeScenario);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs">
                    <span className="text-[10px] font-semibold text-emerald-800 block">Carbono Capturado</span>
                    <strong className="text-base text-emerald-950 block mt-0.5">
                      {res.carbonCapturedTonnes.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-emerald-700">toneladas de CO₂ eq</span>
                  </div>

                  <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-100 text-xs">
                    <span className="text-[10px] font-semibold text-teal-800 block">Redução Risco Cheia</span>
                    <strong className="text-base text-teal-950 block mt-0.5">
                      -{res.floodRiskReduction}%
                    </strong>
                    <span className="text-[10px] text-teal-700">amortecimento de ondas</span>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                    <span className="text-[10px] font-semibold text-blue-800 block">Empregos Verdes</span>
                    <strong className="text-base text-blue-950 block mt-0.5">
                      +{res.greenJobsCreated}
                    </strong>
                    <span className="text-[10px] text-blue-700">postos comunitários</span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-xs">
                    <span className="text-[10px] font-semibold text-amber-800 block">Poupança Estimada</span>
                    <strong className="text-base text-amber-950 block mt-0.5">
                      {(res.economicReturnMZN / 1000000).toFixed(1)}M
                    </strong>
                    <span className="text-[10px] text-amber-700">Meticais (MZN)</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Side-by-Side Comparison of Scenarios */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Comparação Lado a Lado de Cenários Alternativos</span>
              <span className="text-[11px] text-slate-400 font-normal">{scenarios.length} cenários ativos</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Métrica</th>
                    {scenarios.map((s) => (
                      <th key={s.id} className="pb-2 font-bold text-slate-800">
                        {s.name.substring(0, 18)}...
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Reflorestamento (ha)</td>
                    {scenarios.map((s) => (
                      <td key={s.id} className="py-2 font-bold text-emerald-700">
                        {s.reforestationHa} ha
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Mangais Protegidos</td>
                    {scenarios.map((s) => (
                      <td key={s.id} className="py-2 font-bold text-teal-700">
                        {s.mangroveKm} km
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Taxa de Reciclagem</td>
                    {scenarios.map((s) => (
                      <td key={s.id} className="py-2 font-bold text-blue-700">
                        {s.wasteRecyclingPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Carbono Projetado</td>
                    {scenarios.map((s) => {
                      const res = calculateOutcomes(s);
                      return (
                        <td key={s.id} className="py-2 font-bold text-slate-900">
                          {res.carbonCapturedTonnes.toLocaleString()} t
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Geração de Empregos</td>
                    {scenarios.map((s) => {
                      const res = calculateOutcomes(s);
                      return (
                        <td key={s.id} className="py-2 font-bold text-emerald-600">
                          +{res.greenJobsCreated}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600 font-medium">Ação</td>
                    {scenarios.map((s) => (
                      <td key={s.id} className="py-2">
                        <button
                          onClick={() => handleExportProject(s)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded"
                        >
                          Exportar
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

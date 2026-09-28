import React, { useState } from 'react';
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
  FileText,
  Download,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { MozambiqueProvince, EnvironmentalCategory, SeverityLevel } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

export const EcoDiag: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<MozambiqueProvince>('Sofala');
  const [selectedMonth, setSelectedMonth] = useState<string>('Setembro');
  const [selectedThreat, setSelectedThreat] = useState<EnvironmentalCategory>('Destruição de Mangais');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Seasonality calculation for Mozambique:
  // Rainy/Cyclone season: Nov - Apr
  // Dry/Fire season: May - Oct
  const isWetSeason = ['Novembro', 'Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Abril'].includes(selectedMonth);

  const calculateRiskIndex = () => {
    let score = MOZAMBIQUE_PROVINCES[selectedProvince].vulnerabilityIndex;
    if (isWetSeason && ['Ciclones Tropicais', 'Inundações/Cheias', 'Erosão Costeira'].some(t => t.includes(selectedThreat))) {
      score += 12;
    } else if (!isWetSeason && selectedThreat === 'Queimadas Descontroladas') {
      score += 18;
    }
    return Math.min(score, 98);
  };

  const currentRiskScore = calculateRiskIndex();

  const getRiskClassification = (score: number): { label: SeverityLevel; color: string; desc: string } => {
    if (score >= 85) {
      return {
        label: 'Crítico',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        desc: 'Intervenção governamental e mobilização comunitária imediata recomendada.'
      };
    }
    if (score >= 70) {
      return {
        label: 'Alto',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        desc: 'Vigilância reforçada e implementação de medidas de mitigação preventiva.'
      };
    }
    if (score >= 50) {
      return {
        label: 'Médio',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        desc: 'Monitorização rotineira e ações de sensibilização cidadã.'
      };
    }
    return {
      label: 'Baixo',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      desc: 'Condições ecológicas estáveis com baixa probabilidade de desastre iminente.'
    };
  };

  const riskClass = getRiskClassification(currentRiskScore);

  const getRecommendations = () => {
    if (selectedThreat === 'Destruição de Mangais') {
      return [
        'Fiscalização costeira intensiva nos estuários com rondas conjuntas SDAE e Polícia Comunitária.',
        'Estabelecimento urgente de viveiros locais de propágulos de Rhizophora e Avicennia.',
        'Substituição do uso de lenha de mangal por fornos melhorados e biogás comunitário.',
        'Aplicação rigorosa das sanções previstas no Regulamento Florestal (Decreto n.º 12/2002).'
      ];
    }
    if (selectedThreat === 'Queimadas Descontroladas') {
      return [
        'Ativação dos Comités Comunitários de Gestão de Riscos (CLGR) para queima prescrita matinal.',
        'Abertura compulsória de faixas corta-fogo de no mínimo 15 metros ao redor de machambas e florestas.',
        'Campanha de sensibilização em línguas locais (Sena, Ndau, Makhuwa, Changana, Ciyao).',
        'Proibição temporária de queimas agrícolas com velocidade do vento superior a 25 km/h.'
      ];
    }
    if (selectedThreat === 'Poluição Hídrica') {
      return [
        'Auditoria ambiental compulsória às indústrias e concessões mineiras adjacentes.',
        'Recolha de amostras de pH, turbidez e metais pesados com registo no módulo ECO-DATA.',
        'Interdição preventiva do consumo humano direto e abastecimento alternativo por camiões-cisterna.',
        'Restauração das matas ciliares na bacia hidrográfica para filtragem natural de sedimentos.'
      ];
    }
    return [
      'Fortalecimento da infraestrutura de drenagem sustentável e bacias de retenção.',
      'Reforço da recolha seletiva com cooperativas locais e valorização de resíduos plásticos.',
      'Monitorização via satélite com disparo de avisos preventivos no ECO-ALERT.'
    ];
  };

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>ECO-DIAG • Diagnóstico Ambiental Inteligente</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Análise Preditiva e Matriz de Risco Territorial
            </h2>
            <p className="text-xs text-slate-500">
              Cruzamento de dados históricos, padrões climáticos sazonais e vulnerabilidade provincial de Moçambique.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-2 transition-colors self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Boletim Gerado!' : 'Exportar Boletim Técnico'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Column */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Parâmetros de Análise de Risco</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Província Alvo</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value as MozambiqueProvince)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.keys(MOZAMBIQUE_PROVINCES).map((p) => (
                <option key={p} value={p}>
                  {p} (Vulnerabilidade Base: {MOZAMBIQUE_PROVINCES[p as MozambiqueProvince].vulnerabilityIndex}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mês / Época Sazonal</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m} — {['Novembro', 'Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Abril'].includes(m) ? 'Estação Chuvosa & Ciclónica' : 'Estação Seca & Queimadas'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fator de Ameaça Primário</label>
            <select
              value={selectedThreat}
              onChange={(e) => setSelectedThreat(e.target.value as EnvironmentalCategory)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Destruição de Mangais">Destruição de Mangais</option>
              <option value="Queimadas Descontroladas">Queimadas Descontroladas</option>
              <option value="Poluição Hídrica">Poluição Hídrica</option>
              <option value="Erosão Costeira/Pluvial">Erosão Costeira/Pluvial</option>
              <option value="Resíduos Sólidos Urbanos">Resíduos Sólidos Urbanos</option>
              <option value="Desmatamento">Desmatamento de Florestas Nativas</option>
            </select>
          </div>

          {/* Sazonal Insight Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Regime Climático Identificado:</span>
            </span>
            <p className="text-slate-600 text-[11px]">
              {isWetSeason
                ? 'Verão Austral com convergência intertropical. Alto índice pluviométrico, suscetibilidade a depressões tropicais no Canal de Moçambique e cheias ribeirinhas.'
                : 'Inverno e Primavera secos. Ventos moderados a fortes e humidade relativa inferior a 35%, potencializando a propagação rápida do fogo descontrolado no mato.'}
            </p>
          </div>
        </div>

        {/* Diagnosis & Recommendations Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Computed Score Display */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Índice Sintético de Risco Diagnosticado:</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl font-black text-slate-900">{currentRiskScore}/100</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskClass.color}`}>
                    Nível {riskClass.label}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-slate-500 block">Território Analisado:</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedProvince} • {selectedMonth}
                </span>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    currentRiskScore >= 85
                      ? 'bg-rose-600'
                      : currentRiskScore >= 70
                      ? 'bg-orange-500'
                      : currentRiskScore >= 50
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${currentRiskScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Resiliente)</span>
                <span>50 (Alerta Moderado)</span>
                <span>100 (Emergência Crítica)</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <strong>Parecer Técnico:</strong> {riskClass.desc}
            </p>
          </div>

          {/* Technical Recommendations List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Medidas e Ações de Intervenção Recomendadas</span>
            </h3>

            <div className="space-y-2">
              {getRecommendations().map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs p-2 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-snug">{rec}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
              <span>Fundamentação: Lei n.º 20/97 do Ambiente & PRD ECO-MZ 360</span>
              <span className="text-blue-600 font-medium">Recomendações exportáveis para ECO-PROJECTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

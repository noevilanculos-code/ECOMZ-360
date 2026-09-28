import React, { useState } from 'react';
import {
  Code2,
  Database,
  Key,
  Copy,
  CheckCircle2,
  Download,
  Terminal,
  Play,
  Globe,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ApiPortalPage: React.FC = () => {
  const { occurrences, projects } = useApp();
  const [activeTab, setActiveTab] = useState<'docs' | 'explorer' | 'export'>('docs');
  const [apiKey, setApiKey] = useState('ecomz_live_99f482a17cb4c3d82');
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/ocorrencias');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    {
      path: '/api/ocorrencias',
      method: 'GET',
      description: 'Retorna a lista georreferenciada de denúncias e ocorrências validadas em Moçambique.',
      sampleData: occurrences.slice(0, 3).map((o) => ({
        protocolo: o.protocol,
        titulo: o.title,
        categoria: o.category,
        gravidade: o.severity,
        provincia: o.province,
        distrito: o.district,
        coordenadas: o.coordinates,
        status: o.status,
        data: o.timestamp
      }))
    },
    {
      path: '/api/projetos',
      method: 'GET',
      description: 'Retorna os projetos ecológicos ativos, orçamento captado e metas de reflorestamento.',
      sampleData: projects.slice(0, 2).map((p) => ({
        id: p.id,
        titulo: p.title,
        provincia: p.province,
        orcamentoTotalMZN: p.budgetTotalMZN,
        progressoPercentual: p.progress,
        status: p.status
      }))
    },
    {
      path: '/api/indicadores',
      method: 'GET',
      description: 'Índices ecológicos consolidados: qualidade da água, desmatamento e emissões evitadas.',
      sampleData: {
        coberturaFlorestalNacionalHa: 34200000,
        mangaalRestauradoHa: 1420,
        toneladasCO2Evitadas: 284000,
        taxaResolucaoOcorrencias: '76.8%'
      }
    },
    {
      path: '/api/alertas',
      method: 'GET',
      description: 'Alertas ambientais urgentes e focos de calor ativos detectados por satélite.',
      sampleData: [
        {
          id: 'alt-01',
          tipo: 'Queimada Descontrolada',
          provincia: 'Zambézia',
          nivelRisco: 'Crítico',
          emissao: '2026-09-26T08:00:00Z'
        }
      ]
    }
  ];

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleGenerateNewKey = () => {
    const newKey = `ecomz_live_${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 11)}`;
    setApiKey(newKey);
    setCopiedKey(false);
  };

  const handleTestEndpoint = () => {
    setIsLoading(true);
    setTimeout(() => {
      const ep = endpoints.find((e) => e.path === selectedEndpoint);
      if (ep) {
        setApiResponse(JSON.stringify(ep.sampleData, null, 2));
      }
      setIsLoading(false);
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Protocolo,Titulo,Categoria,Gravidade,Provincia,Distrito,Data,Estado\n';
    const rows = occurrences
      .map(
        (o) =>
          `"${o.id}","${o.protocol}","${o.title}","${o.category}","${o.severity}","${o.province}","${o.district}","${o.timestamp}","${o.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecomz-dados-abertos-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: occurrences.map((o) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [o.coordinates.lng, o.coordinates.lat]
        },
        properties: {
          id: o.id,
          protocol: o.protocol,
          title: o.title,
          category: o.category,
          severity: o.severity,
          province: o.province,
          district: o.district,
          status: o.status
        }
      }))
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecomz-geodata-${new Date().toISOString().substring(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <Code2 className="w-3.5 h-3.5 text-[#00B956]" />
              <span>Portal de Dados Abertos para Pesquisa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Acesso Programático & Dados Abertos
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Disponibilização pública e segura de dados ambientais moçambicanos para investigadores, universidades (UEM, UniLúrio, UniZambeze), ONGs e agências de cooperação técnica internacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handleExportGeoJSON}
              className="px-3.5 py-2 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Exportar GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Documentação & Endpoints
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'explorer'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Explorador Interativo (Live Console)
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'export'
              ? 'bg-[#00A651] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Chave de Autenticação (API Key)
        </button>
      </div>

      {/* Tab 1: Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs font-bold">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {ep.path}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ep.description}
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Exemplo de Resposta (JSON):
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-32">
                    {JSON.stringify(ep.sampleData, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Explorer */}
      {activeTab === 'explorer' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-24 shrink-0 px-3 py-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-mono text-xs font-bold text-center">
              GET
            </div>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {endpoints.map((ep) => (
                <option key={ep.path} value={ep.path}>
                  {ep.path} — {ep.description.substring(0, 45)}...
                </option>
              ))}
            </select>
            <button
              onClick={handleTestEndpoint}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'A Enviar Requisição...' : 'Executar Chamada'}</span>
            </button>
          </div>

          {/* Response Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>Consola de Resposta HTTP (Status: 200 OK)</span>
              </span>
              <span className="text-[11px] text-slate-400">Content-Type: application/json; charset=utf-8</span>
            </div>

            <div className="rounded-2xl bg-slate-950 text-emerald-400 p-5 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800 shadow-inner">
              {apiResponse ? (
                <pre>{apiResponse}</pre>
              ) : (
                <span className="text-slate-500">
                  Clique em "Executar Chamada" acima para testar o endpoint em tempo real...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Export & Auth */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Chave de API do Utilizador (Bearer Token)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Utilize esta chave no cabeçalho <code className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.5 rounded">Authorization: Bearer {'<token>'}</code> para aceder aos dados via scripts Python, R ou aplicações externas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
              {apiKey}
            </span>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyKey}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={handleGenerateNewKey}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Regenerar
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Os dados disponibilizados pela API pública são previamente anonimizados, respeitando a privacidade dos cidadãos denunciantes em conformidade com o Regulamento de Dados e o PRD do ECO-MZ 360.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Award,
  Database,
  Code2,
  Download,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  Key,
  ShieldCheck,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { Occurrence, MozambiqueProvince } from '../types';

interface EcoCertDataProps {
  occurrences: Occurrence[];
}

export const EcoCertData: React.FC<EcoCertDataProps> = ({ occurrences }) => {
  const [subTab, setSubTab] = useState<'cert' | 'data' | 'api'>('cert');
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey] = useState('ecomz_live_99f482a17cb4c3d82');

  // Eco-Cert evaluation state
  const [companyName, setCompanyName] = useState('Empresa Verde do Zambeze, Lda.');
  const [recycledRatio, setRecycledRatio] = useState('65');
  const [renewableEnergy, setRenewableEnergy] = useState('40');
  const [communitySupport, setCommunitySupport] = useState(true);
  const [certResult, setCertResult] = useState<'Bronze' | 'Prata' | 'Ouro' | null>('Prata');

  const handleEvaluateCert = (e: React.FormEvent) => {
    e.preventDefault();
    const score = Number(recycledRatio) * 0.4 + Number(renewableEnergy) * 0.4 + (communitySupport ? 20 : 0);
    if (score >= 75) setCertResult('Ouro');
    else if (score >= 50) setCertResult('Prata');
    else setCertResult('Bronze');
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
    link.setAttribute('download', `ecomz-ocorrencias-${new Date().toISOString().substring(0, 10)}.csv`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>ECO-CERT & ECO-DATA & ECO-API</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Certificação Ecológica e Dados Abertos de Moçambique
          </h2>
          <p className="text-xs text-slate-500">
            Selo Verde Moçambique, repositório de dados ambientais abertos e integração por API REST para investigadores e parceiros.
          </p>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setSubTab('cert')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1 ${
              subTab === 'cert' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Selo Verde (ECO-CERT)</span>
          </button>
          <button
            onClick={() => setSubTab('data')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1 ${
              subTab === 'data' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Repositório (ECO-DATA)</span>
          </button>
          <button
            onClick={() => setSubTab('api')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1 ${
              subTab === 'api' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>API REST (ECO-API)</span>
          </button>
        </div>
      </div>

      {subTab === 'cert' ? (
        /* ECO-CERT View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Auto-Avaliação de Conformidade para Selo Verde Moçambique
            </h3>

            <form onSubmit={handleEvaluateCert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Empresa / Instituição</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Taxa de Desvio de Resíduos de Aterros (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={recycledRatio}
                  onChange={(e) => setRecycledRatio(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Percentagem de Energia Renovável Utilizada (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={renewableEnergy}
                  onChange={(e) => setRenewableEnergy(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={communitySupport}
                    onChange={(e) => setCommunitySupport(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">
                    Apoio comprovado a projetos comunitários locais de reflorestamento / mangais
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Calcular Nível de Selo Verde
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                Classificação Obtida & Selo Oficial
              </h3>

              {certResult && (
                <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/50 text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <Award className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-amber-950">
                    Selo Verde Moçambique — Categoria {certResult}
                  </h4>
                  <p className="text-xs text-amber-900 max-w-sm mx-auto">
                    Atribuído provisoriamente a <strong>{companyName}</strong> sujeito a vistoria presencial das Direcções Provinciais de Terra e Ambiente.
                  </p>
                  <div className="inline-block font-mono text-[10px] text-amber-800 bg-white/80 px-3 py-1 rounded border border-amber-200">
                    SELO-VERDE-MZ-2026-{Math.floor(1000 + Math.random() * 9000)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Critérios Oficiais Regulamentares:</span>
              <p>• Conformidade estrita com a Avaliação de Impacto Ambiental (Decreto n.º 54/2015).</p>
              <p>• Regularidade no pagamento de taxas de efluentes e emissões industriais.</p>
              <p>• Incentivo fiscal municipal com dedução de até 10% no Imposto Predial Autárquico.</p>
            </div>
          </div>
        </div>
      ) : subTab === 'data' ? (
        /* ECO-DATA View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Repositório de Dados Ambientais Abertos</h3>
              <p className="text-xs text-slate-500">
                Aceda e descarregue os registos georreferenciados para investigação científica e planeamento territorial.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={handleExportGeoJSON}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar GeoJSON</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Protocolo</th>
                  <th className="py-2.5 px-3">Título</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Província</th>
                  <th className="py-2.5 px-3">Gravidade</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {occurrences.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{o.protocol}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{o.title}</td>
                    <td className="py-2 px-3 text-slate-600">{o.category}</td>
                    <td className="py-2 px-3 text-slate-700">{o.province}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {o.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{o.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ECO-API View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Documentação da API REST Nacional</h3>
              <p className="text-xs text-slate-500">
                Integração programática com sistemas de GIS, centros de investigação universitários e aplicações parceiras.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-700 font-bold">{apiKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="text-emerald-700 font-bold ml-2 hover:underline"
              >
                {copiedKey ? 'Copiada!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="text-slate-400"># 1. Obter ocorrências por província</div>
              <div className="text-emerald-400">GET /api/v1/occurrences?province=Sofala&status=Validado</div>
              <div className="text-slate-400 pt-2"># 2. Obter alertas ativos do INGD / INAM</div>
              <div className="text-emerald-400">GET /api/v1/alerts?level=Vermelho</div>
              <div className="text-slate-400 pt-2"># 3. Submeter relatório com chave de autenticação</div>
              <div className="text-blue-400">POST /api/v1/occurrences</div>
              <div className="text-slate-400">Header: Authorization: Bearer {apiKey}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

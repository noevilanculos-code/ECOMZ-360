import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  FileText,
  Heart,
  Share2,
  Download,
  ShieldCheck,
  Building,
  CreditCard,
  Phone,
  Filter
} from 'lucide-react';
import { EnvironmentalProject, MozambiqueProvince } from '../types';
import { INITIAL_PROJECTS } from '../data/mockData';

interface EcoFundProps {
  projects?: EnvironmentalProject[];
}

export const EcoFund: React.FC<EcoFundProps> = ({ projects = INITIAL_PROJECTS }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [filterProvince, setFilterProvince] = useState<string>('Todas');
  const [donationAmount, setDonationAmount] = useState<string>('500');
  const [donorName, setDonorName] = useState<string>('Cidadão Amigo do Mangal');
  const [donationMethod, setDonationMethod] = useState<'M-Pesa' | 'E-Mola' | 'BIM/BCI'>('M-Pesa');
  const [donationSuccess, setDonationSuccess] = useState<boolean>(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Detailed financial utilization breakdown associated with ECO-ACTION activities
  const financialReports: Record<
    string,
    Array<{ item: string; valorMZN: number; categoria: string; data: string; auditoria: string }>
  > = {
    'proj-1': [
      { item: 'Aquisição de 50.000 sementes e propágulos de Mangal Vermelho', valorMZN: 850000, categoria: 'Insumos Biológicos', data: '2026-02-10', auditoria: 'Comprovativo #MTA-771' },
      { item: 'Subsídios diários e transporte a 84 voluntários e pescadores da Beira', valorMZN: 620000, categoria: 'Mobilização Comunitária', data: '2026-02-28', auditoria: 'Folha de Presença #AQUA-09' },
      { item: 'Equipamentos de campo (botas, luvas, pás de estuário e cercas de proteção)', valorMZN: 410000, categoria: 'Ferramentas', data: '2026-03-05', auditoria: 'Fatura Proforma #EQUIP-22' },
      { item: 'Sessões de formação escolar sobre marés e proteção costeira', valorMZN: 120000, categoria: 'Educação Ambiental', data: '2026-03-12', auditoria: 'Relatório #EDU-14' }
    ]
  };

  const currentReport = financialReports[selectedProjectId] || [
    { item: 'Mobilização de brigadas e equipamentos de proteção', valorMZN: 350000, categoria: 'Operações de Campo', data: '2026-03-01', auditoria: 'Auditado' },
    { item: 'Monitorização via drones e satélite com técnicos florestais', valorMZN: 280000, categoria: 'Tecnologia & Dados', data: '2026-03-15', auditoria: 'Auditado' }
  ];

  const totalSpentMZN = currentReport.reduce((acc, curr) => acc + curr.valorMZN, 0);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationSuccess(true);
    setTimeout(() => {
      setDonationSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>ECO-FUND • Financiamento e Transparência Financeira</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Apoio a Projetos Ambientais e Prestação de Contas Pública
          </h2>
          <p className="text-xs text-slate-500">
            Conforme a Secção 2.3 do Documento de Extensão Funcional v1.1: orçamentos abertos, selo de "Projeto Financiado" e relatório integrado ao ECO-ACTION.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>100% Auditado</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Projects List + Selected Project Fund Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Projects Fund Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Projetos com Campanhas de Financiamento
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Moeda: Meticais (MZN)</span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const percentRaised = Math.min(100, Math.round((proj.budgetRaisedMZN / proj.budgetTotalMZN) * 100));
              const isFunded = percentRaised >= 80;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {proj.province} • {proj.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{proj.title}</h4>
                    </div>

                    {isFunded && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>Selo Financiado</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Meta: {proj.budgetTotalMZN.toLocaleString('pt-MZ')} MZN</span>
                      <span className="text-emerald-700 font-bold">{percentRaised}% financiado</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentRaised}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                      <span>Angariado: {proj.budgetRaisedMZN.toLocaleString('pt-MZ')} MZN</span>
                      <span>Líder: {proj.leadEntity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Fund Page & Donation Form (7 cols) */}
        {selectedProject && (
          <div className="lg:col-span-7 space-y-5">
            {/* Top Project Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 font-bold mb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>Entidade Gestora: {selectedProject.leadEntity}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{selectedProject.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{selectedProject.description}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Financiado</span>
                  <span className="text-lg font-black text-emerald-900">
                    {selectedProject.budgetRaisedMZN.toLocaleString('pt-MZ')} MZN
                  </span>
                </div>
              </div>

              {/* Financial Utilization Report (Secção 2.3) */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Relatório de Utilização de Fundos (ECO-ACTION)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    Total Executado: {totalSpentMZN.toLocaleString('pt-MZ')} MZN
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">Item / Despesa Operacional</th>
                        <th className="p-2.5">Categoria</th>
                        <th className="p-2.5">Valor</th>
                        <th className="p-2.5 text-right">Auditoria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {currentReport.map((rep, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-900">{rep.item}</td>
                          <td className="p-2.5 text-slate-600">{rep.categoria}</td>
                          <td className="p-2.5 font-bold text-emerald-800">{rep.valorMZN.toLocaleString('pt-MZ')} MZN</td>
                          <td className="p-2.5 text-right text-emerald-600 font-semibold">{rep.auditoria}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Donation / Support Box */}
            <div className="bg-linear-to-r from-emerald-950 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Apoiar este Projeto Ambiental em Moçambique</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Doações diretas via M-Pesa, E-Mola ou parceria bancária institucional com emissão de recibo digital de dedução ecológica.
                </p>
              </div>

              {donationSuccess ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center space-y-1 animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm text-emerald-300">Apoio Registado com Sucesso!</p>
                  <p className="text-xs text-slate-200">
                    Obrigado por apoiar a conservação ambiental em Moçambique. Um comprovativo foi gerado no sistema.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Nome do Doador / Parceiro</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Valor (MZN)</label>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Método de Apoio</label>
                      <select
                        value={donationMethod}
                        onChange={(e) => setDonationMethod(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white"
                      >
                        <option value="M-Pesa" className="text-slate-900">M-Pesa (Vodacom)</option>
                        <option value="E-Mola" className="text-slate-900">E-Mola (Movitel)</option>
                        <option value="BIM/BCI" className="text-slate-900">Transferência Bancária</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <span>Confirmar Contribuição de {Number(donationAmount).toLocaleString('pt-MZ')} MZN</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

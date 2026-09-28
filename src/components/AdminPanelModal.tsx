import React, { useState } from 'react';
import {
  Settings,
  Users,
  MapPin,
  FolderTree,
  Sliders,
  ShieldCheck,
  Database,
  X,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [activeSection, setActiveSection] = useState<
    'grid' | 'utilizadores' | 'localidades' | 'categorias' | 'config' | 'logs' | 'backup'
  >('grid');

  if (!isOpen) return null;

  // 6 Administration modules matching Tela 12 2x3 grid in Mockup 17_08_41
  const adminModules = [
    {
      id: 'utilizadores',
      title: '1. Gestão de Utilizadores',
      desc: 'Administração de contas, papéis (Cidadão, Técnico, Gestor, Instituição, Admin) e permissões de acesso.',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: '1.246 Registados'
    },
    {
      id: 'localidades',
      title: '2. Localidades e Províncias',
      desc: 'Configuração das 11 províncias de Moçambique, postos administrativos, distritos e bacias hidrográficas.',
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: '11 Províncias / 154 Distritos'
    },
    {
      id: 'categorias',
      title: '3. Categorias Ambientais',
      desc: 'Tipificação de agressões (Desmatamento, Queimadas, Mangais, Poluição) e normativas da Lei 20/97.',
      icon: FolderTree,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: '8 Categorias Ativas'
    },
    {
      id: 'config',
      title: '4. Configurações do Sistema',
      desc: 'Regras de alerta automático, parâmetros de cálculo do Selo Verde, canais de SMS e integrações.',
      icon: Sliders,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'v1.1 Produção'
    },
    {
      id: 'logs',
      title: '5. Logs de Auditoria & Segurança',
      desc: 'Registo imutável (ECO-DATA) de todas as alterações com utilizador, IP, carimbo de data/hora e ação.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: 'Auditoria Ativa'
    },
    {
      id: 'backup',
      title: '6. Backup & Exportação de Dados',
      desc: 'Sincronização com banco de dados MySQL (ecomz_db), cópias de segurança em lote e exportações JSON/SQL.',
      icon: Database,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'MySQL Sincronizado'
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  PAINEL DE ADMINISTRAÇÃO
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-300 text-xs">Administração Central</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Painel de Controlo Administrativo ECO-MZ 360
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSection !== 'grid' && (
              <button
                onClick={() => setActiveSection('grid')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                ← Voltar à Grade 2x3
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSection === 'grid' && (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriz de Gestão e Configuração do Sistema
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conforme apresentado na Tela 12 do Mockup Oficial (ChatGPT Image 18 de set. de 2026, 17_08_41.png), selecione um dos 6 módulos administrativos:
                </p>
              </div>

              {/* 2x3 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => setActiveSection(mod.id as any)}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {mod.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {mod.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                        <span>Aceder Configurações</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Summary Strip */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Base de dados MySQL sincronizada • 243 ocorrências, 18 projetos e 11 províncias auditadas.
                  </span>
                </div>
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('php-mysql');
                    }}
                    className="font-bold text-emerald-800 hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Ver Código PHP/MySQL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}

          {activeSection === 'utilizadores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Utilizadores Registados no Sistema (1.246)</h3>
                <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Novo Utilizador</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nome / Identidade</th>
                      <th className="p-3">Perfil / Papel</th>
                      <th className="p-3">Província</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Noé Samuel Vilanculos</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">Administrador</span></td>
                      <td className="p-3">Nacional (Sede)</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                      <td className="p-3 text-right text-slate-500 font-semibold">Editar</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Elias Félix Mufunde</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">Gestor Técnico</span></td>
                      <td className="p-3">Sofala</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                      <td className="p-3 text-right text-slate-500 font-semibold">Editar</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Roque Armando Maurício</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Técnico de Terreno</span></td>
                      <td className="p-3">Zambézia</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                      <td className="p-3 text-right text-slate-500 font-semibold">Editar</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Joel Ali Viano</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Institucional MTA</span></td>
                      <td className="p-3">Maputo Província</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                      <td className="p-3 text-right text-slate-500 font-semibold">Editar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'localidades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Estrutura Territorial de Moçambique</h3>
                <span className="text-xs text-slate-500">11 Províncias Cadastradas no ECO-MAP</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(MOZAMBIQUE_PROVINCES).map(([nome, dados]) => (
                  <div key={nome} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="font-bold text-xs text-slate-900">{nome}</span>
                    <p className="text-[11px] text-slate-500">Capital: {dados.capital}</p>
                    <p className="text-[10px] text-emerald-700 font-mono font-semibold">
                      GPS: {dados.lat}, {dados.lng}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'categorias' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Categorias Ambientais Tipificadas (Lei n.º 20/97)</h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Destruição de Mangais', grav: 'Crítica', desc: 'Corte clandestino em estuários, praias e baías com perda de barreira contra ciclones.' },
                  { name: 'Desmatamento Ilegal', grav: 'Alta', desc: 'Exploração predatória de madeira nativa e corte de floresta Miombo sem licença da AQUA.' },
                  { name: 'Queimadas Descontroladas', grav: 'Alta', desc: 'Queimadas agrícolas de machamba fora de época e incêndios florestais propagados.' },
                  { name: 'Poluição Hídrica', grav: 'Crítica', desc: 'Descarga de efluentes químicos, rejeitos de mineração ou resíduos em cursos de rios.' },
                  { name: 'Resíduos Sólidos Urbanos', grav: 'Média', desc: 'Depósitos clandestinos de plásticos e lixos em praias e áreas urbanas.' }
                ].map((c) => (
                  <div key={c.name} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <p className="text-[11px] text-slate-500">{c.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                      Gravidade: {c.grav}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'config' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Configurações Gerais do Sistema v1.1</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Regras de Alerta Automático (ECO-ALERT)</span>
                    <p className="text-[11px] text-slate-500">Disparo automático quando houver &gt; 5 ocorrências do mesmo tipo num raio de 20km em 7 dias.</p>
                  </div>
                  <span className="text-emerald-700 font-bold">Ativado</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Logs de Auditoria do Sistema (ECO-DATA Audit Trail)</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 flex items-center justify-between text-slate-600">
                  <span className="font-mono text-[11px]">2026-09-22 14:10 • [ADMIN] Noé Samuel aprovou certificação ECO-CERT ID: #882</span>
                  <span className="text-[10px] text-emerald-600 font-bold">SUCESSO</span>
                </div>
                <div className="p-3 bg-slate-50 flex items-center justify-between text-slate-600">
                  <span className="font-mono text-[11px]">2026-09-22 13:45 • [SISTEMA] Deteção de duplicados executada em 243 registos (0 duplicados)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">OK</span>
                </div>
                <div className="p-3 bg-slate-50 flex items-center justify-between text-slate-600">
                  <span className="font-mono text-[11px]">2026-09-22 11:30 • [TECNICO] Elias Mufunde alterou status da ocorrência #occ-1 para 'Em Intervenção'</span>
                  <span className="text-[10px] text-blue-600 font-bold">REGISTADO</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'backup' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Backup e Replicação com MySQL</h3>
              <p className="text-slate-500">
                Conforme definido na arquitetura do projeto, os dados podem ser sincronizados tanto no banco de dados MySQL via PHP (LAMP/XAMPP) quanto na nuvem.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Exportar Dump SQL Completo (database.sql)</span>
                  <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Descarregar .SQL</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Exportar Relatório JSON Anonimizado (ECO-API)</span>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Descarregar .JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Painel Administrativo central • República de Moçambique
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};

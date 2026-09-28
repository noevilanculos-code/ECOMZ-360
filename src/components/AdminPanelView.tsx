import React, { useState } from 'react';
import {
  Settings,
  Users,
  MapPin,
  FolderTree,
  Sliders,
  ShieldCheck,
  Database,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

export const AdminPanelView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'grid' | 'utilizadores' | 'localidades' | 'categorias' | 'config' | 'logs' | 'backup'
  >('grid');

  const adminModules = [
    {
      id: 'utilizadores',
      title: '1. Gestão de Utilizadores',
      desc: 'Administração de contas, papéis (Cidadão, Técnico, Gestor, Instituição, Admin) e permissões de acesso.',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      badge: '1.246 Registados'
    },
    {
      id: 'localidades',
      title: '2. Localidades e Províncias',
      desc: 'Configuração das 11 províncias de Moçambique, postos administrativos, distritos e bacias hidrográficas.',
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      badge: '11 Províncias / 154 Distritos'
    },
    {
      id: 'categorias',
      title: '3. Categorias Ambientais',
      desc: 'Tipificação de agressões (Desmatamento, Queimadas, Mangais, Poluição) e normativas da Lei 20/97.',
      icon: FolderTree,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      badge: '8 Categorias Ativas'
    },
    {
      id: 'config',
      title: '4. Configurações do Sistema',
      desc: 'Regras de alerta automático, parâmetros de cálculo do Selo Verde, canais de SMS e integrações.',
      icon: Sliders,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      badge: 'v1.1 Produção'
    },
    {
      id: 'logs',
      title: '5. Logs de Auditoria & Segurança',
      desc: 'Registo imutável (ECO-DATA) de todas as alterações com utilizador, IP, carimbo de data/hora e ação.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
      badge: 'Auditoria Ativa'
    },
    {
      id: 'backup',
      title: '6. Backup & Exportação de Dados',
      desc: 'Sincronização com banco de dados MySQL (ecomz_db), cópias de segurança em lote e exportações JSON/SQL.',
      icon: Database,
      color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800/60',
      badge: 'MySQL Sincronizado'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header matching Tela 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <img
            src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
            alt="ECO-MZ 360"
            className="w-12 h-12 object-contain shrink-0 drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
            }}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Painel de Administração
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Tela 12 • Matriz 2×3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gestão centralizada de contas de acesso, entidades provinciais, tipologias e políticas de segurança.
            </p>
          </div>
        </div>

        {activeSection !== 'grid' && (
          <button
            onClick={() => setActiveSection('grid')}
            className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            <span>← Voltar à Matriz 2×3</span>
          </button>
        )}
      </div>

      {activeSection === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminModules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => setActiveSection(m.id as any)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-600 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Aceder ao módulo</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              Detalhes de {activeSection}
            </h2>
            <button
              onClick={() => setActiveSection('grid')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Fechar seção
            </button>
          </div>

          {activeSection === 'utilizadores' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                1.246 utilizadores registados (Administradores, Técnicos MTA, Fiscais ANAC, Cidadãos e ONGs).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Papel</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Noé Samuel Vilanculos</td>
                      <td className="p-3 text-slate-500">utilizador@example.invalid</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Admin MTA</span></td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Eng. Amélia Cossa</td>
                      <td className="p-3 text-slate-500">utilizador@example.invalid</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Gestor Ambiental</span></td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Ativo</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'localidades' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
                <div key={prov} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{prov}</p>
                  <p className="text-[10px] text-slate-400">14 Distritos • Ativo</p>
                </div>
              ))}
            </div>
          )}

          {activeSection !== 'utilizadores' && activeSection !== 'localidades' && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Módulo ativo e operacional no ambiente de produção ECO-MZ 360.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

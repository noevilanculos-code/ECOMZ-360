import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  Wrench,
  Building2,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  HeartHandshake,
  DollarSign,
  Code2,
  FileCheck2,
  Activity,
  AlertTriangle,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { CitizenReportTour } from './CitizenReportTour';

export const RoleUtilityBanner: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, setActiveRole } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);

  const roleConfigs: Record<
    UserRole,
    {
      title: string;
      label: string;
      badgeColor: string;
      description: string;
      icon: React.ElementType;
      quickActions: Array<{ label: string; icon: React.ElementType; path: string; primary?: boolean }>;
    }
  > = {
    cidadao: {
      title: 'Espaço do Cidadão Guardião (Citizen)',
      label: 'Citizen (Cidadão)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description:
        'Comunique problemas ambientais no seu bairro ou distrito (com opção de anonimato), acompanhe a resolução pública e participe em ações de voluntariado e reflorestamento.',
      icon: User,
      quickActions: [
        { label: 'Comunicar Ocorrência Ambiental', icon: AlertTriangle, path: '/ocorrencias?novo=true', primary: true },
        { label: 'Recursos & Mudas', icon: HeartHandshake, path: '/recursos-comunitarios' },
        { label: 'Participar em Voluntariado', icon: HeartHandshake, path: '/voluntariado' },
        { label: 'Educação Ambiental', icon: BookOpen, path: '/educacao' }
      ]
    },
    tecnico: {
      title: 'Painel do Inspector Ambiental (Environmental Inspector)',
      label: 'Environmental Inspector (AQUA)',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description:
        'Acesso fiscalizatório: valide denúncias no terreno, emita autos de infração, aceda aos Relatórios Técnicos Oficiais (jsPDF) e audite áreas prioritárias.',
      icon: Wrench,
      quickActions: [
        { label: 'Validar Ocorrências no Terreno', icon: FileCheck2, path: '/ocorrencias', primary: true },
        { label: 'Relatórios Oficiais (jsPDF)', icon: FileCheck2, path: '/relatorios' },
        { label: 'Mapa de Fiscalização', icon: Activity, path: '/mapa' },
        { label: 'Alertas de Emergência', icon: AlertTriangle, path: '/alertas' }
      ]
    },
    instituicao: {
      title: 'Espaço de Instituições, ONGs e Parceiros',
      label: 'Instituição / Parceiro',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description:
        'Apoie projetos de reflorestamento e conservação comunitária, acompanhe o Selo Verde Moçambique e consulte relatórios de impacto ambiental.',
      icon: Building2,
      quickActions: [
        { label: 'Apoiar Projetos de Conservação', icon: DollarSign, path: '/fundos', primary: true },
        { label: 'Certificação Selo Verde', icon: Award, path: '/certificacao' },
        { label: 'Projetos em Curso', icon: Activity, path: '/projetos' },
        { label: 'Relatórios & Boletins', icon: FileCheck2, path: '/relatorios' }
      ]
    },
    gestor: {
      title: 'Painel do Gestor Ambiental',
      label: 'Gestor Ambiental',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description:
        'Acompanhe a evolução ambiental nas 11 províncias, avalie cenários de prevenção, coordene alertas de emergência e consulte relatórios consolidados.',
      icon: BarChart3,
      quickActions: [
        { label: 'Níveis de Risco Territorial', icon: Activity, path: '/diagnostico', primary: true },
        { label: 'Cenários & Previsões', icon: BarChart3, path: '/simulacoes' },
        { label: 'Alertas de Emergência', icon: AlertTriangle, path: '/alertas' },
        { label: 'Relatórios Consolidados', icon: FileCheck2, path: '/relatorios' }
      ]
    },
    admin: {
      title: 'Painel Central do Administrador (Administrator)',
      label: 'Administrator (MTA)',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description:
        'Acesso irrestrito a relatórios em PDF com jsPDF, gestão de utilizadores e permissões, auditoria de dados e parametrização do observatório nacional.',
      icon: Shield,
      quickActions: [
        { label: 'Administração & Permissões', icon: Shield, path: '/administracao', primary: true },
        { label: 'Relatórios Oficiais (jsPDF)', icon: FileCheck2, path: '/relatorios' },
        { label: 'Histórico & Auditoria', icon: Database, path: '/auditoria-dados' },
        { label: 'Preferências do Sistema', icon: Wrench, path: '/configuracoes' }
      ]
    }
  };

  const currentConfig = roleConfigs[activeRole] || roleConfigs.admin;
  const RoleIcon = currentConfig.icon;

  return (
    <div className="bg-[#062B3D] text-white rounded-3xl p-5 border border-[#07364A] shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Role identity and switcher */}
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#00A651] text-white flex items-center justify-center shrink-0 shadow-sm">
            <RoleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
                Perfil em Operação:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentConfig.badgeColor}`}
              >
                {currentConfig.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {currentConfig.title}
            </h3>
          </div>
        </div>

        {/* Right: Quick switcher pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {(['cidadao', 'tecnico', 'instituicao', 'gestor', 'admin'] as UserRole[]).map((r) => {
            const isSelected = activeRole === r;
            const labelMap: Record<UserRole, string> = {
              cidadao: 'Cidadão',
              tecnico: 'Técnico',
              instituicao: 'Instituição',
              gestor: 'Gestor',
              admin: 'Admin'
            };
            return (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00A651] text-white shadow-xs scale-102'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {labelMap[r]}
              </button>
            );
          })}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs ml-1"
            title={isExpanded ? 'Recolher detalhes' : 'Expandir ações do perfil'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded quick actions & description */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {currentConfig.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">
              Ações Recomendadas para {currentConfig.label}:
            </span>
            {currentConfig.quickActions.map((qa) => {
              const ActionIcon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={() => navigate(qa.path)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer ${
                    qa.primary
                      ? 'bg-[#00A651] hover:bg-[#008f45] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15'
                  }`}
                >
                  <ActionIcon className="w-3.5 h-3.5" />
                  <span>{qa.label}</span>
                </button>
              );
            })}
            <CitizenReportTour
              variant="compact"
              onStartReport={() => navigate('/ocorrencias?novo=true')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

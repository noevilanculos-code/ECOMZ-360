import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface AccessRestrictedViewProps {
  requiredRoles: UserRole[];
  featureName: string;
  description?: string;
  fallbackAction?: () => void;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  requiredRoles,
  featureName,
  description,
  fallbackAction
}) => {
  const navigate = useNavigate();
  const { activeRole, setActiveRole } = useApp();

  const roleNameMap: Record<UserRole, string> = {
    cidadao: 'Citizen (Cidadão)',
    tecnico: 'Environmental Inspector (Inspector Ambiental / Técnico)',
    admin: 'Administrator (Administrador)',
    gestor: 'Gestor Ambiental',
    instituicao: 'Instituição / Parceiro'
  };

  const getRoleDisplayName = (r: UserRole) => roleNameMap[r] || r;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acesso Restrito por Perfil (RBAC)</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Acesso Restrito a: {featureName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {description ||
              `A sua função atual é "${getRoleDisplayName(
                activeRole
              )}". Esta funcionalidade requer privilégios elevados de ${requiredRoles
                .map((r) => getRoleDisplayName(r))
                .join(' ou ')}.`}
          </p>
        </div>

        {/* Roles required info card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs space-y-3">
          <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span>Perfis autorizados para esta secção:</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">ECO-MZ RBAC</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredRoles.map((r) => (
              <span
                key={r}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                {getRoleDisplayName(r)}
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
            Alternador rápido de demonstração / testes:
          </div>

          {/* Quick role switch buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {requiredRoles.slice(0, 3).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setActiveRole(r);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simular {r === 'admin' ? 'Admin' : r === 'tecnico' ? 'Inspector' : 'Cidadão'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => (fallbackAction ? fallbackAction() : navigate(-1))}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Página Anterior</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ir para o Início</span>
          </button>
        </div>
      </div>
    </div>
  );
};

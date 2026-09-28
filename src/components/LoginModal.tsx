import React, { useState } from 'react';
import { Mail, Lock, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  setActiveRole
}) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMessage('Email/utilizador ou palavra-passe incorretos.');
        return;
      }
    } catch {
      setErrorMessage('Não foi possível entrar. Verifique os dados e tente novamente.');
      return;
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header - Deep Blue (#062B3D, #07364A) */}
        <div className="bg-[#062B3D] text-white p-5 pb-7 relative border-b border-[#07364A]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-[#07364A] rounded-full transition-colors cursor-pointer"
            aria-label="Fechar login"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <img
              src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
              alt="ECO-MZ 360"
              className="w-12 h-12 object-contain shrink-0 drop-shadow-md"
              onError={(e) => {
                e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
              }}
            />
            <div>
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-[9px] font-bold uppercase mb-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>ACESSO SEGURO</span>
              </div>
              <h2 className="text-base font-bold text-white leading-tight">Autenticação ECO-MZ 360</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Acesso para gestores, fiscais, cidadãos e instituições parceiras de Moçambique.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 -mt-3 bg-white dark:bg-slate-900 rounded-t-3xl space-y-4">
          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {errorMessage && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {errorMessage}
              </p>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email ou Utilizador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px]">Lembrar nesta máquina</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-2.5 bg-[#00A651] hover:bg-[#008f45] active:bg-[#007839] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Autenticado com Sucesso!</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-500 dark:text-slate-400">
          Acesso institucional protegido • Ministério da Terra e Ambiente (MTA) & INGD Moçambique
        </div>
      </div>
    </div>
  );
};

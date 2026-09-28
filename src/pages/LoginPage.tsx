import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Satellite,
  Flame,
  Globe2,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { UserRole, MozambiqueProvince } from '../types';
import { googleSignIn } from '../lib/googleAuth';

const MOZAMBIQUE_PROVINCES: MozambiqueProvince[] = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado'
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerUser, loginWithGoogle } = useApp();

  // Mode: 'login' or 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProvince, setRegProvince] = useState<MozambiqueProvince>('Maputo Cidade');
  const [regRole, setRegRole] = useState<UserRole>('cidadao');

  // Common UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // 1. Google 1-Click Direct Login with Google Account Credentials
  const handleGoogleDirectLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setInfoNotice(null);
    try {
      const result = await googleSignIn();
      if (!result?.user.email) throw new Error('A conta Google não forneceu um endereço de email.');
      await loginWithGoogle(result.user.email, result.user.displayName || result.user.email.split('@')[0]);
      navigate('/dashboard');
    } catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'A janela de autenticação foi fechada antes de concluir.',
        'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.',
        'auth/unauthorized-domain': `O domínio ${window.location.hostname} não está autorizado no Firebase Authentication. No Firebase Console, abra Authentication > Settings > Authorized domains e adicione esse domínio.`,
        'auth/operation-not-allowed': 'O acesso com Google não está ativado no Firebase Authentication.',
        'auth/network-request-failed': 'Sem ligação à internet. Verifique a rede e tente novamente.',
        'app/role-pending': 'O seu pedido de perfil está pendente de confirmação administrativa. Será avisado quando for aprovado.',
        'app/role-rejected': 'O pedido para este perfil foi recusado. Contacte o suporte para mais informações.'
      };
      setErrorMessage(messages[code || ''] || 'Não foi possível entrar com Google. Verifique a configuração do Firebase e tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Handle Standard Login Submit (Any user can login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoNotice(null);

    const identifier = email.trim();
    if (!identifier) {
      setErrorMessage('Por favor, introduza o seu email ou nome de utilizador.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, introduza a sua palavra-passe.');
      return;
    }

    setIsLoading(true);
    try {
      if (!await login(identifier, password)) {
        setErrorMessage('Email/utilizador ou palavra-passe incorretos.');
        return;
      }
      navigate('/dashboard');
    } catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email ou palavra-passe incorretos.',
        'auth/user-not-found': 'Não existe uma conta com este email.',
        'auth/wrong-password': 'Palavra-passe incorreta.',
        'auth/invalid-email': 'O formato do email não é válido.',
        'auth/too-many-requests': 'Foram feitas demasiadas tentativas. Aguarde e tente novamente.',
        'auth/network-request-failed': 'Sem ligação à internet. Verifique a rede e tente novamente.',
        'app/role-pending': 'O pedido de acesso a este perfil ainda aguarda confirmação administrativa.',
        'app/role-rejected': 'O pedido para este perfil foi recusado. Contacte o suporte.'
      };
      setErrorMessage(messages[code || ''] || 'Não foi possível entrar. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Register Account Submit (Any user can create account)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Por favor, introduza o seu nome completo.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Por favor, introduza um endereço de email válido.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        province: regProvince
      });
      if (!result) {
        setErrorMessage('Verifique o nome, o email e use uma palavra-passe com pelo menos 6 caracteres.');
        return;
      }
      if (result === 'pending') {
        setActiveTab('login');
        setInfoNotice('Conta criada. O perfil institucional ficará disponível após confirmação administrativa. Pode entrar como Cidadão enquanto aguarda, se criar uma conta separada.');
        return;
      }
      navigate('/dashboard');
    } catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email já possui uma conta. Entre ou utilize outro email.',
        'auth/invalid-email': 'O formato do email não é válido.',
        'auth/weak-password': 'A palavra-passe deve ter pelo menos 6 caracteres.',
        'auth/operation-not-allowed': 'O registo por email ainda não está ativado no Firebase Authentication.',
        'auth/network-request-failed': 'Sem ligação à internet. Verifique a rede e tente novamente.'
      };
      setErrorMessage(messages[code || ''] || 'Não foi possível criar a conta. Verifique a configuração do Firebase e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex bg-[#F5F8FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* LEFT COLUMN: Clean, Executive Institutional Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 h-screen relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white bg-gradient-to-br from-[#031924] via-[#062B3D] to-[#0A3C52] border-r border-[#07364A]/80 select-none">
        {/* Subtle Ambient Radial Lighting */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00A651 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00B956 0%, transparent 70%)' }}
        />

        {/* Top Header: Clean Brand Presentation */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/img/imagens/logo/ECOMZ-LOGO-09.png"
              alt="ECO-MZ 360"
              className="h-14 sm:h-16 lg:h-18 w-auto max-w-[290px] object-contain drop-shadow-md"
              onError={(e) => {
                e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO-09.svg';
              }}
            />
          </div>
          <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-emerald-400/90">
            <span>República de Moçambique</span>
            <span>•</span>
            <span>Ministério da Terra e Ambiente</span>
          </div>
        </div>

        {/* Center Hero: Strong, Sophisticated Value Statement */}
        <div className="relative z-10 my-auto py-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold mb-5 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Observatório Ambiental Nacional • ECO-MZ 360</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug">
            Inteligência geoespacial e monitoramento para proteger o património natural de Moçambique.
          </h1>

          <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-lg font-normal">
            Plataforma oficial de observação contínua, análise climática preditiva e resposta rápida coordenada nas 11 províncias.
          </p>

          {/* 3 Executive Capability Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                <Satellite className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">Vigilância Satelital</h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Monitoramento óptico e radar em tempo real.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">Resposta a Alertas</h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Detecção precoce de queimadas e desmate.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
                <Globe2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">11 Províncias</h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Integração direta MTA, AQUA, FNDS e INGD.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Quote */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-slate-300 italic font-medium">
            &ldquo;Preservar a nossa biodiversidade hoje é garantir a sustentabilidade de Moçambique amanhã.&rdquo;
          </p>
          <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider shrink-0 ml-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dados Criptografados</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 100% Viewport Height Clean Enterprise Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 h-screen flex flex-col justify-between p-6 sm:p-8 xl:p-12 relative bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
        {/* Top Bar with Minimal Theme Selector */}
        <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md mx-auto">
          {/* Institutional Badge */}
          <div className="flex items-center space-x-2.5">
            <img
              src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
              alt="ECO-MZ"
              className="w-9 h-9 object-contain drop-shadow-xs"
              onError={(e) => {
                e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                ECO-MZ <span className="text-[#00A651]">360</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                Portal Institucional
              </span>
            </div>
          </div>

          <ThemeSelector />
        </div>

        {/* Center: Segmented Control & Forms */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-2">
          {/* Google sign-in */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleDirectLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 hover:border-blue-500/80 dark:border-slate-700 dark:hover:border-blue-500/80 hover:bg-slate-50/80 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer group disabled:opacity-70"
            >
              <div className="flex items-center space-x-3 text-left">
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                    {isGoogleLoading ? 'A iniciar sessão...' : 'Continuar com o Google'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[200px] sm:max-w-[240px]">
                    Autenticação segura com a sua conta Google
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold uppercase shrink-0">
                1-Clique
              </span>
            </button>

          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3.5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-medium">
              ou use credenciais do sistema
            </span>
          </div>

          {/* Tab Switcher: Entrar | Criar Conta */}
          <div className="flex p-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="font-bold text-xs ml-2 text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Info Notice */}
          {infoNotice && (
            <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-between">
              <span>{infoNotice}</span>
              <button
                type="button"
                onClick={() => setInfoNotice(null)}
                className="font-bold text-xs ml-2 text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email ou Nome de Utilizador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="utilizador ou email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Palavra-passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Ocultar palavra-passe' : 'Ver palavra-passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#00A651] rounded border-slate-300 focus:ring-[#00A651]"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                    Lembrar-me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setInfoNotice('Contacte o suporte institucional da sua organização.')}
                  className="text-[#00A651] hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#00A651] hover:bg-[#008f45] active:bg-[#007839] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span>A autenticar...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ex: Manuel Tembe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ex: utilizador@example.invalid"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Província
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={regProvince}
                      onChange={(e) => setRegProvince(e.target.value as MozambiqueProvince)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] outline-none cursor-pointer"
                    >
                      {MOZAMBIQUE_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Perfil Pretendido
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] outline-none cursor-pointer"
                    >
                      <option value="cidadao">Cidadão Guardião</option>
                      <option value="tecnico">Inspector Técnico (AQUA)</option>
                      <option value="gestor">Gestor de Projetos</option>
                      <option value="instituicao">Instituição Parceira</option>
                      <option value="admin">Administrador Local</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Definir Palavra-passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A651] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00A651] hover:bg-[#008f45] active:bg-[#007839] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span>A criar conta...</span>
                ) : (
                  <>
                    <span>Criar Conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} ECO-MZ 360 • Ministério da Terra e Ambiente (MTA) & INGD Moçambique
          </p>
        </div>
      </div>
    </div>
  );
};

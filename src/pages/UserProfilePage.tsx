import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Globe,
  Camera,
  Edit2,
  Lock,
  Bell,
  CheckCircle2,
  LogOut,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout, activeRole, setActiveRole } = useApp();

  const [activeTab, setActiveTab] = useState<'informacoes' | 'seguranca' | 'notificacoes'>('informacoes');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setProfileNotice(msg);
    setTimeout(() => setProfileNotice(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    localStorage.setItem('ecomz_user', JSON.stringify(formData));
    if (formData.role.includes('Cidadão')) setActiveRole('cidadao');
    else if (formData.role.includes('Técnico')) setActiveRole('tecnico');
    else if (formData.role.includes('Gestor')) setActiveRole('gestor');
    else setActiveRole('admin');
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner - Deep Blue (#062B3D) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#062B3D] text-white p-6 sm:p-8 shadow-sm border border-[#07364A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative shrink-0">
              <img
                src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
                alt="ECO-MZ 360"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-[11px] font-bold mb-1">
                <Shield className="w-3 h-3 text-[#00B956]" />
                <span>Conta Institucional Verificada</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Perfil do Usuário
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Gerencie as suas informações pessoais e preferências da conta no ECO-MZ 360.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#07364A] hover:bg-rose-500/20 text-white hover:text-rose-200 border border-[#0a4861] hover:border-rose-400/40 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center space-x-2 text-xs font-bold shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Perfil atualizado com sucesso! As alterações foram guardadas.</span>
        </div>
      )}

      {/* Main Grid: Left Column (Avatar Card) + Right Column (Tabs & Forms) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card (4 cols): User Overview */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col items-center text-center shadow-xs">
          {/* Avatar with Camera Badge */}
          <div className="relative mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-2 ring-emerald-500/30 bg-emerald-700 flex items-center justify-center text-white text-3xl font-black">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="hidden">NS</span>
            </div>
            <button
              onClick={() => showNotice('Contacte o suporte institucional da sua organização para atualizar a foto.')}
              className="absolute -bottom-1 -right-1 p-2 bg-[#00A651] text-white rounded-full shadow-lg hover:bg-emerald-600 transition-transform active:scale-95 cursor-pointer"
              title="Alterar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {user.name}
          </h2>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mt-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user.role}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>• Online</span>
          </div>

          <div className="mt-6 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-left space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
              "Contribuindo para um futuro mais sustentável através da inovação tecnológica e conservação ambiental de Moçambique."
            </p>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-400 font-medium">
              {user.memberSince}
            </div>
          </div>
        </div>

        {/* Right Card (8 cols): Tabs & Personal Details Form */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('informacoes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'informacoes'
                    ? 'bg-[#00A651] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab('seguranca')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'seguranca'
                    ? 'bg-[#00A651] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Segurança
              </button>
              <button
                onClick={() => setActiveTab('notificacoes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'notificacoes'
                    ? 'bg-[#00A651] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Notificações
              </button>
            </div>

            {activeTab === 'informacoes' && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
              </button>
            )}
          </div>

          {activeTab === 'informacoes' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Section 1: Dados Pessoais */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Dados Pessoais
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Telefone
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Perfil
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Gestor">Gestor Ambiental</option>
                      <option value="Técnico">Técnico de Fiscalização</option>
                      <option value="Cidadão">Cidadão Guardião</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Informações Adicionais */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Informações Adicionais
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Localização
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Organização
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Função
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.functionTitle}
                      onChange={(e) => setFormData({ ...formData, functionTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Idioma
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-medium disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>

              {/* Save button when in editing mode */}
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Alterações</span>
                  </button>
                </div>
              )}

              {/* Section 3: Privacidade e Segurança Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-3">
                <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Privacidade e Segurança
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Dados seguros — Os seus dados estão protegidos e são utilizados apenas para fins institucionais da plataforma ECO-MZ 360 em conformidade com as diretivas do Ministério da Terra e Ambiente.
                  </p>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white">Palavra-passe de Acesso</h4>
                <p className="text-slate-500 mt-1">Última alteração efetuada há 45 dias.</p>
                <button
                  onClick={() => showNotice('Instruções de redefinição de senha enviadas para o email institucional.')}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold"
                >
                  Alterar Palavra-passe
                </button>
              </div>

              {profileNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center justify-between">
                  <span>{profileNotice}</span>
                  <button
                    type="button"
                    onClick={() => setProfileNotice(null)}
                    className="font-bold text-xs ml-2 text-emerald-600 hover:text-emerald-800"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white">Autenticação de Dois Fatores (2FA)</h4>
                <p className="text-slate-500 mt-1">A autenticação de dois fatores ainda não está configurada neste protótipo.</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Não configurada
                </span>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Alertas de Queimadas Críticas</div>
                  <div className="text-[11px] text-slate-500">Notificações push em tempo real</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Relatórios Semanais Automatizados</div>
                  <div className="text-[11px] text-slate-500">Resumo consolidado no email</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

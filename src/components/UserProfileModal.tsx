import React, { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  Activity,
  Key,
  X,
  Edit3,
  ExternalLink,
  Users
} from 'lucide-react';
import { UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  setActiveRole
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'atividades' | 'seguranca'>('perfil');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header Banner - Deep Blue (#062B3D) */}
        <div className="relative bg-[#062B3D] text-white p-6 pb-16 border-b border-[#07364A]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-[#07364A] rounded-full transition-colors"
            aria-label="Fechar perfil"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 mb-2">
            <img
              src="/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.png"
              alt="ECO-MZ 360"
              className="w-12 h-12 object-contain shrink-0 drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/assets/img/imagens/logo/ECOMZ-LOGO_ICON-ORIGINAL.svg';
              }}
            />
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#00B956]">
                <Shield className="w-4 h-4" />
                <span>PERFIL DO UTILIZADOR</span>
              </div>
              <h2 className="text-xl font-bold text-white">Gabinete de Gestão & Perfil</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            ECO-MZ 360 • Plataforma de Gestão Ambiental de Moçambique
          </p>
        </div>

        {/* Profile Card Floating Avatar */}
        <div className="px-6 -mt-10 flex items-end justify-between">
          <div className="flex items-end space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-[#062B3D] text-[#00B956] flex items-center justify-center text-2xl font-black border-4 border-white shadow-lg ring-2 ring-[#00A651]/20">
              NS
            </div>
            <div className="pb-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Noé Samuel Vilanculos</h3>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#00A651]" />
                <span>Líder do Projeto & Administrador Geral</span>
              </p>
            </div>
          </div>

          <div className="pb-1">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              Sessão Ativa
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'perfil'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Informações Gerais
          </button>
          <button
            onClick={() => setActiveTab('atividades')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'atividades'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Histórico & Auditoria
          </button>
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'seguranca'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Equipa & Credenciais
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'perfil' && (
            <>
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Correio Eletrónico</span>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>noesv85@gmail.com</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Instituição / Afiliação</span>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MTA / Consórcio ECO-MZ</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Jurisdição Territorial</span>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nacional (11 Províncias de Moçambique)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nível de Acesso (RBAC)</span>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    <span>Superadministrador (Acesso Irrestrito)</span>
                  </div>
                </div>
              </div>

              {/* Statistics Strip */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <div>
                  <span className="text-xl font-black text-emerald-800">243</span>
                  <p className="text-[10px] font-bold text-emerald-700">Ocorrências Auditadas</p>
                </div>
                <div className="border-x border-emerald-200">
                  <span className="text-xl font-black text-emerald-800">18</span>
                  <p className="text-[10px] font-bold text-emerald-700">Projetos Ativos</p>
                </div>
                <div>
                  <span className="text-xl font-black text-emerald-800">7</span>
                  <p className="text-[10px] font-bold text-emerald-700">Alertas Supervisionados</p>
                </div>
              </div>

              {/* Role Switcher in Profile */}
              <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Simular Navegação com Outro Perfil de Utilizador:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['admin', 'gestor', 'tecnico', 'cidadao', 'instituicao'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setActiveRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        activeRole === role
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Conforme a Secção 4 do Documento de Extensão Funcional v1.1, cada perfil possui painéis, tarefas e permissões adaptadas.
                </p>
              </div>
            </>
          )}

          {activeTab === 'atividades' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ações Recentes de Auditoria no ECO-DATA:
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Aprovação do Projeto "Restauração de Mangais da Beira"</p>
                    <p className="text-slate-500 text-[11px]">Validado plano de reflorestamento de 50.000 árvores com a AQUA e Conselho Municipal da Beira.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hoje, às 11:20 • IP: 197.249.12.8</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Disparo de Alerta Meteorológico INGD / INAM</p>
                    <p className="text-slate-500 text-[11px]">Emissão de alerta de cheias na Bacia do Rio Búzi para técnicos e comités comunitários locais.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Ontem, às 16:45 • Módulo ECO-ALERT</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Emissão de Selo Verde (ECO-CERT) a Empresa Agroflorestal</p>
                    <p className="text-slate-500 text-[11px]">Certificado de Nível Ouro emitido com QR Code e validade de 24 meses após auditoria.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">18 de Setembro de 2026 • Módulo ECO-CERT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Equipa do Projeto ECO-MZ 360 (Versão 1.1)</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><strong>Líder de Projeto:</strong> Noé Samuel Vilanculos</p>
                  <p><strong>Integrantes da Equipa:</strong> Elias Félix Mufunde · Roque Armando Maurício · Joel Ali Viano</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Desenvolvido para apresentação acadêmica e jornadas científicas com suporte a arquitetura moderna (React, Vite, Tailwind, Gemini AI) e infraestrutura clássica (PHP, MySQL, Apache/LAMP).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Autenticação e Chaves de Acesso:</span>
                <div className="flex items-center justify-between text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-mono text-[11px]">Chave API Administrador: ecomz_live_sec_***</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Ativa</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span>Autenticação em 2 Fatores (2FA)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitada via SMS / OTP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sessão autenticada: <strong>Noé Samuel</strong> • ECO-MZ 360 v1.1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

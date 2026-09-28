import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Cloud,
  Globe,
  Sliders,
  CheckCircle2,
  Save,
  RefreshCw,
  Key,
  Palette
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

export const EcoSettingsView: React.FC = () => {
  const [communityUpdates, setCommunityUpdates] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [geoHighPrecision, setGeoHighPrecision] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Preferências e Configurações
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Experiência Pessoal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalize os seus alertas ambientais, localização automática e aparência visual da plataforma.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-102 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Preferências</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>As suas preferências foram guardadas com sucesso.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Localização & Mapa */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Localização & Região</h2>
              <p className="text-[11px] text-slate-400">Facilita o envio rápido de denúncias no seu bairro ou distrito</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Deteção Automática de Localização</p>
                <p className="text-[11px] text-slate-400">Preenche automaticamente a província e o ponto no mapa ao reportar</p>
              </div>
              <input
                type="checkbox"
                checked={geoHighPrecision}
                onChange={(e) => setGeoHighPrecision(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Acompanhamento de Ocorrências Locais</p>
                <p className="text-[11px] text-slate-400">Mostra em destaque quando um problema perto de si é resolvido</p>
              </div>
              <input
                type="checkbox"
                checked={communityUpdates}
                onChange={(e) => setCommunityUpdates(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Notificações & Alertas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Avisos e Alertas Comunitários</h2>
              <p className="text-[11px] text-slate-400">Receba avisos importantes sobre clima, queimadas e ações locais</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Alertas de Urgência Ambiental</p>
                <p className="text-[11px] text-slate-400">Avisos imediatos em caso de queimadas críticas ou risco de cheias</p>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Resumo Semanal por Email</p>
                <p className="text-[11px] text-slate-400">Receba um resumo simples das ações ambientais na sua província</p>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Aparência & Tema Visual (Claro / Escuro) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Aparência & Conforto Visual</h2>
              <p className="text-[11px] text-slate-400">Escolha entre o modo claro, escuro ou automático conforme a luz do seu ecrã</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Modo de Iluminação (Claro / Escuro / Sistema)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Altere facilmente para melhorar a leitura durante o dia sob sol forte ou à noite.
              </p>
            </div>
            <ThemeSelector showLabel={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

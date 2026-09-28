import React, { useState } from 'react';
import {
  ShieldAlert,
  Wind,
  Flame,
  Droplets,
  AlertTriangle,
  PhoneCall,
  Bell,
  CheckCircle2,
  Calendar,
  Radio,
  ExternalLink
} from 'lucide-react';
import { EnvironmentalAlert } from '../types';
import { INITIAL_ALERTS } from '../data/mockData';

export const EcoAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>(INITIAL_ALERTS);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [subscribedSMS, setSubscribedSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleAcknowledge = (alertId: string) => {
    if (!acknowledgedAlerts.includes(alertId)) {
      setAcknowledgedAlerts([...acknowledgedAlerts, alertId]);
    }
  };

  const handleSubscribeSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setSubscribedSMS(true);
    setTimeout(() => {
      setPhoneNumber('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ECO-ALERT • Sistema de Alerta Precoce & Defesa Civil</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Avisos de Emergência, Ciclones e Prevenção de Desastres
          </h2>
          <p className="text-xs text-slate-500">
            Articulação em tempo real com o INGD (Instituto Nacional de Gestão e Redução do Risco de Desastres) e INAM.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>{alerts.length} Avisos em Vigor</span>
          </span>
        </div>
      </div>

      {/* Grid of Active Warnings & SMS Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Warning Feeds */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 px-1">Avisos Meteorológicos & Risco Comunitário</h3>

          {alerts.map((alert) => {
            const isAcknowledged = acknowledgedAlerts.includes(alert.id);
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border shadow-xs space-y-3 transition-all ${
                  alert.level === 'Vermelho'
                    ? 'bg-rose-50/60 border-rose-300'
                    : alert.level === 'Laranja'
                    ? 'bg-orange-50/60 border-orange-300'
                    : 'bg-amber-50/60 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white ${
                        alert.level === 'Vermelho'
                          ? 'bg-rose-600'
                          : alert.level === 'Laranja'
                          ? 'bg-orange-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      Aviso {alert.level}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{alert.threat}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Emitido: {alert.issuedAt} • Validade: {alert.expiresAt}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{alert.instructions}</p>

                <div className="p-3 bg-white/80 rounded-lg border border-slate-200/80 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Territórios e Distritos Sob Risco:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(alert.affectedDistricts || []).map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Fonte Oficial: <strong>{alert.source}</strong>
                  </span>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                      isAcknowledged
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAcknowledged ? 'Comunidade Avisada ✓' : 'Confirmar Receção'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Contacts & SMS Alert Registration */}
        <div className="lg:col-span-4 space-y-5">
          {/* SMS Broadcast signup */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Receber Alertas por SMS / USSD</span>
            </h3>
            <p className="text-xs text-slate-600">
              Cadastre o seu número para receber avisos de evacuação e ciclone mesmo sem dados de internet (cobertura nacional Vodacom / Movitel / Tmcel).
            </p>

            <form onSubmit={handleSubscribeSMS} className="space-y-2">
              <input
                type="tel"
                placeholder="+258 84 / 85 / 86 / 87 / 82..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {subscribedSMS ? 'Subscrito com Sucesso!' : 'Ativar Avisos SMS Gratuitos'}
              </button>
            </form>
          </div>

          {/* Emergency Helplines Mozambique */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold flex items-center space-x-1.5 text-rose-400">
              <PhoneCall className="w-4 h-4" />
              <span>Linhas Telefónicas de Emergência</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/80">
                <span className="text-slate-300">CENOE / INGD (Nacional):</span>
                <strong className="font-mono text-emerald-400">800 112 112</strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/80">
                <span className="text-slate-300">Corpo de Salvação Pública (Bombeiros):</span>
                <strong className="font-mono text-emerald-400">198</strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/80">
                <span className="text-slate-300">Polícia de Proteção Ambiental (PRM):</span>
                <strong className="font-mono text-emerald-400">119</strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800/80">
                <span className="text-slate-300">Emergência Médica Nacional:</span>
                <strong className="font-mono text-emerald-400">117</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Chamadas gratuitas a partir de qualquer rede móvel ou fixa em território moçambicano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

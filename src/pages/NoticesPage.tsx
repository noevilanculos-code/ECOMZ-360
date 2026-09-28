import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  ArrowLeft,
  X
} from 'lucide-react';
import { useApp, NoticeItem } from '../context/AppContext';

export const NoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notices, markNoticeAsRead } = useApp();

  const [activeTab, setActiveTab] = useState<'Todos' | 'Importante' | 'Geral'>('Todos');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const filteredNotices = notices.filter((n) => {
    if (activeTab === 'Todos') return true;
    return n.type === activeTab;
  });

  const handleOpenNotice = (notice: NoticeItem) => {
    setSelectedNotice(notice);
    markNoticeAsRead(notice.id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="sm:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Avisos e Comunicados Oficiais
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Circulares, convocações e alertas operacionais da autoridade ambiental.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {(['Todos', 'Importante', 'Geral'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            onClick={() => handleOpenNotice(notice)}
            className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !notice.read
                ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-900/60 shadow-xs ring-1 ring-blue-500/20'
                : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start space-x-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notice.type === 'Importante'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                }`}
              >
                {notice.type === 'Importante' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      notice.type === 'Importante'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {notice.type}
                  </span>
                  {!notice.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                  <span className="text-[11px] text-slate-400 font-medium">
                    {notice.timestamp}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notice.summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {selectedNotice.type} • {selectedNotice.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedNotice.title}
            </h2>

            <div className="text-xs text-slate-400">
              Publicado em: {selectedNotice.timestamp}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedNotice.summary}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

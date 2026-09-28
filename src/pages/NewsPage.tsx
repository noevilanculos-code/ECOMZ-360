import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  Search,
  ChevronRight,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  ArrowLeft,
  X,
  Sparkles
} from 'lucide-react';
import { useApp, NewsItem } from '../context/AppContext';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { news } = useApp();

  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Ambiente' | 'Projetos' | 'Eventos'>('Todas');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const filteredNews = news.filter((item) => {
    const matchCategory = activeFilter === 'Todas' || item.category === activeFilter;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header matching 18_MOBILE_NOTICIAS.png & Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="sm:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-[#00A651]/10 text-[#00A651] flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Notícias Ambientais
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe as novidades da conservação e sustentabilidade em Moçambique.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input with Buscar button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar notícias..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
        <button
          type="button"
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#008f45] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Buscar notícias"
        >
          <Search className="w-4 h-4" />
          <span>Buscar</span>
        </button>
      </div>

      {/* Category Pills matching mockup 18_MOBILE_NOTICIAS.png */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {(['Todas', 'Ambiente', 'Projetos', 'Eventos'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === filter
                ? 'bg-[#00A651] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* News Cards List matching 18_MOBILE_NOTICIAS.png */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-4 group"
          >
            {/* Thumbnail */}
            <div className="w-24 h-24 sm:w-32 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.category === 'Ambiente'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : item.category === 'Projetos'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {item.category}
              </span>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                {item.summary}
              </p>

              <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  {item.date}
                </span>
                <span>•</span>
                <span>{item.readTime}</span>
              </div>
            </div>

            {/* Chevron Right */}
            <div className="p-2 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="relative h-60 w-full overflow-hidden bg-slate-950">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-emerald-600 uppercase">
                  {selectedArticle.category} • {selectedArticle.source}
                </span>
                <span>{selectedArticle.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {selectedArticle.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {selectedArticle.summary}
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                Esta notícia foi verificada e distribuída pelos canais oficiais de comunicação do Ministério da Terra e Ambiente (MTA) de Moçambique.
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Fechar Artigo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

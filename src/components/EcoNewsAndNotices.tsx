import React, { useState } from 'react';
import {
  Newspaper,
  Megaphone,
  Calendar,
  AlertTriangle,
  Tag,
  Share2,
  ExternalLink,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface EcoNewsAndNoticesProps {
  initialType?: 'noticias' | 'avisos';
}

export const EcoNewsAndNotices: React.FC<EcoNewsAndNoticesProps> = ({ initialType = 'noticias' }) => {
  const [activeType, setActiveType] = useState<'noticias' | 'avisos'>(initialType);
  const [newsCategory, setNewsCategory] = useState<string>('Todos');
  const [noticesCategory, setNoticesCategory] = useState<string>('Todos');

  const newsList = [
    {
      id: 'news-1',
      title: 'Moçambique reforça compromisso com a conservação ambiental',
      category: 'Ambiente',
      date: '12 de Maio de 2025',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      summary:
        'O Governo de Moçambique, através do MTA e parceiros internacionais, anunciou novo pacote de financiamento para proteção de ecossistemas costeiros e fortalecimento de brigadas florestais.',
      source: 'MTA Notícias • Maputo'
    },
    {
      id: 'news-2',
      title: 'Lançado novo projeto de reflorestamento em Gaza',
      category: 'Projetos',
      date: '10 de Maio de 2025',
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
      summary:
        'Iniciativa comunitária prevê a plantação de mais de 100.000 acácias e espécies autóctones na bacia do Limpopo, restaurando faixas de proteção contra a desertificação.',
      source: 'Consórcio ECO-MZ • Xai-Xai'
    },
    {
      id: 'news-3',
      title: 'Alerta de risco de inundações para Nampula e bacias a jusante',
      category: 'Ambiente',
      date: '08 de Maio de 2025',
      image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      summary:
        'O INGD e a Direção Nacional de Gestão de Recursos Hídricos emitiram aviso prévio para bacias do Monapo e Lúrio devido à precipitação acumulada nas terras altas.',
      source: 'INGD Moçambique'
    },
    {
      id: 'news-4',
      title: 'Relatório ambiental de 2024 disponível para consulta pública',
      category: 'Eventos',
      date: '06 de Maio de 2025',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80',
      summary:
        'Documento com dados consolidados de fiscalização, emissões evitadas e restauração florestal já pode ser baixado em PDF no módulo ECO-DATA.',
      source: 'Gabinete de Estatística MTA'
    }
  ];

  const noticesList = [
    {
      id: 'aviso-1',
      title: 'Limpeza das margens do rio Incomáti',
      category: 'Importante',
      date: 'Hoje, 09:00',
      author: 'Conselho Municipal de Manhiça & Brigadas ECO-ACTION',
      description:
        'Convocatória para brigada comunitária de recolha de plásticos e desobstrução de canais de drenagem. Ponto de encontro na ponte principal.',
      severity: 'high'
    },
    {
      id: 'aviso-2',
      title: 'Atualização do sistema ECO-MZ 360 (Manutenção programada)',
      category: 'Geral',
      date: 'Ontem, 18:30',
      author: 'Equipa de Engenharia • Noé Samuel (Líder)',
      description:
        'Sincronização com satélites Sentinel-2 e recalibração dos sensores de qualidade do ar concluída com sucesso em todas as províncias.',
      severity: 'normal'
    },
    {
      id: 'aviso-3',
      title: 'Reunião do conselho técnico provincial de Sofala',
      category: 'Importante',
      date: '08 de Maio, 14:00',
      author: 'Direção Provincial de Desenvolvimento Territorial',
      description:
        'Apresentação dos resultados da simulação de erosão costeira da Beira (ECO-SIM) e validação do plano diretor de contingência.',
      severity: 'high'
    },
    {
      id: 'aviso-4',
      title: 'Campanha de sensibilização ambiental nas escolas secundárias',
      category: 'Geral',
      date: '05 de Maio, 10:20',
      author: 'Módulo ECO-EDU • Parceria Ministério da Educação',
      description:
        'Distribuição de kits educativos e lançamento do concurso escolar de hortas biológicas e viveiros de mangal.',
      severity: 'normal'
    }
  ];

  const filteredNews = newsList.filter(
    (n) => newsCategory === 'Todos' || n.category === newsCategory
  );

  const filteredNotices = noticesList.filter(
    (a) => noticesCategory === 'Todos' || a.category === noticesCategory
  );

  return (
    <div className="space-y-6">
      {/* Header with Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeType === 'noticias' ? 'Notícias em Destaque' : 'Avisos & Comunicados'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              {activeType === 'noticias' ? 'Tela 9 • ECO-NEWS' : 'Tela 10 • ECO-AVISOS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informação pública, atualizações de projetos e editais oficiais dos órgãos ambientais de Moçambique.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveType('noticias')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeType === 'noticias'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Notícias</span>
          </button>
          <button
            onClick={() => setActiveType('avisos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeType === 'avisos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Avisos</span>
          </button>
        </div>
      </div>

      {/* Content depending on activeType */}
      {activeType === 'noticias' ? (
        <div className="space-y-6">
          {/* News category filter pills matching Tela 9 */}
          <div className="flex items-center space-x-2">
            {['Todos', 'Ambiente', 'Projetos', 'Eventos'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNewsCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  newsCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col group"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">{item.source}</span>
                    </div>

                    <h2 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tempo de leitura: 3 min</span>
                    <button className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                      <span>Ler artigo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notices category filter pills matching Tela 10 */}
          <div className="flex items-center space-x-2">
            {['Todos', 'Importante', 'Geral'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNoticesCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  noticesCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredNotices.map((aviso) => (
              <div
                key={aviso.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    aviso.severity === 'high'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {aviso.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{aviso.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aviso.severity === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {aviso.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {aviso.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      Emissor: {aviso.author}
                    </span>
                    <button className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      Confirmar Leitura
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

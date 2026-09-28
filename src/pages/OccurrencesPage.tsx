import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EcoOccurrencesView } from '../components/EcoOccurrencesView';
import { EcoCitizen } from '../components/EcoCitizen';
import { CategoryOccurrencesBarChart } from '../components/CategoryOccurrencesBarChart';
import { ProvinceOccurrencesBarChart } from '../components/ProvinceOccurrencesBarChart';
import { useApp } from '../context/AppContext';
import { Occurrence, OccurrenceStatus } from '../types';
import { BarChart3, MapPin } from 'lucide-react';

export const OccurrencesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { occurrences, addOccurrence, updateOccurrenceStatus } = useApp();
  const [isReportingNew, setIsReportingNew] = useState(() => {
    return Boolean((location.state as any)?.openNew || location.search.includes('novo=true'));
  });
  const [chartView, setChartView] = useState<'provincias' | 'categorias'>('provincias');
  const initialViewMode = location.search.includes('mapa=true') || (location.state as any)?.viewMode === 'mapa' ? 'mapa' : 'tabela';

  useEffect(() => {
    if ((location.state as any)?.openNew || location.search.includes('novo=true')) {
      setIsReportingNew(true);
    }
  }, [location]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {import.meta.env.DEV && occurrences.some((occurrence) => occurrence.protocol.startsWith('DEMO-')) && (
        <div role="note" className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Demonstração: as ocorrências com protocolo DEMO- são fictícias e não representam denúncias reais.
        </div>
      )}
      {isReportingNew ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registar Nova Ocorrência Cidadã
            </h2>
            <button
              onClick={() => setIsReportingNew(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
            >
              Voltar à Lista
            </button>
          </div>
          <EcoCitizen
            onAddOccurrence={async (newOcc) => {
              const saved = await addOccurrence(newOcc);
              setIsReportingNew(false);
              return saved;
            }}
            occurrences={occurrences}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <EcoOccurrencesView
            occurrences={occurrences}
            defaultViewMode={initialViewMode}
            onSelectOccurrence={(occ) => navigate(`/ocorrencias/${occ.id}`)}
            onNewOccurrence={() => setIsReportingNew(true)}
            onUpdateStatus={(id: string, status: OccurrenceStatus) => {
              void updateOccurrenceStatus(id, status).catch((error) => {
                window.alert(error instanceof Error ? error.message : 'Não foi possível atualizar a ocorrência.');
              });
            }}
          />

          {/* Analytical Charts Section Switcher */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Estatísticas por Província e Tipo de Problema
              </span>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartView('provincias')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                  chartView === 'provincias'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Por Província</span>
              </button>
              <button
                type="button"
                onClick={() => setChartView('categorias')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                  chartView === 'categorias'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Por Tipologia</span>
              </button>
            </div>
          </div>

          {chartView === 'provincias' ? (
            <ProvinceOccurrencesBarChart
              occurrences={occurrences}
              onNavigateToMap={() => navigate('/mapa')}
              onSelectProvince={(prov) => {
                if (prov !== 'Todas') {
                  const target = occurrences.find((o) => o.province === prov);
                  if (target) navigate(`/ocorrencias/${target.id}`);
                }
              }}
            />
          ) : (
            <CategoryOccurrencesBarChart occurrences={occurrences} />
          )}
        </div>
      )}
    </div>
  );
};

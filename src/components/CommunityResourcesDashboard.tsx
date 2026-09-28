import React, { useState, useMemo } from 'react';
import {
  Package,
  Droplets,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Phone,
  Sun,
  ShieldCheck,
  Building,
  RefreshCw,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  MozambiqueProvince,
  ReforestationKitItem,
  CommunityWaterPoint
} from '../types';
import {
  INITIAL_REFORESTATION_KITS,
  INITIAL_WATER_POINTS,
  MOZAMBIQUE_PROVINCES
} from '../data/mockData';
import { exportToPDF } from '../utils/pdfExport';

interface CommunityResourcesDashboardProps {
  className?: string;
  onNavigateToMap?: () => void;
}

export const CommunityResourcesDashboard: React.FC<CommunityResourcesDashboardProps> = ({
  className = '',
  onNavigateToMap
}) => {
  // State for resources
  const [kits, setKits] = useState<ReforestationKitItem[]>(INITIAL_REFORESTATION_KITS);
  const [waterPoints, setWaterPoints] = useState<CommunityWaterPoint[]>(INITIAL_WATER_POINTS);

  // Filters
  const [selectedProvince, setSelectedProvince] = useState<MozambiqueProvince | 'Todas'>('Todas');
  const [activeTab, setActiveTab] = useState<'todos' | 'kits' | 'agua'>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals
  const [isRequestKitModalOpen, setIsRequestKitModalOpen] = useState<boolean>(false);
  const [isNewWaterPointModalOpen, setIsNewWaterPointModalOpen] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form states for modals
  const [selectedKitToRestock, setSelectedKitToRestock] = useState<ReforestationKitItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(250);

  // Filtered Kits
  const filteredKits = useMemo(() => {
    return kits.filter((k) => {
      const matchProv = selectedProvince === 'Todas' || k.province === selectedProvince;
      const matchSearch =
        searchQuery === '' ||
        k.communityCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.speciesDistribution.some((s) => s.speciesName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'critico' && k.status === 'Estoque Crítico') ||
        (statusFilter === 'saudavel' && k.status === 'Estoque Saudável') ||
        (statusFilter === 'alerta' && k.status === 'Nível Alerta');
      return matchProv && matchSearch && matchStatus;
    });
  }, [kits, selectedProvince, searchQuery, statusFilter]);

  // Filtered Water Points
  const filteredWaterPoints = useMemo(() => {
    return waterPoints.filter((wp) => {
      const matchProv = selectedProvince === 'Todas' || wp.province === selectedProvince;
      const matchSearch =
        searchQuery === '' ||
        wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.province.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'operacional' && wp.status === 'Operacional') ||
        (statusFilter === 'manutencao' && wp.status === 'Manutenção Necessária') ||
        (statusFilter === 'seca' && wp.status === 'Seca Sazonal');
      return matchProv && matchSearch && matchStatus;
    });
  }, [waterPoints, selectedProvince, searchQuery, statusFilter]);

  // Aggregate KPI Calculations
  const metrics = useMemo(() => {
    const totalKitsAvailable = kits.reduce((acc, k) => acc + k.availableStock, 0);
    const totalKitsDistributed = kits.reduce((acc, k) => acc + k.allocatedDistributed, 0);
    const targetKits = kits.reduce((acc, k) => acc + k.targetSeasonalStock, 0);
    const avgSurvivalRate = Math.round(
      kits.reduce((acc, k) => acc + k.survivalRatePct, 0) / (kits.length || 1)
    );

    const totalWaterPoints = waterPoints.length;
    const operationalWaterPoints = waterPoints.filter((wp) => wp.status === 'Operacional').length;
    const totalDailyLiters = waterPoints.reduce((acc, wp) => acc + wp.dailyCapacityLiters, 0);
    const totalHouseholds = waterPoints.reduce((acc, wp) => acc + wp.householdsServed, 0);

    const criticalKitsCount = kits.filter((k) => k.status === 'Estoque Crítico').length;
    const maintenanceWaterCount = waterPoints.filter((wp) => wp.status === 'Manutenção Necessária' || wp.status === 'Seca Sazonal').length;

    return {
      totalKitsAvailable,
      totalKitsDistributed,
      targetKits,
      avgSurvivalRate,
      totalWaterPoints,
      operationalWaterPoints,
      totalDailyLiters,
      totalHouseholds,
      criticalKitsCount,
      maintenanceWaterCount
    };
  }, [kits, waterPoints]);

  // Chart 1 Data: Kits Available vs Target by Province
  const kitsByProvinceChartData = useMemo(() => {
    const map: Record<string, { province: string; disponivel: number; distribuido: number; meta: number }> = {};
    kits.forEach((k) => {
      if (!map[k.province]) {
        map[k.province] = { province: k.province, disponivel: 0, distribuido: 0, meta: 0 };
      }
      map[k.province].disponivel += k.availableStock;
      map[k.province].distribuido += k.allocatedDistributed;
      map[k.province].meta += k.targetSeasonalStock;
    });
    return Object.values(map);
  }, [kits]);

  // Chart 2 Data: Water points status distribution
  const waterStatusChartData = useMemo(() => {
    const counts = {
      'Operacional': 0,
      'Manutenção': 0,
      'Seca Sazonal': 0,
      'Em Construção': 0
    };
    waterPoints.forEach((wp) => {
      if (wp.status === 'Operacional') counts['Operacional']++;
      else if (wp.status === 'Manutenção Necessária') counts['Manutenção']++;
      else if (wp.status === 'Seca Sazonal') counts['Seca Sazonal']++;
      else counts['Em Construção']++;
    });
    return [
      { name: 'Operacional', value: counts['Operacional'], color: '#00B956' },
      { name: 'Em Manutenção', value: counts['Manutenção'], color: '#f59e0b' },
      { name: 'Seca Sazonal', value: counts['Seca Sazonal'], color: '#ef4444' },
      { name: 'Em Construção', value: counts['Em Construção'], color: '#0284c7' }
    ];
  }, [waterPoints]);

  // Handle restock request confirmation
  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitToRestock) return;

    setKits((prev) =>
      prev.map((k) =>
        k.id === selectedKitToRestock.id
          ? {
              ...k,
              availableStock: k.availableStock + restockQty,
              status: k.availableStock + restockQty > k.targetSeasonalStock * 0.3 ? 'Estoque Saudável' : 'Nível Alerta',
              lastRestockedDate: new Date().toISOString().substring(0, 10)
            }
          : k
      )
    );

    setNotificationMsg(
      `Ordem de reposição aprovada: +${restockQty} kits despachados para ${selectedKitToRestock.communityCenter}!`
    );
    setIsRequestKitModalOpen(false);
    setSelectedKitToRestock(null);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Toggle water point status
  const handleReportWaterMaintenance = (wpId: string) => {
    setWaterPoints((prev) =>
      prev.map((wp) => {
        if (wp.id === wpId) {
          const nextStatus = wp.status === 'Operacional' ? 'Manutenção Necessária' : 'Operacional';
          return { ...wp, status: nextStatus, lastInspectionDate: new Date().toISOString().substring(0, 10) };
        }
        return wp;
      })
    );
    setNotificationMsg('Status do ponto de água atualizado com sucesso no sistema central.');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Boletim de Recursos Comunitários: Kits & Água',
      subtitle: `Província: ${selectedProvince} · Sistema Nacional ECO-MZ 360`,
      summary: `Diagnóstico consolidado de disponibilidade de kits de reflorestamento comunitário e rede de pontos de abastecimento de água potável em Moçambique.`,
      metrics: [
        { label: 'Kits em Estoque', value: `${metrics.totalKitsAvailable.toLocaleString('pt-MZ')} kits` },
        { label: 'Kits Distribuídos', value: `${metrics.totalKitsDistributed.toLocaleString('pt-MZ')} kits` },
        { label: 'Pontos de Água Funcionais', value: `${metrics.operationalWaterPoints} de ${metrics.totalWaterPoints}` },
        { label: 'Capacidade Diária', value: `${(metrics.totalDailyLiters / 1000).toFixed(0)} mil L/dia` },
        { label: 'Famílias Abastecidas', value: `${metrics.totalHouseholds.toLocaleString('pt-MZ')} lares` }
      ],
      tableHeaders: ['Centro / Ponto', 'Província', 'Distrito', 'Recurso', 'Capacidade / Estoque', 'Status'],
      tableRows: [
        ...filteredKits.map((k) => [
          k.communityCenter,
          k.province,
          k.district,
          'Kits Reflorestamento',
          `${k.availableStock} disp. / ${k.targetSeasonalStock} meta`,
          k.status
        ]),
        ...filteredWaterPoints.map((wp) => [
          wp.name,
          wp.province,
          wp.district,
          wp.type,
          `${wp.dailyCapacityLiters.toLocaleString()} L/dia (${wp.householdsServed} fam.)`,
          wp.status
        ])
      ],
      recommendations: [
        'Acelerar a reposição de mudas nativas (Chanfuta e Mangal) nos distritos do Búzi e Chigubo.',
        'Mobilizar equipas técnicas de reparação solar para furos em manutenção antes do início da estação seca.',
        'Expandir a implantação de dessalinizadores solares descentralizados ao longo da costa de Inhambane e Sofala.'
      ],
      filename: `recursos-comunitarios-${selectedProvince.toLowerCase()}-${new Date().toISOString().substring(0, 10)}.pdf`
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#062B3D] text-white rounded-3xl p-6 sm:p-8 border border-[#07364A] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
              <span className="text-[#00B956]">ECO-RECURSOS</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Gestão Descentralizada de Insumos & Água</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Recursos Comunitários
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Monitorização contínua dos estoques de <strong>kits de reflorestamento comunitário</strong> (mudas de Miombo e Mangais) e da rede de <strong>pontos de abastecimento de água potável</strong> (furos solares e dessalinizadores) nas 11 províncias de Moçambique.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Dados em PDF</span>
            </button>

            <button
              onClick={() => {
                setSelectedKitToRestock(kits[0]);
                setIsRequestKitModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B956] hover:bg-[#009c48] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Reposição de Kits</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kits em Estoque */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kits em Armazém</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00B956]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalKitsAvailable.toLocaleString('pt-MZ')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Distribuídos: <strong>{metrics.totalKitsDistributed.toLocaleString('pt-MZ')}</strong></span>
            <span className="text-emerald-600 font-bold">{metrics.avgSurvivalRate}% sobrevivência</span>
          </div>
        </div>

        {/* Card 2: Pontos de Água Funcionais */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pontos de Água Ativos</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.operationalWaterPoints} <span className="text-sm font-normal text-slate-400">/ {metrics.totalWaterPoints} furos</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Operacionalidade: <strong>{Math.round((metrics.operationalWaterPoints / (metrics.totalWaterPoints || 1)) * 100)}%</strong></span>
            <span className="text-sky-600 font-bold">100% solar/limpo</span>
          </div>
        </div>

        {/* Card 3: Volume Diário de Água */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vazão Diária Potável</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(metrics.totalDailyLiters / 1000).toFixed(0)} <span className="text-sm font-normal text-slate-400">mil Litros/dia</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>População atendida:</span>
            <strong className="text-teal-700 dark:text-teal-400">{metrics.totalHouseholds.toLocaleString('pt-MZ')} famílias</strong>
          </div>
        </div>

        {/* Card 4: Alertas de Intervenção */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pontos de Atenção</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.criticalKitsCount + metrics.maintenanceWaterCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{metrics.criticalKitsCount} centros com baixo estoque</span>
            <span className="text-amber-600 font-bold">{metrics.maintenanceWaterCount} em reparo</span>
          </div>
        </div>
      </div>

      {/* Chart Section: Stock Comparison & Water Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Bar Chart of Kits by Province */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição de Kits de Reflorestamento por Província
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo de estoque disponível vs. kits já alocados e plantados no terreno.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00B956]"></span> Disponível
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700"></span> Distribuído
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kitsByProvinceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="province" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="disponivel" name="Kits Disponíveis" fill="#00B956" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distribuido" name="Kits Já Distribuídos" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Water Points Status (Donut) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Status da Rede de Água
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Condição operacional dos pontos solares e poços.
            </p>
          </div>

          <div className="h-44 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waterStatusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {waterStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {waterStatusChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs: Todos, Kits, Água */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'todos'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos os Recursos
          </button>
          <button
            onClick={() => setActiveTab('kits')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'kits'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kits de Reflorestamento ({kits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('agua')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'agua'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Pontos de Água ({waterPoints.length})</span>
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Province Selector */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="Todas">Todas as Províncias</option>
            {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="todos">Todos os Status</option>
            <option value="saudavel">Estoque Saudável / Operacional</option>
            <option value="alerta">Nível Alerta</option>
            <option value="critico">Estoque Crítico / Em Reparo</option>
          </select>

          {/* Search Input with Buscar button */}
          <div className="flex items-center gap-1.5 flex-1 sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar comunidade, espécie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Buscar recursos"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: KITS DE REFLORESTAMENTO TABLE */}
      {(activeTab === 'todos' || activeTab === 'kits') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kits de Reflorestamento Comunitário
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mudas nativas (Chanfuta, Umbila, Mangal Vermelho, Pau-Preto) e ferramentas de cultivo comunitário.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Mostrando {filteredKits.length} centros de distribuição
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Centro Comunitário / Local</th>
                  <th className="py-3 px-3">Província / Distrito</th>
                  <th className="py-3 px-3">Espécies Fornecidas</th>
                  <th className="py-3 px-3">Estoque Disponível</th>
                  <th className="py-3 px-3">Pegamento / Sobrevivência</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredKits.map((kit) => {
                  const stockRatio = (kit.availableStock / (kit.targetSeasonalStock || 1)) * 100;
                  return (
                    <tr key={kit.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{kit.communityCenter}</div>
                        <div className="text-[11px] text-slate-400">Viveiro: {kit.nurseryPartner}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{kit.province}</div>
                        <div className="text-[11px] text-slate-400">{kit.district}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {kit.speciesDistribution.slice(0, 2).map((sp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                            >
                              {sp.speciesName} ({sp.quantity})
                            </span>
                          ))}
                          {kit.speciesDistribution.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{kit.speciesDistribution.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{kit.availableStock}</span>
                          <span className="text-slate-400">/ {kit.targetSeasonalStock}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              stockRatio < 20 ? 'bg-rose-500' : stockRatio < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, stockRatio)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">{kit.survivalRatePct}%</span>
                        <div className="text-[10px] text-slate-400">Taxa monitorada</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            kit.status === 'Estoque Saudável'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : kit.status === 'Nível Alerta'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {kit.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedKitToRestock(kit);
                            setIsRequestKitModalOpen(true);
                          }}
                          className="px-3 py-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg transition-colors"
                        >
                          Reposição
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: PONTOS DE ÁGUA TABLE */}
      {(activeTab === 'todos' || activeTab === 'agua') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Rede de Pontos de Abastecimento de Água Potável
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Furos solares, estações de dessalinização costeira e captação pluvial com telemetria comunitária.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Mostrando {filteredWaterPoints.length} pontos mapeados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Nome do Ponto de Água</th>
                  <th className="py-3 px-3">Localização</th>
                  <th className="py-3 px-3">Tecnologia</th>
                  <th className="py-3 px-3">Capacidade / Dia</th>
                  <th className="py-3 px-3">Qualidade da Água</th>
                  <th className="py-3 px-3">Status Operacional</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredWaterPoints.map((wp) => (
                  <tr key={wp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{wp.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{wp.technicianContact}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{wp.province}</div>
                      <div className="text-[11px] text-slate-400">{wp.district} · {wp.locality}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {wp.solarPowered && <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span className="font-medium text-slate-700 dark:text-slate-300">{wp.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {wp.dailyCapacityLiters.toLocaleString('pt-MZ')} L/dia
                      </div>
                      <div className="text-[11px] text-slate-400">{wp.householdsServed} famílias</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {wp.waterQuality}
                      </span>
                      <div className="text-[10px] text-slate-400">Auditoria: {wp.lastInspectionDate}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          wp.status === 'Operacional'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : wp.status === 'Manutenção Necessária'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : wp.status === 'Seca Sazonal'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                        }`}
                      >
                        {wp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleReportWaterMaintenance(wp.id)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                          wp.status === 'Operacional'
                            ? 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {wp.status === 'Operacional' ? 'Solicitar Revisão' : 'Marcar Operacional'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Solicitar Reposição de Kits */}
      {isRequestKitModalOpen && selectedKitToRestock && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Gestão Logística Comunitária
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Solicitar Envio de Kits
                </h3>
              </div>
              <button
                onClick={() => setIsRequestKitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedKitToRestock.communityCenter}
                </div>
                <div className="text-slate-500">
                  {selectedKitToRestock.district} ({selectedKitToRestock.province}) · Estoque atual: {selectedKitToRestock.availableStock}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Quantidade de Kits de Reflorestamento:
                </label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  step="50"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Inclui mudas de Chanfuta, Umbila, Mangais e ferramentas de plantio.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Justificativa Operacional:
                </label>
                <textarea
                  rows={2}
                  defaultValue="Reforço prioritário para a época chuvosa e campanha de proteção de encostas e mangais."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestKitModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirmar Envio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

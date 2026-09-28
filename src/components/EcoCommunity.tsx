import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  Sparkles,
  ChevronRight,
  Send,
  HeartHandshake,
  Package,
  Droplets,
  Target,
  Flame,
  Shield,
  ShieldCheck,
  Waves,
  ThumbsUp,
  Share2,
  Filter,
  PlusCircle,
  TrendingUp,
  Trophy,
  TreePine,
  Check,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { VolunteerOpportunity, MozambiqueProvince } from '../types';
import { INITIAL_VOLUNTEER_OPPS, MOZAMBIQUE_PROVINCES } from '../data/mockData';
import { CommunityResourcesDashboard } from './CommunityResourcesDashboard';

export interface CommunityMission {
  id: string;
  title: string;
  category: 'Mangais' | 'Queimadas' | 'Limpeza Costeira' | 'Florestas Miombo' | 'Recifes & Fauna';
  province: MozambiqueProvince;
  district: string;
  targetMetric: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  participantsCount: number;
  deadline: string;
  leadGroup: string;
  description: string;
  impactRewardPoints: number;
}

export interface CGRNProposal {
  id: string;
  title: string;
  proposer: string;
  community: string;
  province: MozambiqueProvince;
  district: string;
  category: string;
  requestedBudgetMZN: number;
  description: string;
  votes: number;
  status: 'Em Votação' | 'Aprovado para Financiamento' | 'Em Análise Técnica';
  submittedDate: string;
}

export interface GuardianCircle {
  id: string;
  name: string;
  province: MozambiqueProvince;
  district: string;
  ecosystem: string;
  activeGuardians: number;
  areaProtected: string;
  patrolFrequency: string;
  leadCoordinator: string;
  contactChannel: string;
  recentAlert: string;
  badgeLevel: 'Sentinela Ouro' | 'Sentinela Prata' | 'Sentinela Bronze';
  joined: boolean;
}

export const EcoCommunity: React.FC = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(INITIAL_VOLUNTEER_OPPS);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    'missoes' | 'guardioes' | 'cgrn' | 'voluntariado' | 'forum' | 'ranking' | 'recursos'
  >('missoes');

  // Guardian Circles State
  const [guardianCircles, setGuardianCircles] = useState<GuardianCircle[]>([
    {
      id: 'gc-sofala',
      name: 'Guardiões dos Mangais de Búzi & Sofala',
      province: 'Sofala',
      district: 'Búzi & Beira (Praia Nova)',
      ecosystem: 'Estuário e Mangais Costeiros',
      activeGuardians: 420,
      areaProtected: '14.500 hectares de mangal',
      patrolFrequency: 'Diária (conforme maré)',
      leadCoordinator: 'Mestre Arnaldo Cossa (Comité de Pesca)',
      contactChannel: 'Rádio Comunitária Búzi & WhatsApp Guardiões',
      recentAlert: 'Tentativa de corte ilegal de lenha de mangal travada na foz do Púnguè.',
      badgeLevel: 'Sentinela Ouro',
      joined: true
    },
    {
      id: 'gc-niassa',
      name: 'Brigada Sentinela do Miombo de Mecula',
      province: 'Niassa',
      district: 'Mecula & Marrupa',
      ecosystem: 'Floresta Densa de Miombo & Reserva do Niassa',
      activeGuardians: 215,
      areaProtected: '38.000 hectares florestais',
      patrolFrequency: 'Rondas 3x por semana com GPS',
      leadCoordinator: 'Chefe Tradicional Maleta & Fiscais Comunitários',
      contactChannel: 'Posto Rádio Mecula',
      recentAlert: 'Queimada agrícola descontrolada contida com abertura de 4km de aceiros.',
      badgeLevel: 'Sentinela Ouro',
      joined: false
    },
    {
      id: 'gc-cabo-delgado',
      name: 'Sentinelas dos Recifes & Tartarugas das Quirimbas',
      province: 'Cabo Delgado',
      district: 'Ibo, Matemo & Quissanga',
      ecosystem: 'Recifes de Coral & Bancos de Ervas Marinhas',
      activeGuardians: 180,
      areaProtected: '62 km de orla insular e recifal',
      patrolFrequency: 'Vigilância em botes a remo e canoas',
      leadCoordinator: 'Fátima Bacar (Associação das Mulheres Pescadoras)',
      contactChannel: 'Canal VHF Marítimo 16 & Alerta SMS',
      recentAlert: 'Desova monitorizada de tartaruga-verde com sucesso na Ilha de Matemo.',
      badgeLevel: 'Sentinela Prata',
      joined: false
    },
    {
      id: 'gc-gaza',
      name: 'Comité de Proteção Hídrica do Baixo Limpopo',
      province: 'Gaza',
      district: 'Chókwè & Xai-Xai',
      ecosystem: 'Planície Aluvial & Lagoas de Água Doce',
      activeGuardians: 310,
      areaProtected: '95 km de canais e diques agrícolas',
      patrolFrequency: 'Semanal e após avisos do INAM',
      leadCoordinator: 'Eng. Alberto Mondlane (Associação de Regantes)',
      contactChannel: 'Comité Local de Gestão de Riscos',
      recentAlert: 'Inspeção de comportas contra remanso de maré salina no estuário do Limpopo.',
      badgeLevel: 'Sentinela Prata',
      joined: false
    },
    {
      id: 'gc-maputo',
      name: 'Patrulha Verde da Baía de Maputo & Inhaca',
      province: 'Maputo Cidade',
      district: 'KaTembe & Ilha da Inhaca',
      ecosystem: 'Baía Estuarina, Dunas & Mangais Urbanos',
      activeGuardians: 285,
      areaProtected: '34 km² de área costeira e dunas',
      patrolFrequency: 'Fins de semana e marés vivas',
      leadCoordinator: 'Dra. Luísa Nhantumbo (Juventude Ecológica)',
      contactChannel: 'App ECO-MZ & Grupo Alerta Rápido',
      recentAlert: 'Deposição ilícita de entulho na Costa do Sol denunciada e recolhida pelo Município.',
      badgeLevel: 'Sentinela Ouro',
      joined: false
    },
    {
      id: 'gc-tete',
      name: 'Vigilantes Comunitários da Bacia do Zambeze',
      province: 'Tete',
      district: 'Moatize & Changara',
      ecosystem: 'Bacia Hidrográfica do Rio Zambeze e Revubué',
      activeGuardians: 195,
      areaProtected: '80 km de margens fluviais',
      patrolFrequency: 'Bi-semanal',
      leadCoordinator: 'Sr. Mateus Zimba (Comité de Bacia)',
      contactChannel: 'Boletim Semanal de Turbidez e Poluição',
      recentAlert: 'Amostragem de água no Revubué revelou aumento de sedimentos por mineração artesanal.',
      badgeLevel: 'Sentinela Bronze',
      joined: false
    }
  ]);

  // Civic Impact Calculator State
  const [calcVolunteers, setCalcVolunteers] = useState<number>(25);
  const [calcMangroveMudas, setCalcMangroveMudas] = useState<number>(3000);
  const [calcAceirosKm, setCalcAceirosKm] = useState<number>(8);

  // User Eco-Points State
  const [userEcoPoints, setUserEcoPoints] = useState<number>(340);
  const [votedProposalIds, setVotedProposalIds] = useState<string[]>([]);
  const [joinedMissionIds, setJoinedMissionIds] = useState<string[]>(['mis-01']);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('Todas');

  // Collective Community Missions State
  const [missions, setMissions] = useState<CommunityMission[]>([
    {
      id: 'mis-01',
      title: 'Operação 50.000 Mangais da Baía de Sofala',
      category: 'Mangais',
      province: 'Sofala',
      district: 'Beira e Búzi',
      targetMetric: 'Mudas de Rhizophora e Avicennia Plantadas',
      targetCount: 50000,
      currentCount: 36450,
      unit: 'mudas',
      participantsCount: 420,
      deadline: '15 de Novembro de 2026',
      leadGroup: 'Comité de Co-Gestão das Pescas da Praia Nova & Amigos do Mar',
      description: 'Campanha de reflorestamento dos estuários do Púnguè e Búzi para conter marés de tempestade e garantir viveiro de camarão para os pescadores locais.',
      impactRewardPoints: 120
    },
    {
      id: 'mis-02',
      title: 'Brigadas Sentinela Anti-Queimadas do Miombo',
      category: 'Queimadas',
      province: 'Niassa',
      district: 'Marrupa e Mecula',
      targetMetric: 'Rondas Comunitárias de Vigilância & Abertura de Aceiros',
      targetCount: 150,
      currentCount: 112,
      unit: 'rondas',
      participantsCount: 185,
      deadline: '30 de Outubro de 2026',
      leadGroup: 'Guardiões Tradicionais do Niassa & Fiscais Comunitários',
      description: 'Vigilância diurna e abertura de faixas corta-fogo (aceiros) nas bordas das machambas para evitar que queimadas agrícolas invadam o Miombo denso.',
      impactRewardPoints: 150
    },
    {
      id: 'mis-03',
      title: 'Grande Mutirão de Limpeza da Costa do Sol e Catembe',
      category: 'Limpeza Costeira',
      province: 'Maputo Cidade',
      district: 'KaMavota e KaTembe',
      targetMetric: 'Resíduos Plásticos e Redes Fantasma Retirados',
      targetCount: 20000,
      currentCount: 15840,
      unit: 'kg de resíduos',
      participantsCount: 530,
      deadline: '28 de Outubro de 2026',
      leadGroup: 'Juventude Ecológica de Maputo & Cooperativas de Catadores',
      description: 'Retirada sistemática de micro e macro-plásticos que ameaçam aves marinhas e a entrada da baía, encaminhando todo o material para centros de triagem.',
      impactRewardPoints: 90
    },
    {
      id: 'mis-04',
      title: 'Recuperação das Matas Ciliares do Rio Búzi',
      category: 'Florestas Miombo',
      province: 'Sofala',
      district: 'Búzi',
      targetMetric: 'Km de Margens Fluviais Estabilizadas com Árvores Nativas',
      targetCount: 25,
      currentCount: 18.5,
      unit: 'km de margem',
      participantsCount: 240,
      deadline: '10 de Dezembro de 2026',
      leadGroup: 'Associação de Camponeses de Guara-Guara & CGRN Búzi',
      description: 'Plantio de Chanfuta, Jambire e Bambu nas curvas críticas do rio para prevenir deslizamentos e amortecer cheias fluviais durante as monções.',
      impactRewardPoints: 140
    }
  ]);

  // CGRN Citizen Proposals
  const [proposals, setProposals] = useState<CGRNProposal[]>([
    {
      id: 'prop-01',
      title: 'Instalação de Bomba Solar para Viveiro Comunitário de Macaneta',
      proposer: 'Marta Cossa (Associação das Mulheres Pescadoras)',
      community: 'Comunidade de Macaneta',
      province: 'Maputo Província',
      district: 'Marracuene',
      category: 'Água & Reflorestamento',
      requestedBudgetMZN: 185000,
      description: 'Fornecer irrigação contínua a 15.000 mudas de mangal e fruteiras sem depender de geradores a gasóleo poluentes.',
      votes: 312,
      status: 'Aprovado para Financiamento',
      submittedDate: '12 de Setembro de 2026'
    },
    {
      id: 'prop-02',
      title: 'Kit de Canoas e Coletes para Vigilância dos Mangais de Nicoadala',
      proposer: 'Comité de Gestão de Recursos Naturais (CGRN)',
      community: 'Povoado de Idugo',
      province: 'Zambézia',
      district: 'Nicoadala',
      category: 'Fiscalização Comunitária',
      requestedBudgetMZN: 120000,
      description: 'Equipar 12 patrulheiros voluntários da comunidade para monitorar o corte ilegal noturno de estacas de mangal nos esteiros.',
      votes: 428,
      status: 'Em Votação',
      submittedDate: '19 de Setembro de 2026'
    },
    {
      id: 'prop-03',
      title: 'Formação Prática de 40 Jovens em Apicultura Sustentável no Miombo',
      proposer: 'Armando Mabote',
      community: 'Aldeia de Namanhumbir',
      province: 'Cabo Delgado',
      district: 'Montepuez',
      category: 'Geração de Renda Verde',
      requestedBudgetMZN: 160000,
      description: 'Distribuir colmeias tipo Langstroth e vestuário de proteção para criar alternativa económica que substitui a produção predatória de carvão.',
      votes: 285,
      status: 'Em Votação',
      submittedDate: '22 de Setembro de 2026'
    }
  ]);

  // New Proposal Form State
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState('Água & Reflorestamento');
  const [propProvince, setPropProvince] = useState<MozambiqueProvince>('Sofala');
  const [propDistrict, setPropDistrict] = useState('');
  const [propBudget, setPropBudget] = useState(150000);
  const [propDesc, setPropDesc] = useState('');

  // Forum state
  const [forumPosts, setForumPosts] = useState([
    {
      id: 'post-1',
      author: 'Noé Samuel Vilanculos',
      role: 'Ativista Ecológico',
      province: 'Sofala',
      time: 'Há 2 horas',
      category: 'Mangais',
      content: 'Estamos a organizar um viveiro comunitário no bairro da Ponta Gea para fornecer mudas aos pescadores da Praia Nova. Quem tiver recipientes plásticos de 5L para reaproveitamento pode entrar em contacto!',
      likes: 24,
      comments: 7
    },
    {
      id: 'post-2',
      author: 'Dra. Amina Mussá',
      role: 'Bióloga Marinha',
      province: 'Cabo Delgado',
      time: 'Ontem',
      category: 'Fauna Marinha',
      content: 'Atenção aos comités de gestão de pescas no Ibo: registámos desova de tartarugas-verdes no setor norte do arquipélago das Quirimbas. Reforçar vigilância contra apanha noturna de ovos.',
      likes: 42,
      comments: 15
    },
    {
      id: 'post-3',
      author: 'Ernesto Macamo',
      role: 'Técnico Agrário e Guardião',
      province: 'Gaza',
      time: 'Há 3 dias',
      category: 'Seca & Solo',
      content: 'Conseguimos implementar a cobertura morta (mulching) em 12 machambas em Chókwè. A humidade do solo reteve-se durante 10 dias a mais mesmo com as altas temperaturas do Limpopo. Técnica recomendada a todos os camponeses do sul!',
      likes: 38,
      comments: 11
    }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Mangais');
  const [newPostProvince, setNewPostProvince] = useState<MozambiqueProvince>('Sofala');

  // Handle Volunteer Enrollment
  const handleEnroll = (oppId: string) => {
    if (enrolledIds.includes(oppId)) {
      setEnrolledIds(enrolledIds.filter((id) => id !== oppId));
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, enrolled: Math.max(0, (o.enrolled || 0) - 1) } : o))
      );
    } else {
      setEnrolledIds([...enrolledIds, oppId]);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, enrolled: (o.enrolled || 0) + 1 } : o))
      );
      setUserEcoPoints((prev) => prev + 50);
    }
  };

  // Handle Joining Mission
  const handleToggleJoinMission = (missionId: string, points: number) => {
    if (joinedMissionIds.includes(missionId)) {
      setJoinedMissionIds(joinedMissionIds.filter((id) => id !== missionId));
    } else {
      setJoinedMissionIds([...joinedMissionIds, missionId]);
      setUserEcoPoints((prev) => prev + points);
    }
  };

  // Handle Voting in CGRN Proposals
  const handleVoteProposal = (proposalId: string) => {
    if (votedProposalIds.includes(proposalId)) return;
    setVotedProposalIds([...votedProposalIds, proposalId]);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, votes: p.votes + 1 } : p))
    );
    setUserEcoPoints((prev) => prev + 15);
  };

  // Handle Adding New Proposal
  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propDesc.trim()) return;

    const newProp: CGRNProposal = {
      id: `prop-${Date.now()}`,
      title: propTitle.trim(),
      proposer: 'Noé Samuel Vilanculos (Cidadão Guardião)',
      community: `${propDistrict || 'Comunidade'} Local`,
      province: propProvince,
      district: propDistrict || 'Centro',
      category: propCategory,
      requestedBudgetMZN: Number(propBudget),
      description: propDesc.trim(),
      votes: 1,
      status: 'Em Votação',
      submittedDate: 'Hoje'
    };

    setProposals([newProp, ...proposals]);
    setIsNewProposalModalOpen(false);
    setPropTitle('');
    setPropDesc('');
    setUserEcoPoints((prev) => prev + 30);
  };

  // Handle Forum Post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: 'Noé Samuel Vilanculos',
      role: 'Cidadão Guardião',
      province: newPostProvince,
      time: 'Agora mesmo',
      category: newPostCategory,
      content: newPostContent.trim(),
      likes: 1,
      comments: 0
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostContent('');
    setUserEcoPoints((prev) => prev + 20);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Civic Score & Quick Metrics */}
      <div className="bg-[#062B3D] text-white rounded-3xl p-6 sm:p-8 border border-[#07364A] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00A651]/20 text-[#00B956] border border-[#00A651]/30 text-xs font-bold mb-3 shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#00B956]" />
              <span>ECO-COMMUNITY • Participação Cidadã & Comités CGRN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Rede de Guardiões Ambientais & Mobilização Cívica
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Una-se a missões coletivas com metas ao vivo, vote no Orçamento Verde Participativo dos Comités Locais (CGRN) e acumule Eco-Pontos MZ na defesa dos ecossistemas de Moçambique.
            </p>
          </div>

          {/* User Civic Score Card */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                Meu Saldo Cívico
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <span>{userEcoPoints}</span>
                <span className="text-xs font-normal text-slate-300">Eco-Pontos MZ</span>
              </div>
              <div className="text-[10px] text-emerald-300/90 font-medium">
                🥈 Nível 2: Protetor do Ecossistema
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('missoes')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'missoes'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Missões Coletivas ({missions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guardioes')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guardioes'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guardiões Ambientais ({guardianCircles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cgrn')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cgrn'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Orçamento CGRN ({proposals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('voluntariado')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'voluntariado'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Mutirões & Voluntários ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('forum')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'forum'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Fórum Socioambiental ({forumPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ranking'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Ranking & Medalhas</span>
          </button>

          <button
            onClick={() => setActiveTab('recursos')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'recursos'
                ? 'bg-[#062B3D] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>Kits & Pontos de Água</span>
          </button>
        </div>

        {/* Quick Province Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedProvinceFilter}
            onChange={(e) => setSelectedProvinceFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Todas">Todas as Províncias</option>
            {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: MISSÕES COLETIVAS COM METAS EM TEMPO REAL */}
      {activeTab === 'missoes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎯</span> Missões de Ação Comunitária Direta
              </h2>
              <p className="text-xs text-slate-500">
                Ações coletivas coordenadas entre brigadas locais, associações de pescadores e cidadãos com metas públicas mensuráveis.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {missions.length} Campanhas em Andamento
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {missions
              .filter(
                (m) =>
                  selectedProvinceFilter === 'Todas' || m.province === selectedProvinceFilter
              )
              .map((mission) => {
                const pct = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));
                const isJoined = joinedMissionIds.includes(mission.id);

                return (
                  <div
                    key={mission.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {mission.category}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <span>+{mission.impactRewardPoints} Eco-Pontos</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {mission.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {mission.description}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{mission.district}, {mission.province}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Liderança: <strong className="text-slate-700 dark:text-slate-200">{mission.leadGroup}</strong></span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prazo da Meta: {mission.deadline}</span>
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">
                            {mission.currentCount.toLocaleString('pt-MZ')} / {mission.targetCount.toLocaleString('pt-MZ')} {mission.unit}
                          </span>
                          <span className="text-emerald-600 font-mono">{pct}% Concluído</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{mission.participantsCount} voluntários ativos</span>
                          <span>{mission.targetMetric}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleJoinMission(mission.id, mission.impactRewardPoints)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          isJoined
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isJoined ? 'Participação Confirmada ✓ (+Pontos Ativos)' : 'Participar desta Missão'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB: CÍRCULOS DE GUARDIÕES AMBIENTAIS COMUNITÁRIOS & CALCULADORA CÍVICA */}
      {activeTab === 'guardioes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Círculos de Guardiões Ambientais de Moçambique</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl">
                Redes locais autogovernadas de camponeses, pescadores artesanais, líderes tradicionais e jovens fiscais que patrulham ecossistemas críticos e emitem alertas precoces no terreno.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {guardianCircles.length} Círculos Territoriais
              </span>
            </div>
          </div>

          {/* Interactive Civic Impact Calculator Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-700/50 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm text-white">
                  Calculadora Cívica de Impacto Comunitário
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Simulação de Campo
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Estime o poder ecológico de uma ação coordenada pelo seu comitê ou círculo de guardiões:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Slider 1: Voluntários */}
              <div className="space-y-1.5 bg-black/30 p-3.5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Voluntários no Mutirão:</span>
                  <span className="font-mono font-bold text-emerald-400">{calcVolunteers} pessoas</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={calcVolunteers}
                  onChange={(e) => setCalcVolunteers(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Jovens, pescadores e camponeses</span>
              </div>

              {/* Slider 2: Mudas de Mangal */}
              <div className="space-y-1.5 bg-black/30 p-3.5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Mudas de Mangal Plantadas:</span>
                  <span className="font-mono font-bold text-cyan-300">{calcMangroveMudas.toLocaleString('pt-MZ')} mudas</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={calcMangroveMudas}
                  onChange={(e) => setCalcMangroveMudas(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Propágulos de Rhizophora e Avicennia</span>
              </div>

              {/* Slider 3: Aceiros Corta-Fogo */}
              <div className="space-y-1.5 bg-black/30 p-3.5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Aceiros Corta-Fogo Abertos:</span>
                  <span className="font-mono font-bold text-amber-300">{calcAceirosKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={calcAceirosKm}
                  onChange={(e) => setCalcAceirosKm(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Faixas limpas no Miombo e machambas</span>
              </div>
            </div>

            {/* Impact Calculation Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase text-emerald-300 font-semibold block">CO2 Capturado / Evitado</span>
                <span className="text-lg font-black text-white font-mono">
                  {Math.round((calcMangroveMudas * 0.04) + (calcAceirosKm * 2.8))} t CO2/ano
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase text-cyan-300 font-semibold block">Machambas Protegidas</span>
                <span className="text-lg font-black text-white font-mono">
                  {Math.round((calcMangroveMudas * 0.008) + (calcAceirosKm * 15))} hectares
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase text-sky-300 font-semibold block">Atenuação de Maré</span>
                <span className="text-lg font-black text-white font-mono">
                  -{Math.min(1.5, Number((calcMangroveMudas * 0.00008).toFixed(2)))} m na vaga
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase text-yellow-300 font-semibold block">Eco-Pontos Coletivos</span>
                <span className="text-lg font-black text-yellow-400 font-mono">
                  +{(calcVolunteers * 10) + Math.round(calcMangroveMudas * 0.05)} pts
                </span>
              </div>
            </div>
          </div>

          {/* Guardian Circles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guardianCircles
              .filter(
                (gc) => selectedProvinceFilter === 'Todas' || gc.province === selectedProvinceFilter
              )
              .map((circle) => {
                return (
                  <div
                    key={circle.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {circle.province}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200">
                          🎖️ {circle.badgeLevel}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {circle.name}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        🌿 {circle.ecosystem}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center justify-between">
                          <span>Área sob Vigilância:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{circle.areaProtected}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Frequência das Rondas:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{circle.patrolFrequency}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Coordenação Local:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{circle.leadCoordinator}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Canal de Emergência:</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold">{circle.contactChannel}</span>
                        </p>
                      </div>

                      {/* Recent Alert Bulletin */}
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                        <span className="font-bold block text-[10px] uppercase text-amber-700 dark:text-amber-400 mb-0.5">
                          📢 Último Boletim do Círculo:
                        </span>
                        {circle.recentAlert}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setGuardianCircles((prev) =>
                            prev.map((c) =>
                              c.id === circle.id
                                ? {
                                    ...c,
                                    joined: !c.joined,
                                    activeGuardians: c.joined ? c.activeGuardians - 1 : c.activeGuardians + 1
                                  }
                                : c
                            )
                          );
                          if (!circle.joined) {
                            setUserEcoPoints((prev) => prev + 60);
                          }
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          circle.joined
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{circle.joined ? 'Guardião Ativo ✓' : 'Aderir ao Círculo (+60 pts)'}</span>
                      </button>

                      <div className="text-right px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        👥 {circle.activeGuardians}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: COMITÉS CGRN & ORÇAMENTO VERDE PARTICIPATIVO */}
      {activeTab === 'cgrn' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏛️</span> Comités de Gestão de Recursos Naturais (CGRN)
              </h2>
              <p className="text-xs text-slate-500">
                Orçamento Verde Participativo: as propostas mais votadas pelas comunidades recebem financiamento através do Fundo Verde Comunitário ECO-MZ.
              </p>
            </div>
            <button
              onClick={() => setIsNewProposalModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submeter Proposta Comunitária</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {proposals
              .filter(
                (p) =>
                  selectedProvinceFilter === 'Todas' || p.province === selectedProvinceFilter
              )
              .map((prop) => {
                const hasVoted = votedProposalIds.includes(prop.id);

                return (
                  <div
                    key={prop.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-cyan-400 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prop.status === 'Aprovado para Financiamento'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300'
                          }`}
                        >
                          {prop.status}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {prop.requestedBudgetMZN.toLocaleString('pt-MZ')} MZN
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {prop.description}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.community} • {prop.district}, {prop.province}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Autor: <strong className="text-slate-700 dark:text-slate-200">{prop.proposer}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{prop.votes} apoios cívicos</span>
                      </div>
                      <button
                        onClick={() => handleVoteProposal(prop.id)}
                        disabled={hasVoted}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasVoted
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{hasVoted ? 'Votado ✓' : 'Apoiar Proposta'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: VAGAS DE VOLUNTARIADO & MUTIRÕES */}
      {activeTab === 'voluntariado' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🤝</span> Mutirões de Campo & Inscrição de Voluntários
              </h2>
              <p className="text-xs text-slate-500">
                Inscrição aberta para plantio de mudas, fiscalização colaborativa e proteção das orlas marítimas.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
              {opportunities.length} Oportunidades Abertas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities
              .filter(
                (o) =>
                  selectedProvinceFilter === 'Todas' || o.province === selectedProvinceFilter
              )
              .map((opp) => {
                const isEnrolled = enrolledIds.includes(opp.id);
                return (
                  <div
                    key={opp.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {opp.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {opp.enrolled}/{opp.spots} vagas preenchidas
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{opp.title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3">{opp.description}</p>

                      <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{opp.district}, {opp.province}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Data: {opp.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleEnroll(opp.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                          isEnrolled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEnrolled ? 'Inscrição Confirmada ✓' : 'Quero Ser Voluntário (+50 Pontos)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: FÓRUM COMUNITÁRIO */}
      {activeTab === 'forum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* Create Post Form */}
            <form onSubmit={handleAddPost} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>💬</span> Iniciar Nova Discussão ou Partilhar Relato de Campo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Tema Principal</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Mangais">Mangais & Zonas Húmidas</option>
                    <option value="Queimadas">Controlo de Queimadas</option>
                    <option value="Fauna Marinha">Fauna Costeira & Pesca</option>
                    <option value="Seca & Solo">Resiliência Agrária & Seca</option>
                    <option value="Resíduos">Gestão de Resíduos & Plásticos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Província da Ação</label>
                  <select
                    value={newPostProvince}
                    onChange={(e) => setNewPostProvince(e.target.value as MozambiqueProvince)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Partilhe relatos práticos da sua comunidade, alertas preventivos ou proponha iniciativas sustentáveis..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-emerald-600 font-bold">+20 Eco-Pontos pela partilha</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Mensagem</span>
                </button>
              </div>
            </form>

            {/* Post Feed */}
            <div className="space-y-3">
              {forumPosts
                .filter(
                  (p) =>
                    selectedProvinceFilter === 'Todas' || p.province === selectedProvinceFilter
                )
                .map((post) => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white block text-xs">{post.author}</strong>
                          <span className="text-[10px] text-slate-400">{post.role} • {post.province}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{post.time}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{post.content}</p>

                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button className="flex items-center space-x-1 hover:text-teal-600 cursor-pointer">
                        <span>👍 {post.likes} apoios</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-teal-600 cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.comments} respostas</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Normas do Diálogo Comunitário</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Este espaço destina-se exclusivamente à proteção ecológica e bem-estar comunitário de Moçambique.
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">
                <li>Respeito mútuo entre comunidades tradicionais e técnicos.</li>
                <li>Proibição de mensagens com cunho comercial ou desinformação.</li>
                <li>Partilha de evidências e fotografias verificáveis no terreno.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RANKING CÍVICO & MEDALHAS DOS GUARDIÕES */}
      {activeTab === 'ranking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Ranking Nacional das Províncias Mais Verdes</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pontuação consolidada baseada em plantio comunitário, denúncias resolvidas e rondas de fiscalização.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { pos: 1, prov: 'Sofala', score: 14850, badge: '🏆 Campeã em Proteção de Mangais', delta: '+12% este mês' },
                  { pos: 2, prov: 'Maputo Província & Cidade', score: 12400, badge: '🥈 Destaque Limpeza Costeira', delta: '+8% este mês' },
                  { pos: 3, prov: 'Niassa', score: 11100, badge: '🥉 Guardiã do Miombo & Fauna', delta: '+15% este mês' },
                  { pos: 4, prov: 'Zambézia', score: 9800, badge: 'Viveiros Comunitários Ativos', delta: '+5% este mês' },
                  { pos: 5, prov: 'Cabo Delgado', score: 8650, badge: 'Proteção de Recifes & Ilhas', delta: '+9% este mês' },
                  { pos: 6, prov: 'Inhambane', score: 7920, badge: 'Santuário de Dugongos', delta: '+6% este mês' }
                ].map((item) => (
                  <div
                    key={item.prov}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                          item.pos === 1
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : item.pos === 2
                            ? 'bg-slate-300 text-slate-800 font-bold'
                            : item.pos === 3
                            ? 'bg-amber-700 text-white font-bold'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.pos}
                      </span>
                      <div>
                        <strong className="text-xs text-slate-900 dark:text-white block">{item.prov}</strong>
                        <span className="text-[10px] text-emerald-600 font-medium">{item.badge}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                        {item.score.toLocaleString('pt-MZ')} pts
                      </span>
                      <span className="text-[9px] text-slate-400 block">{item.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Minhas Medalhas & Distintivos Cívicos</span>
              </h3>
              <p className="text-xs text-slate-500">
                Conquistas desbloqueadas por ações ecológicas reais em Moçambique:
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                  <div className="text-2xl">🌱</div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Plantei 50 Mangais</div>
                  <div className="text-[9px] text-emerald-700 dark:text-emerald-400">Desbloqueado ✓</div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-center space-y-1">
                  <div className="text-2xl">🌊</div>
                  <div className="text-xs font-bold text-cyan-900 dark:text-cyan-200">Sentinela Costeira</div>
                  <div className="text-[9px] text-cyan-700 dark:text-cyan-400">Desbloqueado ✓</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1">
                  <div className="text-2xl">🔥</div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Vigia de Queimadas</div>
                  <div className="text-[9px] text-amber-700 dark:text-amber-400">Desbloqueado ✓</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1 opacity-60">
                  <div className="text-2xl">👑</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-300">Embaixador ECO-MZ</div>
                  <div className="text-[9px] text-slate-500">Bloqueado (Faltam 160 pts)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECURSOS COMUNITÁRIOS */}
      {activeTab === 'recursos' && (
        <CommunityResourcesDashboard />
      )}

      {/* MODAL: SUBMETER PROPOSTA CGRN */}
      {isNewProposalModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📝</span> Nova Proposta Comunitária CGRN
              </h3>
              <button
                onClick={() => setIsNewProposalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Título da Proposta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aquisição de Bomba Solar para Viveiro Comunitário..."
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Província</label>
                  <select
                    value={propProvince}
                    onChange={(e) => setPropProvince(e.target.value as MozambiqueProvince)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {Object.keys(MOZAMBIQUE_PROVINCES).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Distrito</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Búzi, Chókwè..."
                    value={propDistrict}
                    onChange={(e) => setPropDistrict(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Orçamento Estimado (MZN)</label>
                <input
                  type="number"
                  required
                  value={propBudget}
                  onChange={(e) => setPropBudget(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descrição e Justificativa Comunitária</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explique como este projeto beneficia a comunidade e ajuda na preservação ambiental..."
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProposalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Submeter Proposta (+30 pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

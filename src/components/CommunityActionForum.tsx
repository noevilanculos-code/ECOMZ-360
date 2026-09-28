import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Target,
  HeartHandshake,
  AlertTriangle,
  Flame,
  Droplets,
  Trees,
  Filter,
  Search,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Occurrence, MozambiqueProvince, EnvironmentalCategory } from '../types';

export interface ActionSolution {
  id: string;
  occurrenceId: string;
  occurrenceTitle: string;
  province: MozambiqueProvince;
  district: string;
  category: EnvironmentalCategory;
  title: string;
  author: string;
  authorRole: 'Cidadão Guardião' | 'Líder Comunitário' | 'Técnico Ambiental' | 'Associação Local';
  description: string;
  requiredResources: string;
  volunteersNeeded: number;
  volunteersEnrolled: number;
  votes: number;
  userVoted: boolean;
  userEnrolled: boolean;
  status: 'Proposta' | 'Em Organização' | 'Ação em Curso' | 'Concluída';
  createdAt: string;
  comments: Array<{
    id: string;
    author: string;
    role: string;
    time: string;
    text: string;
  }>;
}

export interface CommunityActionForumProps {
  initialOccurrenceId?: string;
  onSelectOccurrence?: (occ: Occurrence) => void;
  className?: string;
}

export const CommunityActionForum: React.FC<CommunityActionForumProps> = ({
  initialOccurrenceId,
  onSelectOccurrence,
  className = ''
}) => {
  const { occurrences, selectedProvince, setSelectedProvince } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('Todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todas');
  const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState<boolean>(false);
  const [selectedTargetOccId, setSelectedTargetOccId] = useState<string>(initialOccurrenceId || '');

  // Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newResources, setNewResources] = useState<string>('');
  const [newVolunteersCount, setNewVolunteersCount] = useState<number>(20);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Seeded Community Solutions connected to real occurrences
  const [solutions, setSolutions] = useState<ActionSolution[]>([
    {
      id: 'sol-01',
      occurrenceId: 'occ-002',
      occurrenceTitle: 'Destruição e Corte Ilegal de Mangais na Praia Nova',
      province: 'Sofala',
      district: 'Beira',
      category: 'Destruição de Mangais',
      title: 'Mutirão Comunitário de Plantio de 5.000 Propágulos & Patrulha Noturna',
      author: 'Mestre Arnaldo Cossa',
      authorRole: 'Líder Comunitário',
      description: 'Mobilização da Associação dos Pescadores Artesanais da Praia Nova para replantar a faixa entre-marés destruída e instituir uma escala de vigias para impedir o corte de estacas.',
      requiredResources: '5.000 propágulos de Rhizophora, 40 pares de botas de borracha, sacos de ráfia',
      volunteersNeeded: 50,
      volunteersEnrolled: 38,
      votes: 142,
      userVoted: false,
      userEnrolled: true,
      status: 'Ação em Curso',
      createdAt: 'Há 2 dias',
      comments: [
        {
          id: 'c-1',
          author: 'Marta Chissano (Bióloga Marinha)',
          role: 'Técnico Ambiental',
          time: 'Ontem às 14:20',
          text: 'Podemos disponibilizar o transporte das mudas a partir do viveiro de Búzi no próximo sábado.'
        },
        {
          id: 'c-2',
          author: 'Noé Vilanculos',
          role: 'Cidadão Guardião',
          time: 'Hoje às 09:15',
          text: 'Já me inscrevi com 4 membros da nossa cooperativa juvenil. Estaremos presentes!'
        }
      ]
    },
    {
      id: 'sol-02',
      occurrenceId: 'occ-001',
      occurrenceTitle: 'Queimada Descontrolada na Reserva Florestal do Niassa',
      province: 'Niassa',
      district: 'Mecula',
      category: 'Queimadas Descontroladas',
      title: 'Abertura de Faixas Corta-Fogo (Aceiros) com as Comunidades das Machambas',
      author: 'Chefe Tradicional Maleta',
      authorRole: 'Líder Comunitário',
      description: 'Reunião de aldeias para abertura de 12 km de aceiros limpos ao redor das machambas antes da queima de renovação de pasto, garantindo que o fogo não salte para a mata densa de Miombo.',
      requiredResources: 'Enxadas, foices, pás de bico, bidões de água de 20L',
      volunteersNeeded: 35,
      volunteersEnrolled: 29,
      votes: 98,
      userVoted: true,
      userEnrolled: false,
      status: 'Em Organização',
      createdAt: 'Há 3 dias',
      comments: [
        {
          id: 'c-3',
          author: 'Alberto C. (Fiscal Comunitário)',
          role: 'Técnico Ambiental',
          time: 'Há 2 dias',
          text: 'O vento no planalto está moderado (16 km/h SE), o momento é ideal para abrir os aceiros antes que as temperaturas atinjam 35°C.'
        }
      ]
    },
    {
      id: 'sol-03',
      occurrenceId: 'occ-003',
      occurrenceTitle: 'Descarga de Sedimentos e Efluentes Tóxicos no Rio Revubué',
      province: 'Tete',
      district: 'Moatize',
      category: 'Poluição Hídrica',
      title: 'Comissão Cidadã de Coleta de Água & Denúncia ao Ministério Público',
      author: 'Helena Sengulane',
      authorRole: 'Cidadão Guardião',
      description: 'Criação de um ponto de amostragem comunitário com testes rápidos de turbidez e pH para documentar o impacto na água de consumo e exigir barreiras de decantação das mineradoras.',
      requiredResources: 'Kits rápidos de pH/turbidez, frascos estéreis de vidro, transporte para laboratório',
      volunteersNeeded: 15,
      volunteersEnrolled: 12,
      votes: 115,
      userVoted: false,
      userEnrolled: false,
      status: 'Proposta',
      createdAt: 'Ontem',
      comments: [
        {
          id: 'c-4',
          author: 'Eng. Mateus Zimba',
          role: 'Técnico Ambiental',
          time: 'Ontem às 18:00',
          text: 'Excelente iniciativa. Já enviamos as coordenadas GPS para a Direção Provincial de Tete.'
        }
      ]
    },
    {
      id: 'sol-04',
      occurrenceId: 'occ-004',
      occurrenceTitle: 'Acúmulo de Lixo e Plásticos na Faixa de Dunas da Costa do Sol',
      province: 'Maputo Cidade',
      district: 'KaMavota',
      category: 'Resíduos Sólidos Urbanos',
      title: 'Campanha "Praia Viva": Instalação de Ecopontos Comunitários de Triagem',
      author: 'Juventude Ecológica de Maputo',
      authorRole: 'Associação Local',
      description: 'Instalação de tambores coloridos de separação de plásticos e redes de pesca, com parceria direta com cooperativas de catadores locais para reciclagem imediata.',
      requiredResources: '20 tambores de triagem metálicos pintados, sacos reforçados, luvas de proteção',
      volunteersNeeded: 40,
      volunteersEnrolled: 40,
      votes: 180,
      userVoted: true,
      userEnrolled: true,
      status: 'Concluída',
      createdAt: 'Há 5 dias',
      comments: [
        {
          id: 'c-5',
          author: 'Luísa Nhantumbo',
          role: 'Cidadão Guardião',
          time: 'Há 3 dias',
          text: 'Conseguimos recolher mais de 2.400 kg de plástico em apenas dois sábados. Parabéns a todos!'
        }
      ]
    }
  ]);

  // Filter solutions
  const filteredSolutions = solutions.filter((sol) => {
    if (selectedProvince !== 'Todas' && sol.province !== selectedProvince) return false;
    if (selectedFilterCategory !== 'Todas' && sol.category !== selectedFilterCategory) return false;
    if (selectedStatusFilter !== 'Todas' && sol.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sol.title.toLowerCase().includes(q);
      const matchOcc = sol.occurrenceTitle.toLowerCase().includes(q);
      const matchDesc = sol.description.toLowerCase().includes(q);
      const matchDistrict = sol.district.toLowerCase().includes(q);
      if (!matchTitle && !matchOcc && !matchDesc && !matchDistrict) return false;
    }
    return true;
  });

  const handleVote = (solId: string) => {
    setSolutions((prev) =>
      prev.map((s) => {
        if (s.id === solId) {
          const newVoted = !s.userVoted;
          return {
            ...s,
            userVoted: newVoted,
            votes: newVoted ? s.votes + 1 : s.votes - 1
          };
        }
        return s;
      })
    );
  };

  const handleEnroll = (solId: string) => {
    setSolutions((prev) =>
      prev.map((s) => {
        if (s.id === solId) {
          const newEnrolled = !s.userEnrolled;
          return {
            ...s,
            userEnrolled: newEnrolled,
            volunteersEnrolled: newEnrolled
              ? s.volunteersEnrolled + 1
              : Math.max(0, s.volunteersEnrolled - 1)
          };
        }
        return s;
      })
    );
  };

  const handleAddComment = (solId: string) => {
    const text = commentInputs[solId]?.trim();
    if (!text) return;

    setSolutions((prev) =>
      prev.map((s) => {
        if (s.id === solId) {
          return {
            ...s,
            comments: [
              ...s.comments,
              {
                id: `c-${Date.now()}`,
                author: 'Filipe Chinguema',
                role: 'Cidadão Guardião',
                time: 'Agora mesmo',
                text
              }
            ]
          };
        }
        return s;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [solId]: '' }));
  };

  const handleProposeSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const matchedOcc = occurrences.find((o) => o.id === selectedTargetOccId) || occurrences[0];

    const newSolution: ActionSolution = {
      id: `sol-${Date.now()}`,
      occurrenceId: matchedOcc ? matchedOcc.id : 'occ-geral',
      occurrenceTitle: matchedOcc ? matchedOcc.title : 'Denúncia Ambiental Comunitária',
      province: matchedOcc ? matchedOcc.province : 'Sofala',
      district: matchedOcc ? matchedOcc.district : 'Beira',
      category: matchedOcc ? matchedOcc.category : 'Destruição de Mangais',
      title: newTitle.trim(),
      author: 'Filipe Chinguema',
      authorRole: 'Cidadão Guardião',
      description: newDescription.trim(),
      requiredResources: newResources.trim() || 'Voluntários locais e ferramentas manuais',
      volunteersNeeded: newVolunteersCount,
      volunteersEnrolled: 1,
      votes: 1,
      userVoted: true,
      userEnrolled: true,
      status: 'Proposta',
      createdAt: 'Agora mesmo',
      comments: []
    };

    setSolutions([newSolution, ...solutions]);
    setIsProposeModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewResources('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#062B3D] via-[#09425E] to-[#0A5274] text-white p-6 sm:p-7 rounded-3xl border border-[#0A3D54] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2 shadow-xs">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-300" />
            <span>Colaboração Cívica & Ação Direta</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Fórum de Ação Comunitária
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Transforme denúncias em intervenções reais: proponha mutirões, organize aceiros e colabore com pescadores, líderes e técnicos ambientais para resolver problemas locais em Moçambique.
          </p>
        </div>

        <button
          onClick={() => setIsProposeModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Propor Solução Comunitária</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar with Buscar button */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar por denúncia, solução, bairro ou distrito..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="button"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Buscar no fórum"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="Todas">Todas as Províncias</option>
              {['Cabo Delgado', 'Niassa', 'Nampula', 'Zambézia', 'Tete', 'Manica', 'Sofala', 'Inhambane', 'Gaza', 'Maputo Província', 'Maputo Cidade'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="Todas">Todos os Estados</option>
              <option value="Proposta">Proposta</option>
              <option value="Em Organização">Em Organização</option>
              <option value="Ação em Curso">Ação em Curso</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>
        </div>
      </div>

      {/* Solutions Discussion List */}
      <div className="space-y-4">
        {filteredSolutions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
            <Lightbulb className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">Nenhuma solução encontrada com estes filtros.</p>
            <p className="text-xs">Seja o primeiro a propor uma iniciativa comunitária para esta denúncia!</p>
          </div>
        ) : (
          filteredSolutions.map((sol) => {
            const isExpanded = expandedSolutionId === sol.id;
            const statusColor =
              sol.status === 'Concluída'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                : sol.status === 'Ação em Curso'
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200'
                : sol.status === 'Em Organização'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200'
                : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200';

            return (
              <div
                key={sol.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-emerald-400/60"
              >
                {/* Linked Occurrence Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      🚨 Denúncia Vinculada
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {sol.occurrenceTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {sol.status}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{sol.createdAt}</span>
                    </span>
                  </div>
                </div>

                {/* Solution Title & Proposer Info */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {sol.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Por <strong>{sol.author}</strong> ({sol.authorRole})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{sol.district}, {sol.province}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {sol.description}
                </p>

                {/* Required Resources Badge */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recursos & Apoio Necessário:</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium">
                    {sol.requiredResources}
                  </span>
                </div>

                {/* Action Buttons & Metrics Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => handleVote(sol.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        sol.userVoted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{sol.votes} Apoios</span>
                    </button>

                    {/* Enroll Volunteer Button */}
                    <button
                      onClick={() => handleEnroll(sol.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        sol.userEnrolled
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {sol.userEnrolled
                          ? `Inscrito ✓ (${sol.volunteersEnrolled}/${sol.volunteersNeeded})`
                          : `Participar (${sol.volunteersEnrolled}/${sol.volunteersNeeded} voluntários)`}
                      </span>
                    </button>

                    {/* Toggle Comments Button */}
                    <button
                      onClick={() => setExpandedSolutionId(isExpanded ? null : sol.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>{sol.comments.length} Respostas</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                    +15 Eco-Pontos por apoiar
                  </span>
                </div>

                {/* Expanded Discussion Thread */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Debate Cívico & Coordenação de Solução:</span>
                    </h5>

                    {/* Existing Comments */}
                    <div className="space-y-2">
                      {sol.comments.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Ainda não há mensagens. Partilhe a sua ideia ou como pode ajudar neste mutirão!
                        </p>
                      ) : (
                        sol.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-slate-100">
                                {c.author} <span className="font-normal text-slate-400">({c.role})</span>
                              </span>
                              <span className="text-slate-400 text-[10px]">{c.time}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                              {c.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input Box */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Contribuir com recursos, ideia ou confirmação de presença..."
                        value={commentInputs[sol.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [sol.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(sol.id);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(sol.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Propose Solution Modal */}
      {isProposeModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-800 dark:text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Propor Solução Comunitária
                </h3>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposeSolution} className="space-y-3.5 text-xs">
              {/* Linked Occurrence Select */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vincular a uma Denúncia Ativa:
                </label>
                <select
                  value={selectedTargetOccId}
                  onChange={(e) => setSelectedTargetOccId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {occurrences.map((occ) => (
                    <option key={occ.id} value={occ.id}>
                      [{occ.province}] {occ.title} ({occ.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Título da Solução ou Mutirão:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mutirão de Plantio de 3.000 Propágulos com Pescadores de Búzi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Plano de Ação e Como a Comunidade Irá Resolver:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva a metodologia prática, o local de encontro, datas e como os cidadãos participarão..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Required Resources */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recursos Necessários (Mudas, Sacos, Ferramentas, Transporte):
                </label>
                <input
                  type="text"
                  placeholder="Ex: 50 sacos de ráfia, luvas de proteção, carrinha de transporte"
                  value={newResources}
                  onChange={(e) => setNewResources(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Volunteers Needed */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meta de Voluntários Necessários:
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={newVolunteersCount}
                  onChange={(e) => setNewVolunteersCount(parseInt(e.target.value) || 10)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publicar no Fórum de Ação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

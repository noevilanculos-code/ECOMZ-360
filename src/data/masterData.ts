import {
  Occurrence,
  EnvironmentalProject,
  MozambiqueProvince,
  OccurrenceStatus
} from '../types';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  organization: string;
  functionTitle: string;
  language: string;
  avatarUrl: string;
  memberSince: string;
  status: 'Online' | 'Offline';
}

export interface NoticeItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'Importante' | 'Geral';
  read: boolean;
  category: string;
  summary: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Ambiente' | 'Projetos' | 'Eventos';
  date: string;
  summary: string;
  imageUrl: string;
  source: string;
  readTime: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: 'Qualidade da água' | 'Desmatamento' | 'Mudanças climáticas' | 'Qualidade do ar';
  location: string;
  date: string;
  status: 'Concluída' | 'Em análise';
  progress: number;
  imageUrl: string;
  impactScore?: number;
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'Gerais' | 'Ocorrências' | 'Projetos' | 'Simulações';
  type: string;
  date: string;
  time: string;
  status: 'Concluído' | 'Em processamento';
  format: 'PDF' | 'Excel' | 'CSV';
  description: string;
  downloadsCount: number;
}

// Initial Data matching exact user references and master prompt
export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Utilizador ECO-MZ',
  role: 'Cidadão',
  email: '',
  phone: '',
  location: 'Moçambique',
  organization: 'ECO-MZ 360',
  functionTitle: 'Utilizador da plataforma',
  language: 'Português',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  memberSince: '',
  status: 'Online'
};

export const MASTER_OCCURRENCES: Occurrence[] = [
  {
    id: 'ECO-001',
    protocol: 'ECO-2026-MZ-001',
    title: 'Poluição do rio',
    category: 'Poluição Hídrica',
    severity: 'Alto',
    province: 'Manica',
    district: 'Manica',
    locationDetails: 'Rio Inhampué – Manica',
    coordinates: { lat: -16.1234, lng: 33.4567 },
    reportedBy: 'Cidadão',
    isAnonymous: false,
    timestamp: 'Hoje, 10:24',
    status: 'Em Intervenção', // maps to 'Em análise' / 'Em intervenção'
    description: 'Evidenciada presença de resíduos sólidos e possível contaminação da água no leito do rio Inhampué com descarga de efluentes industriais.',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg',
    validationScore: 94,
    assignedTeam: 'Brigada de Qualidade Ambiental AQUA',
    actionSummary: '3 fotos e 1 vídeo registados. Análise físico-química de amostras hídricas em curso.'
  },
  {
    id: 'ECO-002',
    protocol: 'ECO-2026-MZ-002',
    title: 'Desmatamento',
    category: 'Desmatamento',
    severity: 'Crítico',
    province: 'Tete',
    district: 'Tete',
    locationDetails: 'Tete, Tete',
    coordinates: { lat: -16.1564, lng: 33.5863 },
    reportedBy: 'Guarda Florestal',
    isAnonymous: false,
    timestamp: 'Hoje, 09:17',
    status: 'Validado',
    description: 'Abate ilegal de árvores de espécies nativas na área de conservação com maquinaria pesada não autorizada.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    validationScore: 98,
    assignedTeam: 'ANAC / Direcção Provincial de Florestas',
    actionSummary: 'Área embargada e autos de infração emitidos sob a Lei 20/97.'
  },
  {
    id: 'ECO-003',
    protocol: 'ECO-2026-MZ-003',
    title: 'Queimadas',
    category: 'Queimadas Descontroladas',
    severity: 'Alto',
    province: 'Zambézia',
    district: 'Zambézia',
    locationDetails: 'Zambézia, Zambézia',
    coordinates: { lat: -17.8786, lng: 36.8883 },
    reportedBy: 'Comunidade Agrícola',
    isAnonymous: true,
    timestamp: 'Ontem, 16:42',
    status: 'Recebido', // Atribuída
    description: 'Queimadas na zona agrícola próxima à reserva natural com alastramento perigoso devido aos ventos fortes.',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    validationScore: 89,
    assignedTeam: 'Bombeiros e Voluntários Comunitários',
    actionSummary: 'Criação de aceiros de contenção e monitoramento térmico via satélite.'
  },
  {
    id: 'ECO-004',
    protocol: 'ECO-2026-MZ-004',
    title: 'Resíduos sólidos',
    category: 'Resíduos Sólidos Urbanos',
    severity: 'Médio',
    province: 'Maputo Cidade',
    district: 'Maputo',
    locationDetails: 'Maputo, Maputo',
    coordinates: { lat: -25.9692, lng: 32.5732 },
    reportedBy: 'Cidadão Guardião',
    isAnonymous: false,
    timestamp: 'Ontem, 11:30',
    status: 'Resolvido',
    description: 'Acumulação de resíduos plásticos e lixo na orla marítima e faixa de drenagem pluvial.',
    imageUrl: '/assets/img/eco/residuos.jpg',
    validationScore: 92,
    assignedTeam: 'Conselho Municipal de Maputo / Salubridade',
    actionSummary: 'Recolha mecanizada de 14 toneladas de resíduos e colocação de contentores de triagem.'
  },
  {
    id: 'ECO-005',
    protocol: 'ECO-2026-MZ-005',
    title: 'Erosão costeira',
    category: 'Erosão Costeira/Pluvial',
    severity: 'Alto',
    province: 'Inhambane',
    district: 'Inhambane',
    locationDetails: 'Inhambane, Inhambane',
    coordinates: { lat: -23.8650, lng: 35.3833 },
    reportedBy: 'Associação de Pescadores',
    isAnonymous: false,
    timestamp: '2 dias atrás, 09:15',
    status: 'Em Intervenção',
    description: 'Avanço do mar na linha de costa de Inhambane com descalçamento de dunas vegetadas e vias de acesso.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    validationScore: 95,
    assignedTeam: 'Engenharia Costeira MTA',
    actionSummary: 'Instalação de enrocamento emergencial e barreiras geossintéticas para contenção marinha.'
  },
  {
    id: 'ECO-006',
    protocol: 'ECO-2026-MZ-006',
    title: 'Invasoras',
    category: 'Destruição de Mangais',
    severity: 'Médio',
    province: 'Nampula',
    district: 'Nampula',
    locationDetails: 'Nampula, Nampula',
    coordinates: { lat: -15.1165, lng: 39.2666 },
    reportedBy: 'Universidade Lúrio',
    isAnonymous: false,
    timestamp: '2 dias atrás, 14:27',
    status: 'Validado',
    description: 'Espécies vegetais invasoras proliferando na área húmida e asfixiando a flora endémica local.',
    imageUrl: '/assets/img/eco/mangais.jpg',
    validationScore: 88,
    assignedTeam: 'Equipa Botânica UniLúrio & SDAE'
  },
  {
    id: 'ECO-007',
    protocol: 'ECO-2026-MZ-007',
    title: 'Qualidade da água',
    category: 'Poluição Hídrica',
    severity: 'Alto',
    province: 'Sofala',
    district: 'Beira',
    locationDetails: 'Beira, Sofala',
    coordinates: { lat: -19.8436, lng: 34.8389 },
    reportedBy: 'Fiscal AQUA Beira',
    isAnonymous: false,
    timestamp: '3 dias atrás, 08:03',
    status: 'Em Intervenção',
    description: 'Contaminação por resíduos químicos industriais com turbidez anómala detectada na foz da bacia.',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg',
    validationScore: 96,
    assignedTeam: 'Laboratório Central de Águas da Beira'
  },
  {
    id: 'ECO-008',
    protocol: 'ECO-2026-MZ-008',
    title: 'Biodiversidade',
    category: 'Caça Furtiva & Biodiversidade',
    severity: 'Crítico',
    province: 'Zambézia',
    district: 'Quelimane',
    locationDetails: 'Quelimane, Zambézia',
    coordinates: { lat: -17.8786, lng: 36.8883 },
    reportedBy: 'Patrulha Marítima ANAC',
    isAnonymous: false,
    timestamp: '4 dias atrás, 17:20',
    status: 'Validado',
    description: 'Tentativa de captura e comércio ilegal de espécies marinhas protegidas e corais costeiros.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80',
    validationScore: 97,
    assignedTeam: 'Polícia Costeira e Fiscalização ANAC'
  },
  {
    id: 'ECO-009',
    protocol: 'ECO-2026-MZ-009',
    title: 'Destruição de Mangais na Baía de Pemba',
    category: 'Destruição de Mangais',
    severity: 'Crítico',
    province: 'Cabo Delgado',
    district: 'Pemba',
    locationDetails: 'Orla costeira de Paquitequete, Baía de Pemba',
    coordinates: { lat: -12.9732, lng: 40.5178 },
    reportedBy: 'Comunidade Pesqueira',
    isAnonymous: false,
    timestamp: 'Hoje, 07:15',
    status: 'Em Intervenção',
    description: 'Abate indiscriminado de mangal vermelho para fabrico de estacas e carvão vegetal com erosão das barreiras costeiras.',
    imageUrl: '/assets/img/eco/mangais.jpg',
    validationScore: 93,
    assignedTeam: 'Brigada Florestal SDAE Pemba',
    actionSummary: 'Apreensão de machados e embargo preventivo na faixa marinha.'
  },
  {
    id: 'ECO-010',
    protocol: 'ECO-2026-MZ-010',
    title: 'Garimpo Ilegal em Montepuez',
    category: 'Mineração Ilegal',
    severity: 'Crítico',
    province: 'Cabo Delgado',
    district: 'Montepuez',
    locationDetails: 'Bacia do Rio Lúrio, proximidade da Mina de Rubis',
    coordinates: { lat: -13.1256, lng: 38.9997 },
    reportedBy: 'Fiscal de Minas AQUA',
    isAnonymous: false,
    timestamp: 'Ontem, 15:40',
    status: 'Validado',
    description: 'Escavações a céu aberto com destruição da mata ciliar e contaminação de águas com mercúrio e óleos minerais.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    validationScore: 96,
    assignedTeam: 'AQUA & Polícia de Proteção Ambiental'
  },
  {
    id: 'ECO-011',
    protocol: 'ECO-2026-MZ-011',
    title: 'Queimada no Corredor Ecológico de Marrupa',
    category: 'Queimadas Descontroladas',
    severity: 'Alto',
    province: 'Niassa',
    district: 'Marrupa',
    locationDetails: 'EN14 próximo à Reserva Especial do Niassa',
    coordinates: { lat: -13.3128, lng: 35.2406 },
    reportedBy: 'Líder Comunitário',
    isAnonymous: false,
    timestamp: '2 dias atrás, 12:10',
    status: 'Resolvido',
    description: 'Fogo iniciado para limpeza agrária que avançou para a faixa de proteção da fauna selvagem.',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    validationScore: 91,
    assignedTeam: 'Brigada Comunitária Anti-Queimadas de Lichinga',
    actionSummary: 'Aceiro de 4 km construído e fogo extinto em colaboração com os guardas florestais.'
  },
  {
    id: 'ECO-012',
    protocol: 'ECO-2026-MZ-012',
    title: 'Desmatamento de Madeira Preciosa em Mecula',
    category: 'Desmatamento',
    severity: 'Alto',
    province: 'Niassa',
    district: 'Mecula',
    locationDetails: 'Floresta de Miombo, Zona de Mecula Sul',
    coordinates: { lat: -12.0711, lng: 37.6258 },
    reportedBy: 'Guarda Parque ANAC',
    isAnonymous: false,
    timestamp: '3 dias atrás, 16:30',
    status: 'Em Intervenção',
    description: 'Corte clandestino de pau-rosa e chanfuta com trilhas ilegais abertas para transporte rodoviário.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    validationScore: 95,
    assignedTeam: 'ANAC Niassa & Força Policial de Recursos Naturais'
  },
  {
    id: 'ECO-013',
    protocol: 'ECO-2026-MZ-013',
    title: 'Salinização e Erosão Agrícola no Baixo Limpopo',
    category: 'Erosão Costeira/Pluvial',
    severity: 'Médio',
    province: 'Gaza',
    district: 'Chókwè',
    locationDetails: 'Regadio de Chókwè, Canais Secundários',
    coordinates: { lat: -24.5333, lng: 32.9833 },
    reportedBy: 'Associação de Regantes',
    isAnonymous: false,
    timestamp: 'Ontem, 08:50',
    status: 'Validado',
    description: 'Degradação dos diques de contenção e infiltração salina com perda de fertilidade em 150 hectares agrícolas.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    validationScore: 87,
    assignedTeam: 'Direcção Provincial de Agricultura de Gaza'
  },
  {
    id: 'ECO-014',
    protocol: 'ECO-2026-MZ-014',
    title: 'Despejo de Entulho na Praia de Xai-Xai',
    category: 'Resíduos Sólidos Urbanos',
    severity: 'Médio',
    province: 'Gaza',
    district: 'Xai-Xai',
    locationDetails: 'Praia de Xai-Xai, Encosta das Dunas',
    coordinates: { lat: -25.0444, lng: 33.6406 },
    reportedBy: 'Operador Turístico',
    isAnonymous: false,
    timestamp: '4 dias atrás, 10:15',
    status: 'Resolvido',
    description: 'Depósito clandestino de restos de construção civil ameaçando a estabilidade do cordão dunar.',
    imageUrl: '/assets/img/eco/residuos.jpg',
    validationScore: 90,
    assignedTeam: 'Conselho Municipal de Xai-Xai',
    actionSummary: 'Remoção de 8 caçambas de entulho e aplicação de coima ao infrator.'
  },
  {
    id: 'ECO-015',
    protocol: 'ECO-2026-MZ-015',
    title: 'Poluição Química no Rio Matola',
    category: 'Poluição Hídrica',
    severity: 'Crítico',
    province: 'Maputo Província',
    district: 'Matola',
    locationDetails: 'Bacia do Rio Matola, Parque Industrial',
    coordinates: { lat: -25.9622, lng: 32.4589 },
    reportedBy: 'Técnico de Saúde Ambiental',
    isAnonymous: false,
    timestamp: 'Hoje, 06:45',
    status: 'Em Intervenção',
    description: 'Descarga direta de resíduos oleosos e efluentes industriais com mortandade de peixes e forte odor tóxico.',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg',
    validationScore: 97,
    assignedTeam: 'AQUA Agência de Qualidade Ambiental & SDAE Matola'
  },
  {
    id: 'ECO-016',
    protocol: 'ECO-2026-MZ-016',
    title: 'Invasão Urbana em Zonas Húmidas de Boane',
    category: 'Destruição de Mangais',
    severity: 'Alto',
    province: 'Maputo Província',
    district: 'Boane',
    locationDetails: 'Margens da Barragem dos Pequenos Libombos, Boane',
    coordinates: { lat: -26.0422, lng: 32.3314 },
    reportedBy: 'Comissão de Moradores',
    isAnonymous: false,
    timestamp: '3 dias atrás, 14:00',
    status: 'Validado',
    description: 'Aterro clandestino de leito de inundação natural para construção irregular com risco de cheias.',
    imageUrl: '/assets/img/eco/mangais.jpg',
    validationScore: 89,
    assignedTeam: 'Município de Boane & Fiscalização de Obras'
  },
  {
    id: 'ECO-017',
    protocol: 'ECO-2026-MZ-017',
    title: 'Erosão no Talude da EN1 em Dondo',
    category: 'Erosão Costeira/Pluvial',
    severity: 'Alto',
    province: 'Sofala',
    district: 'Dondo',
    locationDetails: 'KM 32 da EN1, proximidade de Mafambisse',
    coordinates: { lat: -19.6094, lng: 34.7431 },
    reportedBy: 'ANE - Administração Nacional de Estradas',
    isAnonymous: false,
    timestamp: '2 dias atrás, 11:20',
    status: 'Em Intervenção',
    description: 'Ravina de grandes proporções avançando sobre a berma da estrada principal com perigo de corte de tráfego.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    validationScore: 94,
    assignedTeam: 'ANE Sofala & Empresa Construtora'
  },
  {
    id: 'ECO-018',
    protocol: 'ECO-2026-MZ-018',
    title: 'Poluição Atmosférica por Carvão no Moatize',
    category: 'Resíduos Sólidos Urbanos',
    severity: 'Alto',
    province: 'Tete',
    district: 'Moatize',
    locationDetails: 'Vilas de reassentamento próximas às minas de carvão',
    coordinates: { lat: -16.1189, lng: 33.7314 },
    reportedBy: 'Organização Não Governamental',
    isAnonymous: false,
    timestamp: 'Ontem, 17:05',
    status: 'Validado',
    description: 'Emissões elevadas de poeiras fugitivas de carvão afetando a saúde respiratória e mananciais de água locais.',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    validationScore: 92,
    assignedTeam: 'Direcção Provincial de Terras e Ambiente de Tete'
  },
  {
    id: 'ECO-019',
    protocol: 'ECO-2026-MZ-019',
    title: 'Queimada Descontrolada em Sussundenga',
    category: 'Queimadas Descontroladas',
    severity: 'Médio',
    province: 'Manica',
    district: 'Sussundenga',
    locationDetails: 'Encostas do Monte Binga, Parque Nacional de Chimanimani',
    coordinates: { lat: -19.4167, lng: 33.2833 },
    reportedBy: 'Guia Turístico',
    isAnonymous: false,
    timestamp: 'Hoje, 08:30',
    status: 'Resolvido',
    description: 'Incêndio florestal em pastagens alpinas contido prontamente pela brigada de guardas-parque.',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    validationScore: 90,
    assignedTeam: 'ANAC Chimanimani',
    actionSummary: 'Extinção manual e rescaldo concluído com 15 hectares de savana preservados.'
  },
  {
    id: 'ECO-020',
    protocol: 'ECO-2026-MZ-020',
    title: 'Despejo de Óleos Usados na Costa de Nacala',
    category: 'Poluição Hídrica',
    severity: 'Crítico',
    province: 'Nampula',
    district: 'Nacala-Porto',
    locationDetails: 'Baía de Nacala, Área Portuária Industrial',
    coordinates: { lat: -14.5428, lng: 40.6728 },
    reportedBy: 'Autoridade Portuária',
    isAnonymous: false,
    timestamp: 'Hoje, 05:40',
    status: 'Em Intervenção',
    description: 'Derrame de combustível por embarcação pesqueira clandestina com risco direto para a fauna marinha e corais.',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg',
    validationScore: 96,
    assignedTeam: 'INAMAR - Instituto Nacional da Marinha & AQUA'
  }
];

export const MASTER_PROJECTS: EnvironmentalProject[] = [
  {
    id: 'PROJ-001',
    title: 'Proteção da Costa de Inhambane',
    category: 'Destruição de Mangais',
    province: 'Inhambane',
    district: 'Inhambane',
    leadEntity: 'Associação Marítima & MTA Inhambane',
    status: 'Em Execução',
    progress: 68,
    budgetTotalMZN: 1200000,
    budgetRaisedMZN: 816000,
    startDate: '01/03/2025',
    targetDate: '31/12/2025',
    description: 'Conservação da linha costeira e proteção dos ecossistemas marinhos em Inhambane através da restauração de dunas e corais.',
    keyMetric: 'Quilómetros de costa protegidos',
    keyMetricAchieved: '24 km / 35 km',
    volunteerSpots: 20,
    volunteersEnrolled: 12
  },
  {
    id: 'PROJ-002',
    title: 'Gestão de Resíduos Sólidos',
    category: 'Resíduos Sólidos Urbanos',
    province: 'Maputo Cidade',
    district: 'Maputo',
    leadEntity: 'Conselho Municipal de Maputo & Parceiros',
    status: 'Planeado',
    progress: 32,
    budgetTotalMZN: 850000,
    budgetRaisedMZN: 272000,
    startDate: '15/02/2025',
    targetDate: '30/09/2025',
    description: 'Melhoria da gestão de resíduos sólidos urbanos e promoção da reciclagem e economia circular nas comunidades vulneráveis.',
    keyMetric: 'Ecopontos instalados',
    keyMetricAchieved: '4 / 12 ecopontos',
    volunteerSpots: 15,
    volunteersEnrolled: 8
  },
  {
    id: 'PROJ-003',
    title: 'Reflorestamento de Áreas Degradadas',
    category: 'Desmatamento',
    province: 'Zambézia',
    district: 'Nicoadala',
    leadEntity: 'Consórcio Agroflorestal da Zambézia',
    status: 'Concluído',
    progress: 100,
    budgetTotalMZN: 2500000,
    budgetRaisedMZN: 2500000,
    startDate: '10/01/2025',
    targetDate: '28/02/2026',
    description: 'Recuperação de áreas florestais degradadas através do plantio intensivo de espécies nativas e proteção rigorosa de nascentes hídricas.',
    keyMetric: 'Árvores nativas plantadas',
    keyMetricAchieved: '50.000 / 50.000',
    volunteerSpots: 30,
    volunteersEnrolled: 25
  },
  {
    id: 'PROJ-004',
    title: 'Educação Ambiental Comunitária',
    category: 'Caça Furtiva & Biodiversidade',
    province: 'Nampula',
    district: 'Nampula',
    leadEntity: 'Rede de Escolas Verdes & UniLúrio',
    status: 'Em Execução',
    progress: 55,
    budgetTotalMZN: 920000,
    budgetRaisedMZN: 506000,
    startDate: '05/04/2025',
    targetDate: '20/12/2025',
    description: 'Capacitação e sensibilização de comunidades e escolas sobre práticas ambientais sustentáveis, conservação e gestão de recursos naturais.',
    keyMetric: 'Comunidades capacitadas',
    keyMetricAchieved: '11 / 20 núcleos',
    volunteerSpots: 25,
    volunteersEnrolled: 18
  }
];

export const MASTER_NOTICES: NoticeItem[] = [
  {
    id: 'not-1',
    title: 'Limpeza das margens do rio Incomáti',
    timestamp: 'Hoje, 09:00',
    type: 'Importante',
    read: false,
    category: 'Ação Comunitária',
    summary: 'Mobilização geral de brigadas voluntárias para recolha de resíduos plásticos ao longo da bacia do Incomáti.'
  },
  {
    id: 'not-2',
    title: 'Atualização do sistema ECO-MZ 360 v1.1',
    timestamp: 'Ontem, 18:30',
    type: 'Geral',
    read: true,
    category: 'Tecnologia',
    summary: 'Melhorias de desempenho nas camadas cartográficas de satélite e integração com o feed ECO-Pulse.'
  },
  {
    id: 'not-3',
    title: 'Reunião do conselho técnico provincial',
    timestamp: '14/05/2025',
    type: 'Importante',
    read: true,
    category: 'Institucional',
    summary: 'Alinhamento estratégico entre a Direcção Provincial do MTA e fiscais municipais sobre o combate a queimadas.'
  },
  {
    id: 'not-4',
    title: 'Campanha de sensibilização ambiental nas escolas',
    timestamp: '10/05/2025',
    type: 'Geral',
    read: true,
    category: 'Educação',
    summary: 'Distribuição de manuais educativos sobre proteção dos mangais e gestão de resíduos sólidos em Gaza e Inhambane.'
  }
];

export const MASTER_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Moçambique reforça compromisso com a conservação ambiental',
    category: 'Ambiente',
    date: '12 de Maio de 2025',
    summary: 'O governo de Moçambique anunciou novas medidas estratégicas para a proteção e regeneração dos ecossistemas marinhos e terrestres em todo o país.',
    imageUrl: '/assets/img/eco/mangais.jpg',
    source: 'MTA Notícias',
    readTime: '3 min de leitura'
  },
  {
    id: 'news-2',
    title: 'Lançado novo projeto de reflorestamento em Gaza',
    category: 'Projetos',
    date: '16 de Abril de 2025',
    summary: 'Iniciativa prevê o plantio de mais de 50 mil árvores nativas com foco na contenção da desertificação e proteção das margens do Rio Limpopo.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    source: 'Gabinete Provincial de Gaza',
    readTime: '4 min de leitura'
  },
  {
    id: 'news-3',
    title: 'Alerta de risco de inundações para Nampula',
    category: 'Eventos',
    date: '08 de Abril de 2025',
    summary: 'Autoridades meteorológicas emitem aviso antecipado para a bacia hidrográfica do Monapo face à previsão de precipitação intensa nos próximos dias.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    source: 'INGD Moçambique',
    readTime: '2 min de leitura'
  },
  {
    id: 'news-4',
    title: 'Relatório ambiental de 2024 disponível',
    category: 'Ambiente',
    date: '20 de Março de 2025',
    summary: 'Documento apresenta balanço detalhado dos indicadores de cobertura florestal, resíduos sólidos e qualidade hídrica em todas as 11 províncias.',
    imageUrl: '/assets/img/eco/residuos.jpg',
    source: 'Observatório ECO-MZ',
    readTime: '5 min de leitura'
  }
];

export const MASTER_SIMULATIONS: SimulationScenario[] = [
  {
    id: 'sim-1',
    title: 'Cenário de reflorestamento',
    category: 'Desmatamento',
    location: 'Zambézia',
    date: '12/09/2025',
    status: 'Concluída',
    progress: 100,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    impactScore: 88
  },
  {
    id: 'sim-2',
    title: 'Impacto da urbanização',
    category: 'Mudanças climáticas',
    location: 'Maputo',
    date: '05/09/2025',
    status: 'Em análise',
    progress: 45,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    impactScore: 62
  },
  {
    id: 'sim-3',
    title: 'Gestão de resíduos',
    category: 'Qualidade do ar',
    location: 'Nampula',
    date: '28/04/2025',
    status: 'Concluída',
    progress: 100,
    imageUrl: '/assets/img/eco/residuos.jpg',
    impactScore: 79
  }
];

export const MASTER_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'Relatório Ambiental 2024',
    category: 'Gerais',
    type: 'Geral',
    date: '15/05/2025',
    time: '10:24',
    status: 'Concluído',
    format: 'PDF',
    description: 'Resumo das principais ocorrências, projetos e indicadores ambientais consolidados de 2024.',
    downloadsCount: 142
  },
  {
    id: 'rep-2',
    title: 'Ocorrências por Região',
    category: 'Ocorrências',
    type: 'Ocorrências',
    date: '14/05/2025',
    time: '16:32',
    status: 'Concluído',
    format: 'PDF',
    description: 'Análise espacial e estatística detalhada das ocorrências ambientais por província e distrito de Moçambique.',
    downloadsCount: 88
  },
  {
    id: 'rep-3',
    title: 'Projetos em Execução',
    category: 'Projetos',
    type: 'Projetos',
    date: '12/05/2025',
    time: '09:18',
    status: 'Concluído',
    format: 'PDF',
    description: 'Lista e status físico-financeiro de todos os projetos ambientais em andamento.',
    downloadsCount: 65
  },
  {
    id: 'rep-4',
    title: 'Indicadores Ambientais',
    category: 'Gerais',
    type: 'Geral',
    date: '10/05/2025',
    time: '14:05',
    status: 'Concluído',
    format: 'PDF',
    description: 'Evolução temporal dos principais indicadores ecológicos (água, ar, solo, biodiversidade).',
    downloadsCount: 110
  },
  {
    id: 'rep-5',
    title: 'Relatório de Simulações',
    category: 'Simulações',
    type: 'Simulações',
    date: '08/05/2025',
    time: '11:42',
    status: 'Concluído',
    format: 'PDF',
    description: 'Resultados das simulações de cenários climáticos, desmatamento e impacto ambiental.',
    downloadsCount: 47
  },
  {
    id: 'rep-6',
    title: 'Relatório de Participação Comunitária',
    category: 'Gerais',
    type: 'Geral',
    date: '05/05/2025',
    time: '15:27',
    status: 'Concluído',
    format: 'PDF',
    description: 'Dados de voluntariado comunitário, comités locais de gestão de recursos e engajamento social.',
    downloadsCount: 39
  },
  {
    id: 'rep-7',
    title: 'Relatório Financeiro de Projetos',
    category: 'Projetos',
    type: 'Projetos',
    date: '02/05/2025',
    time: '10:11',
    status: 'Concluído',
    format: 'PDF',
    description: 'Uso de fundos, doações e parcerias institucionais aplicadas em conservação no terreno.',
    downloadsCount: 52
  }
];

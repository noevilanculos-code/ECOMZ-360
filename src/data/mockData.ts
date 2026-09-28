import {
  Occurrence,
  EnvironmentalProject,
  FieldActionTask,
  VolunteerOpportunity,
  GreenSealCert,
  EarlyAlert,
  EducationalModule,
  MozambiqueProvince,
  ReforestationKitItem,
  CommunityWaterPoint,
  ClimateScenarioConfig
} from '../types';

export interface ProvinceInfo {
  name: MozambiqueProvince;
  capital: string;
  population: string;
  areaKm2: string;
  lat: number;
  lng: number;
  vulnerabilityIndex: number; // 0 - 100
  dominantThreats: string[];
}

export const MOZAMBIQUE_PROVINCES: Record<MozambiqueProvince, ProvinceInfo> = {
  'Cabo Delgado': {
    name: 'Cabo Delgado',
    capital: 'Pemba',
    population: '2.3M',
    areaKm2: '82.625 km²',
    lat: -12.9732,
    lng: 40.5178,
    vulnerabilityIndex: 78,
    dominantThreats: ['Destruição de Mangais', 'Garimpo Ilegal de Rubis', 'Erosão Costeira']
  },
  'Niassa': {
    name: 'Niassa',
    capital: 'Lichinga',
    population: '1.8M',
    areaKm2: '129.056 km²',
    lat: -13.3128,
    lng: 35.2406,
    vulnerabilityIndex: 64,
    dominantThreats: ['Queimadas Descontroladas', 'Desmatamento Florestal', 'Caça Furtiva']
  },
  'Nampula': {
    name: 'Nampula',
    capital: 'Nampula',
    population: '6.1M',
    areaKm2: '81.606 km²',
    lat: -15.1165,
    lng: 39.2666,
    vulnerabilityIndex: 72,
    dominantThreats: ['Resíduos Sólidos Urbanos', 'Degradação de Solos', 'Erosão Pluvial']
  },
  'Zambézia': {
    name: 'Zambézia',
    capital: 'Quelimane',
    population: '5.1M',
    areaKm2: '105.008 km²',
    lat: -17.8786,
    lng: 36.8883,
    vulnerabilityIndex: 85,
    dominantThreats: ['Inundações Cíclicas', 'Desmatamento de Madeiras Nativas', 'Degradação de Mangais']
  },
  'Tete': {
    name: 'Tete',
    capital: 'Tete',
    population: '2.7M',
    areaKm2: '100.724 km²',
    lat: -16.1564,
    lng: 33.5863,
    vulnerabilityIndex: 69,
    dominantThreats: ['Poluição por Poeiras de Carvão', 'Poluição Hídrica no Rio Zambeze', 'Seca Severa']
  },
  'Manica': {
    name: 'Manica',
    capital: 'Chimoio',
    population: '1.9M',
    areaKm2: '61.661 km²',
    lat: -19.1164,
    lng: 33.4833,
    vulnerabilityIndex: 61,
    dominantThreats: ['Garimpo Fluvial de Ouro', 'Contaminação de Rios por Mercúrio', 'Erosão']
  },
  'Sofala': {
    name: 'Sofala',
    capital: 'Beira',
    population: '2.2M',
    areaKm2: '68.018 km²',
    lat: -19.8436,
    lng: 34.8389,
    vulnerabilityIndex: 91,
    dominantThreats: ['Ciclones Tropicais', 'Erosão Costeira Crítica', 'Inundações da Bacia do Púnguè']
  },
  'Inhambane': {
    name: 'Inhambane',
    capital: 'Inhambane',
    population: '1.5M',
    areaKm2: '68.615 km²',
    lat: -23.8650,
    lng: 35.3833,
    vulnerabilityIndex: 66,
    dominantThreats: ['Erosão de Dunas Costeiras', 'Pesca Precocious', 'Degradação de Recifes de Coral']
  },
  'Gaza': {
    name: 'Gaza',
    capital: 'Xai-Xai',
    population: '1.4M',
    areaKm2: '75.709 km²',
    lat: -25.0444,
    lng: 33.6406,
    vulnerabilityIndex: 74,
    dominantThreats: ['Seca Extrema no Alto Limpopo', 'Cheias no Baixo Limpopo', 'Salinização de Terrenos']
  },
  'Maputo Província': {
    name: 'Maputo Província',
    capital: 'Matola',
    population: '2.0M',
    areaKm2: '26.058 km²',
    lat: -25.9622,
    lng: 32.4589,
    vulnerabilityIndex: 68,
    dominantThreats: ['Poluição Industrial no Rio Matola', 'Ocupação Desordenada de Zonas Húmidas', 'Resíduos']
  },
  'Maputo Cidade': {
    name: 'Maputo Cidade',
    capital: 'Maputo',
    population: '1.1M',
    areaKm2: '347 km²',
    lat: -25.9692,
    lng: 32.5732,
    vulnerabilityIndex: 63,
    dominantThreats: ['Depósitos Ilegais de Lixo', 'Inundações Urbanas no Bairro Hulene', 'Poluição da Baía']
  }
};

export const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: 'occ-001',
    protocol: 'ECO-2026-MZ-001',
    title: 'Corte Ilegal e Queimada em Mangais de Munhava',
    category: 'Destruição de Mangais',
    severity: 'Crítico',
    province: 'Sofala',
    district: 'Beira',
    locationDetails: 'Entorno do Rio Maria, Bairro Munhava-Matope',
    coordinates: { lat: -19.8211, lng: 34.8562 },
    reportedBy: 'Elias Mufunde',
    isAnonymous: false,
    timestamp: '2026-09-21 09:30',
    status: 'Em Intervenção',
    description: 'Abate massivo de mangleiros para produção de lenha e carvão vegetal com desestabilização da barreira de maré.',
    imageUrl: '/assets/img/eco/mangais.jpg',
    validationScore: 96,
    assignedTeam: 'Brigada Florestal SDAE Beira',
    actionSummary: 'Notificação emitida, apreensão de fornos clandestinos e plantio de 400 propágulos.'
  },
  {
    id: 'occ-002',
    protocol: 'ECO-2026-MZ-002',
    title: 'Foco de Queimada Descontrolada no Corredor de Marrupa',
    category: 'Queimadas Descontroladas',
    severity: 'Alto',
    province: 'Niassa',
    district: 'Marrupa',
    locationDetails: 'Ao longo da EN14, proximidade do Parque Nacional do Niassa',
    coordinates: { lat: -13.1842, lng: 37.5211 },
    reportedBy: 'Comunidade Nativa',
    isAnonymous: true,
    timestamp: '2026-09-20 14:15',
    status: 'Validado',
    description: 'Fogo descontrolado para abertura de machambas ameaçando a reserva florestal comunitária e fauna silvestre.',
    imageUrl: '/assets/img/eco/queimadas.jpg',
    validationScore: 89,
    assignedTeam: 'Guarda Florestal ANAC Niassa'
  },
  {
    id: 'occ-003',
    protocol: 'ECO-2026-MZ-003',
    title: 'Descarga de Efluentes no Rio Infulene',
    category: 'Poluição Hídrica',
    severity: 'Crítico',
    province: 'Maputo Província',
    district: 'Matola',
    locationDetails: 'Vale do Infulene, próximo à ponte da Av. 24 de Julho',
    coordinates: { lat: -25.9315, lng: 32.5312 },
    reportedBy: 'Joel Ali Viano',
    isAnonymous: false,
    timestamp: '2026-09-19 11:20',
    status: 'Em Intervenção',
    description: 'Água com forte odor químico e coloração cinzenta escura contaminando machambas hortícolas irrigadas no vale.',
    imageUrl: '/assets/img/eco/poluicao_rios.jpg',
    validationScore: 94,
    assignedTeam: 'AQUA - Agência Nacional de Qualidade Ambiental'
  },
  {
    id: 'occ-004',
    protocol: 'ECO-2026-MZ-004',
    title: 'Ravina de Erosão Ameaçando Habitações em Maxixe',
    category: 'Erosão Costeira/Pluvial',
    severity: 'Alto',
    province: 'Inhambane',
    district: 'Maxixe',
    locationDetails: 'Bairro Agostinho Neto, encosta da Baía de Inhambane',
    coordinates: { lat: -23.8589, lng: 35.3481 },
    reportedBy: 'Comité de Gestão de Riscos',
    isAnonymous: false,
    timestamp: '2026-09-18 16:45',
    status: 'Validado',
    description: 'Desmoronamento acelerado de solo arenoso após as últimas chuvas com risco iminente de colapso de 14 casas.',
    imageUrl: '/assets/img/eco/erosao.jpg',
    validationScore: 91,
    assignedTeam: 'Conselho Municipal da Cidade de Maxixe'
  },
  {
    id: 'occ-005',
    protocol: 'ECO-2026-MZ-005',
    title: 'Acumulação Crítica de Resíduos no Mercado de Hulene',
    category: 'Resíduos Sólidos Urbanos',
    severity: 'Médio',
    province: 'Maputo Cidade',
    district: 'Kamavota',
    locationDetails: 'Adjacente à circular de Maputo, Hulene B',
    coordinates: { lat: -25.9082, lng: 32.5891 },
    reportedBy: 'Roque Armando',
    isAnonymous: false,
    timestamp: '2026-09-17 08:10',
    status: 'Resolvido',
    description: 'Lixeira a céu aberto obstruindo via secundária de drenagem pluvial.',
    imageUrl: '/assets/img/eco/residuos.jpg',
    validationScore: 88,
    assignedTeam: 'Direcção Municipal de Salubridade',
    actionSummary: 'Recolha de 28 toneladas e colocação de contentores de 1100L com vigilância comunitária.'
  }
];

export const INITIAL_PROJECTS: EnvironmentalProject[] = [
  {
    id: 'proj-001',
    title: 'Restauração Ecológica dos Mangais da Costa da Beira',
    category: 'Destruição de Mangais',
    province: 'Sofala',
    district: 'Beira & Dondo',
    leadEntity: 'Associação Amigos do Mangal de Sofala & UEM',
    status: 'Em Execução',
    progress: 68,
    budgetTotalMZN: 4500000,
    budgetRaisedMZN: 3250000,
    startDate: '2025-10-01',
    targetDate: '2027-03-31',
    description: 'Plantio de 120.000 propágulos de Avicennia marina e Rhizophora mucronata para reconstrução da defesa costeira natural.',
    keyMetric: 'Hectares de mangal replantados',
    keyMetricAchieved: '82 ha / 120 ha',
    volunteerSpots: 250,
    volunteersEnrolled: 198
  },
  {
    id: 'proj-002',
    title: 'Brigadas Comunitárias de Prevenção de Queimadas no Niassa',
    category: 'Queimadas Descontroladas',
    province: 'Niassa',
    district: 'Lichinga, Marrupa & Mecula',
    leadEntity: 'Rede Ambiental de Lichinga & ANAC',
    status: 'Em Execução',
    progress: 52,
    budgetTotalMZN: 2800000,
    budgetRaisedMZN: 2100000,
    startDate: '2026-01-15',
    targetDate: '2026-11-30',
    description: 'Criação de faixas corta-fogo em 450 km de florestas miombo e capacitação de 35 comités rurais em queima prescrita.',
    keyMetric: 'Quilómetros de corta-fogo protegidos',
    keyMetricAchieved: '240 km / 450 km',
    volunteerSpots: 180,
    volunteersEnrolled: 142
  },
  {
    id: 'proj-003',
    title: 'Bacia Viva: Recuperação e Monitorização do Rio Zambeze',
    category: 'Poluição Hídrica',
    province: 'Tete',
    district: 'Tete & Moatize',
    leadEntity: 'ARA-Zambeze & Instituto Superior Politécnico de Tete',
    status: 'Em Execução',
    progress: 41,
    budgetTotalMZN: 6200000,
    budgetRaisedMZN: 3800000,
    startDate: '2025-08-01',
    targetDate: '2027-12-31',
    description: 'Instalação de sensores de qualidade da água, filtros biológicos ribeirinhos e despoluição de tributários mineiros.',
    keyMetric: 'Pontos de água revitalizados',
    keyMetricAchieved: '16 / 35 estações',
    volunteerSpots: 120,
    volunteersEnrolled: 85
  },
  {
    id: 'proj-004',
    title: 'Economia Circular e Reciclagem Comunitária em Nampula',
    category: 'Resíduos Sólidos Urbanos',
    province: 'Nampula',
    district: 'Nampula & Nacala',
    leadEntity: 'Cooperativa Verde Nampula & UniLúrio',
    status: 'Planeado',
    progress: 18,
    budgetTotalMZN: 3100000,
    budgetRaisedMZN: 850000,
    startDate: '2026-04-01',
    targetDate: '2027-06-30',
    description: 'Ecopontos de triagem de plástico e vidro geridos por cooperativas de catadores locais com prensas solares.',
    keyMetric: 'Toneladas de plástico recolhidas por mês',
    keyMetricAchieved: '14 t / 80 t meta',
    volunteerSpots: 90,
    volunteersEnrolled: 34
  }
];

export const INITIAL_TASKS: FieldActionTask[] = [
  {
    id: 'tsk-001',
    projectId: 'proj-001',
    title: 'Monitorização da Sobrevivência de Propágulos na Ilha dos Amores',
    assignedTechnician: 'Dra. Amina Bacar (Técnica Sénior)',
    deadline: '2026-09-28',
    status: 'Em Andamento',
    province: 'Sofala',
    location: 'Estuário do Rio Púnguè, Beira',
    notes: 'Taxa de enraizamento estimada em 84% após 3 meses do plantio.'
  },
  {
    id: 'tsk-002',
    projectId: 'proj-002',
    title: 'Abertura de Faixa Corta-Fogo de 20 metros no Perímetro do Miombo',
    assignedTechnician: 'Eng. Mateus Tembe',
    deadline: '2026-10-05',
    status: 'Pendente',
    province: 'Niassa',
    location: 'Comunidade de Chimbunila',
    notes: 'Coordenação com o líder tradicional local e fornecimento de sachos e abafadores.'
  },
  {
    id: 'tsk-003',
    projectId: 'proj-003',
    title: 'Coleta de Amostras Físico-Químicas no Rio Revúboè',
    assignedTechnician: 'Téc. Fernando Chissano',
    deadline: '2026-09-25',
    status: 'Concluída',
    province: 'Tete',
    location: 'Confluência Revúboè-Zambeze',
    notes: 'Parâmetros de pH e condutividade registados no módulo ECO-DATA.'
  }
];

export const INITIAL_VOLUNTEER_JOBS: VolunteerOpportunity[] = [
  {
    id: 'vol-001',
    projectId: 'proj-001',
    title: 'Grande Jornada de Plantio de Mangais na Beira',
    location: 'Praia Nova e Estuário do Búzi, Sofala',
    province: 'Sofala',
    date: '2026-10-04 (Domingo, 07:30)',
    hoursCredit: 6,
    spotsTotal: 100,
    spotsTaken: 72,
    badgeName: 'Guardião dos Mangais',
    description: 'Participação cívica com distribuição de botas, luvas e lanche para plantio intensivo na maré baixa.',
    requirements: ['Idade mínima de 16 anos', 'Calçado adequado para lama', 'Espírito de equipa']
  },
  {
    id: 'vol-002',
    projectId: 'proj-004',
    title: 'Brigada de Limpeza e Triagem na Baía de Nacala',
    location: 'Praia de Fernão Veloso, Nacala-Porto',
    province: 'Nampula',
    date: '2026-10-10 (Sábado, 08:00)',
    hoursCredit: 5,
    spotsTotal: 50,
    spotsTaken: 29,
    badgeName: 'Oceano Sem Plástico',
    description: 'Campanha costeira com pesagem de detritos e encaminhamento direto para trituração e reciclagem.',
    requirements: ['Protetor solar e chapéu', 'Inscrição confirmada na plataforma']
  },
  {
    id: 'vol-003',
    projectId: 'proj-002',
    title: 'Vigilância Comunitária e Sensibilização em Lichinga',
    location: 'Arredores de Meponda, Lago Niassa',
    province: 'Niassa',
    date: '2026-10-18 (Sábado, 09:00)',
    hoursCredit: 4,
    spotsTotal: 30,
    spotsTaken: 18,
    badgeName: 'Eco-Defensor do Miombo',
    description: 'Distribuição de folhetos educativos em Ciyao e Português sobre risco de queimadas descontroladas.',
    requirements: ['Comunicação fluida', 'Conhecimento da área rural']
  }
];

export const INITIAL_VOLUNTEER_OPPS = INITIAL_VOLUNTEER_JOBS;

export const INITIAL_SEALS: GreenSealCert[] = [
  {
    id: 'cert-001',
    institutionName: 'Portos e Caminhos de Ferro de Moçambique (CFM Centro)',
    category: 'Empresa Privada',
    province: 'Sofala',
    score: 93,
    status: 'Certificado Ativo',
    sealLevel: 'Ouro',
    validUntil: '2027-08-31',
    achievements: [
      'Gestão 100% controlada de resíduos perigosos no Porto da Beira',
      'Plano de transição para iluminação LED solar nos cais',
      'Financiamento de 3 viveiros comunitários de mangal'
    ]
  },
  {
    id: 'cert-002',
    institutionName: 'Universidade Eduardo Mondlane - Faculdade de Ciências',
    category: 'Escola/Universidade',
    province: 'Maputo Cidade',
    score: 89,
    status: 'Certificado Ativo',
    sealLevel: 'Ouro',
    validUntil: '2027-04-15',
    achievements: [
      'Campus com triagem seletiva e compostagem orgânica',
      'Laboratório aberto de monitorização da qualidade ambiental',
      'Pesquisas publicadas com dados integrados na ECO-API'
    ]
  },
  {
    id: 'cert-003',
    institutionName: 'Cooperativa Agrícola de Horticultores de Chókwè',
    category: 'Comunidade Local',
    province: 'Gaza',
    score: 81,
    status: 'Certificado Ativo',
    sealLevel: 'Prata',
    validUntil: '2026-12-31',
    achievements: [
      'Uso eficiente de irrigação gota-a-gota',
      'Redução de 60% no uso de pesticidas sintéticos'
    ]
  }
];

export const INITIAL_ALERTS: EarlyAlert[] = [
  {
    id: 'alt-001',
    type: 'Ciclone Tropical',
    level: 'Crítico',
    affectedProvinces: ['Sofala', 'Zambézia', 'Inhambane'],
    issuedAt: '2026-09-22 06:00',
    headline: 'Depressão Tropical em Intensificação no Canal de Moçambique',
    recommendations: [
      'Fixação preventiva de telhados e estruturas precárias',
      'Evacuação imediata de povoações em leitos de cheia dos rios Púnguè e Búzi',
      'Interrupção imediata da faina marítima e navegação costeira',
      'Armazenamento de água potável, alimentos não perecíveis e lanternas'
    ],
    source: 'Instituto Nacional de Meteorologia (INAM) / INGD',
    active: true
  },
  {
    id: 'alt-002',
    type: 'Risco Crítico de Queimada',
    level: 'Alto',
    affectedProvinces: ['Niassa', 'Tete', 'Manica'],
    issuedAt: '2026-09-21 12:00',
    headline: 'Ventos Fortes e Baixa Humidade (<20%) Elevam Alerta de Fogo',
    recommendations: [
      'Proibição absoluta de queima de machambas nas próximas 72 horas',
      'Manutenção preventiva das faixas corta-fogo ao redor de aldeias',
      'Notificação imediata no ECO-CITIZEN ou às autoridades florestais ao primeiro foco'
    ],
    source: 'Centro Nacional de Alerta Precoce (MTA)',
    active: true
  }
];

export const INITIAL_MODULES: EducationalModule[] = [
  {
    id: 'edu-001',
    title: 'Os Mangais de Moçambique: Muralha Natural e Berçário da Vida',
    topic: 'Florestas & Biodiversidade',
    readingTimeMin: 7,
    summary: 'Moçambique possui a terceira maior extensão de mangais de África. Descubra a sua relevância vital na proteção contra ciclones e na economia pesqueira.',
    keyLessons: [
      'As raízes aéreas amortecem até 66% da energia das ondas de tempestade.',
      'Mais de 70% das espécies de camarão e peixe comercial de Sofala e Zambézia dependem dos mangais para reprodução.',
      'Um hectare de mangal captura até 4 vezes mais carbono do que florestas tropicais terrestres.'
    ],
    quizQuestions: [
      {
        question: 'Qual é o principal papel dos mangais na proteção costeira de cidades como a Beira e Quelimane?',
        options: [
          'Apenas embelezar a costa',
          'Amortecer a energia das ondas e impedir a erosão marinha',
          'Aumentar o calor na praia',
          'Não têm função protetora'
        ],
        correctIndex: 1,
        explanation: 'As raízes entrelaçadas do mangal dissipam a força mecânica das ondas de maré e fixam os sedimentos de solo arenoso.'
      },
      {
        question: 'Em termos de carbono azul, qual é a capacidade de absorção dos mangais?',
        options: [
          'Capturam até 4 vezes mais carbono que florestas terrestres comuns',
          'Não absorvem carbono',
          'Capturam menos que capim seco',
          'Apenas armazenam oxigénio'
        ],
        correctIndex: 0,
        explanation: 'Os mangais armazenam carbono tanto na sua biomassa vegetal quanto nos sedimentos anaeróbios profundos por séculos.'
      }
    ]
  },
  {
    id: 'edu-002',
    title: 'Gestão Sustentável da Água e as Bacias Hidrográficas Nacionais',
    topic: 'Água & Bacias Hidrográficas',
    readingTimeMin: 6,
    summary: 'Dos rios internacionais que desaguam em Moçambique às bacias do Limpopo e Zambeze: como proteger o recurso mais precioso.',
    keyLessons: [
      'Mais de 50% da água doce de Moçambique provém de países a montante (Zimbabwe, Zâmbia, África do Sul).',
      'A preservação das matas ciliares nas margens é essencial para evitar o assoreamento dos rios.',
      'A Lei n.º 16/91 (Lei de Águas) consagra o princípio de que a água é património público do Estado.'
    ],
    quizQuestions: [
      {
        question: 'O que acontece aos rios quando a vegetação das margens (matas ciliares) é removida?',
        options: [
          'A água fica mais cristalina',
          'Ocorre assoreamento rápido, turvação e perda de caudal nos períodos secos',
          'O rio alarga sem consequências',
          'Não há impacto significativo'
        ],
        correctIndex: 1,
        explanation: 'As raízes das matas ciliares filtram sedimentos e poluentes. Sem elas, a terra desliza para o leito do rio causando assoreamento.'
      }
    ]
  }
];

export const INITIAL_EDU_MODULES = INITIAL_MODULES;

// ==========================================
// MÓDULO DE SIMULAÇÃO CLIMÁTICA DE MOÇAMBIQUE
// ==========================================
export const CLIMATE_SCENARIOS: ClimateScenarioConfig[] = [
  {
    id: 'scen-sea-05',
    category: 'sea_level_rise',
    title: 'Elevação do Nível do Mar: +0.5 Metros',
    subtitle: 'Projeção Intermediária (Horizonte 2035-2040) com intrusão salina em deltas',
    levelLabel: '+0.5 m',
    parameterValue: 0.5,
    parameterUnit: 'metros',
    targetYear: 2040,
    severity: 'Médio',
    impactMetrics: {
      affectedPopulation: 340000,
      submergedOrDegradedAreaKm2: 1280,
      co2EquivalentImpactTonnes: 450000,
      economicRiskMZNMillions: 14200,
      criticalInfrastructuresAtRisk: 42
    },
    keyZones: [
      {
        name: 'Baía da Beira e Estuário do Búzi',
        province: 'Sofala',
        district: 'Beira',
        lat: -19.8436,
        lng: 34.8389,
        radiusMeters: 18000,
        riskDescription: 'Inundação permanente de áreas baixas de Munhava, Praia Nova e orla do Chiveve durante preia-mar.',
        criticalInfrastructure: 'Acessos ao Porto da Beira, estação de bombagem e drenagem urbana.'
      },
      {
        name: 'Delta do Zambeze e Quelimane',
        province: 'Zambézia',
        district: 'Quelimane',
        lat: -17.8786,
        lng: 36.8883,
        radiusMeters: 22000,
        riskDescription: 'Salinização dos canais de arrozais e recuo da linha de costa nos arrozais de Nicoadala e Chinde.',
        criticalInfrastructure: 'Campos agrícolas de arroz familiar e furos de captação de água doce.'
      },
      {
        name: 'Baía de Maputo & Costa do Sol',
        province: 'Maputo Cidade',
        district: 'KaMavota',
        lat: -25.9200,
        lng: 32.6100,
        radiusMeters: 14000,
        riskDescription: 'Avanço do mar sobre o paredão da Marginal, mangal de KaTembe e foz do Rio Matola.',
        criticalInfrastructure: 'Avenida Marginal, áreas residenciais de Triunfo e acessos à ponte Maputo-Katembe.'
      },
      {
        name: 'Baía de Inhambane & Barra',
        province: 'Inhambane',
        district: 'Inhambane',
        lat: -23.8650,
        lng: 35.3833,
        radiusMeters: 15000,
        riskDescription: 'Erosão severa das dunas de proteção e inundação da estrada costeira Maxixe-Inhambane.',
        criticalInfrastructure: 'Molhes de acostagem de barcos de travessia e infraestruturas turísticas.'
      }
    ],
    mitigationMeasures: [
      'Restauração de 65 km de cinturão protetor de mangais nas baías da Beira e Quelimane',
      'Elevação e reforço de diques e comportas anti-salinização no Baixo Limpopo e Zambeze',
      'Deslocalização planeada de habitações precárias em zonas estuarinas com cotas inferiores a 1.5m'
    ]
  },
  {
    id: 'scen-sea-15',
    category: 'sea_level_rise',
    title: 'Elevação do Nível do Mar: +1.5 Metros (Crítico)',
    subtitle: 'Cenário Extremo de Degelo Global e Tempestades Marítimas Recorrentes (Horizonte 2050-2100)',
    levelLabel: '+1.5 m',
    parameterValue: 1.5,
    parameterUnit: 'metros',
    targetYear: 2050,
    severity: 'Crítico',
    impactMetrics: {
      affectedPopulation: 980000,
      submergedOrDegradedAreaKm2: 3950,
      co2EquivalentImpactTonnes: 1850000,
      economicRiskMZNMillions: 48900,
      criticalInfrastructuresAtRisk: 128
    },
    keyZones: [
      {
        name: 'Grande Beira e Planície do Púnguè',
        province: 'Sofala',
        district: 'Beira',
        lat: -19.8200,
        lng: 34.8000,
        radiusMeters: 32000,
        riskDescription: 'Submersão contínua de mais de 40% do tecido urbano consolidado da Beira e isolamento do corredor rodoviário EN6.',
        criticalInfrastructure: 'Aeroporto Internacional da Beira, porto comercial e armazéns de combustíveis.'
      },
      {
        name: 'Ilha de Moçambique & Baía de Mossuril',
        province: 'Nampula',
        district: 'Ilha de Moçambique',
        lat: -15.0342,
        lng: 40.7303,
        radiusMeters: 16000,
        riskDescription: 'Ameaça direta ao Património Mundial da UNESCO com colapso das muralhas da Fortaleza de São Sebastião.',
        criticalInfrastructure: 'Ponte de acesso à Ilha de Moçambique e património edificado histórico.'
      },
      {
        name: 'Arquipélago das Quirimbas & Pemba',
        province: 'Cabo Delgado',
        district: 'Pemba',
        lat: -12.9732,
        lng: 40.5178,
        radiusMeters: 20000,
        riskDescription: 'Inundação do porto natural de Pemba e desaparecimento de ilhotas baixas com perdas de recifes de coral.',
        criticalInfrastructure: 'Instalações portuárias de apoio logístico e vilas piscatórias costeiras.'
      },
      {
        name: 'Delta do Zambeze - Chinde e Luabo',
        province: 'Zambézia',
        district: 'Chinde',
        lat: -18.5700,
        lng: 36.4600,
        radiusMeters: 38000,
        riskDescription: 'Invasão oceânica de mais de 35 km para o interior do rio, transformando bacias de água doce em estuários hipersalinos.',
        criticalInfrastructure: 'Totalidade das captações de água e produção agrícola de cana e cereais.'
      }
    ],
    mitigationMeasures: [
      'Construção de mega-barreiras oceânicas combinadas com quebra-mares ecológicos',
      'Plano nacional de relocalização de mais de 200.000 famílias para platôs interiores',
      'Conversão obrigatória de aquíferos costeiros em sistemas de osmose inversa solar descentralizada'
    ]
  },
  {
    id: 'scen-def-bau',
    category: 'deforestation_rate',
    title: 'Taxa de Desmatamento Acelerada (Tendencial / +3.5% ao ano)',
    subtitle: 'Sem novas medidas punitivas de corte ilegal de Miombo e avanço desenfreado da queima de carvão',
    levelLabel: '+3.5%/ano',
    parameterValue: 3.5,
    parameterUnit: '%/ano',
    targetYear: 2030,
    severity: 'Alto',
    impactMetrics: {
      affectedPopulation: 650000,
      submergedOrDegradedAreaKm2: 24000,
      co2EquivalentImpactTonnes: 12400000,
      economicRiskMZNMillions: 22800,
      criticalInfrastructuresAtRisk: 34
    },
    keyZones: [
      {
        name: 'Corredor Florestal do Miombo Central',
        province: 'Zambézia',
        district: 'Mocuba',
        lat: -16.8372,
        lng: 36.9856,
        radiusMeters: 45000,
        riskDescription: 'Perda de 60.000 hectares anuais de floresta nativa de Umbila e Chanfuta por exploração florestal insustentável.',
        criticalInfrastructure: 'Bacias de drenagem dos rios Licungo e Lugela com assoreamento e secagem estival.'
      },
      {
        name: 'Zona Tampão da Reserva Nacional do Niassa',
        province: 'Niassa',
        district: 'Mecula',
        lat: -12.1800,
        lng: 37.6200,
        radiusMeters: 55000,
        riskDescription: 'Fragmentação dos corredores biológicos de elefantes e perda da cobertura arbórea por garimpo e carvoaria.',
        criticalInfrastructure: 'Postos de fiscalização da ANAC e mananciais fluviais do Rio Rovuma.'
      },
      {
        name: 'Planalto de Manica & Zona de Bárue',
        province: 'Manica',
        district: 'Bárue',
        lat: -17.8333,
        lng: 33.1667,
        radiusMeters: 30000,
        riskDescription: 'Corte severo nas encostas com erosão descontrolada e assoreamento da bacia do Rio Púngoè.',
        criticalInfrastructure: 'Barragens de retenção agrícola e condutas de água potável de Chimoio.'
      },
      {
        name: 'Matas de Miombo em Montepuez',
        province: 'Cabo Delgado',
        district: 'Montepuez',
        lat: -13.1256,
        lng: 38.9997,
        radiusMeters: 35000,
        riskDescription: 'Corte clandestino para lenha industrial e queimadas itinerantes sem rotação de terra.',
        criticalInfrastructure: 'Fontes comunitárias de água florestal e machambas de mandioca.'
      }
    ],
    mitigationMeasures: [
      'Moratória imediata à exportação de toros de espécies preciosas não transformadas',
      'Implementação de patrulhas comunitárias georreferenciadas com alertas via satélite Sentinel/ECO-MZ',
      'Incentivo em massa ao biogás e fogões eco-eficientes nas periferias das capitais provinciais'
    ]
  },
  {
    id: 'scen-def-zero',
    category: 'deforestation_rate',
    title: 'Desmatamento Evitado & Reflorestamento Ativo (+18% de Ganho Verde)',
    subtitle: 'Meta Verde Moçambique 2030: Restauração comunitária massiva de 350.000 ha de Miombo e Mangais',
    levelLabel: '-85% corte',
    parameterValue: -85,
    parameterUnit: '% redução',
    targetYear: 2030,
    severity: 'Baixo',
    impactMetrics: {
      affectedPopulation: 1200000,
      submergedOrDegradedAreaKm2: 0,
      co2EquivalentImpactTonnes: -6800000,
      economicRiskMZNMillions: -18500, // Ganho económico positivo
      criticalInfrastructuresAtRisk: 0
    },
    keyZones: [
      {
        name: 'Cinturão de Reflorestamento Comunitário de Gilé',
        province: 'Zambézia',
        district: 'Gilé',
        lat: -16.4800,
        lng: 38.3800,
        radiusMeters: 40000,
        riskDescription: 'Regeneração natural assistida de 80.000 hectares com apicultura sustentável e crédito de carbono.',
        criticalInfrastructure: 'Viveiros florestais comunitários e cooperativas de mel de Miombo.'
      },
      {
        name: 'Muralha Verde de Mangais da Zambézia e Sofala',
        province: 'Sofala',
        district: 'Dondo',
        lat: -19.6094,
        lng: 34.7431,
        radiusMeters: 28000,
        riskDescription: 'Plantio de mais de 4 milhões de propágulos de Rhizophora mucronata com proteção costeira máxima.',
        criticalInfrastructure: 'Proteção efetiva dos 45 km da linha férrea e rodovia de ligação com o Zimbabwe.'
      },
      {
        name: 'Corredor Ecológico Gorongosa-Marromeu',
        province: 'Sofala',
        district: 'Gorongosa',
        lat: -18.7612,
        lng: 34.5034,
        radiusMeters: 50000,
        riskDescription: 'Recuperação integral das bacias nascentes da Serra da Gorongosa com reflorestamento agroflorestal de café de sombra.',
        criticalInfrastructure: 'Recursos hídricos perenes para mais de 100.000 famílias agricultoras.'
      }
    ],
    mitigationMeasures: [
      'Distribuição contínua de 500.000 Kits de Reflorestamento Comunitário ECO-MZ',
      'Pagamento por Serviços Ambientais (PSA) a líderes comunitários e comités locais de gestão de recursos',
      'Certificação internacional de créditos de carbono de alta integridade para benefício das aldeias'
    ]
  },
  {
    id: 'scen-cyc-cat4',
    category: 'cyclone_flooding',
    title: 'Ciclone Tropical Intenso Categoria 4 & Onda de Tempestade',
    subtitle: 'Ventos de 210 km/h, rajadas de 250 km/h e precipitação torrencial superior a 500 mm em 48h',
    levelLabel: 'Cat 4 (Idai-like)',
    parameterValue: 4,
    parameterUnit: 'Escala Saffir-Simpson',
    targetYear: 2030,
    severity: 'Crítico',
    impactMetrics: {
      affectedPopulation: 1450000,
      submergedOrDegradedAreaKm2: 8600,
      co2EquivalentImpactTonnes: 920000,
      economicRiskMZNMillions: 62000,
      criticalInfrastructuresAtRisk: 195
    },
    keyZones: [
      {
        name: 'Cone de Impacto Direto Búzi-Beira-Dondo',
        province: 'Sofala',
        district: 'Búzi',
        lat: -19.8833,
        lng: 34.6000,
        radiusMeters: 45000,
        riskDescription: 'Enchentes catastróficas com transbordo do Rio Búzi de até 8 metros acima da cota normal e corte de vias terrestres.',
        criticalInfrastructure: 'Ponte sobre o Rio Búzi, redes de distribuição elétrica e postos de saúde de Guara-Guara.'
      },
      {
        name: 'Bacia Inferior do Púnguè & Mafambisse',
        province: 'Sofala',
        district: 'Nhamatanda',
        lat: -19.2667,
        lng: 34.2167,
        radiusMeters: 35000,
        riskDescription: 'Inundação do corredor de transporte vital da EN6 com interrupção do tráfego internacional para países do hinterland.',
        criticalInfrastructure: 'Linha férrea de Machipanda, complexo agroindustrial de Mafambisse.'
      },
      {
        name: 'Faixa Costeira do Delta de Chinde & Marromeu',
        province: 'Zambézia',
        district: 'Chinde',
        lat: -18.3000,
        lng: 35.9500,
        radiusMeters: 40000,
        riskDescription: 'Sobreelevação marinha de 4.5 metros varrendo bancos de areia e destruindo palhotas tradicionais costeiras.',
        criticalInfrastructure: 'Atracadouros de socorro fluvial e furos de água potável costeira.'
      }
    ],
    mitigationMeasures: [
      'Alerta precoce de evacuação em massa via SMS comunitário e rádio local no idioma Sena e Ndau',
      'Ativação imediata de 14 abrigos elevados de resiliência com captação de água e painéis solares',
      'Desobstrução prévia dos diques de drenagem de águas pluviais da bacia da Beira'
    ]
  },
  {
    id: 'scen-drought-south',
    category: 'drought_water_stress',
    title: 'Seca Severa Prolongada & Stress Hídrico no Sul e Centro',
    subtitle: 'Ciclo El Niño com défice pluviométrico de 65%, secagem de poços e quebra total da safra de sequeiro',
    levelLabel: 'Défice 65%',
    parameterValue: 65,
    parameterUnit: '% défice chuva',
    targetYear: 2030,
    severity: 'Alto',
    impactMetrics: {
      affectedPopulation: 820000,
      submergedOrDegradedAreaKm2: 31000,
      co2EquivalentImpactTonnes: 1100000,
      economicRiskMZNMillions: 19800,
      criticalInfrastructuresAtRisk: 68
    },
    keyZones: [
      {
        name: 'Semiárido de Gaza (Chicualacuala, Chigubo, Mabalane)',
        province: 'Gaza',
        district: 'Chigubo',
        lat: -22.8333,
        lng: 33.5000,
        radiusMeters: 55000,
        riskDescription: 'Rebaixamento drástico do lençol freático, mortalidade de gado bovino e marcha de 15 km para obter água potável.',
        criticalInfrastructure: 'Represas de retenção de terra rompidas ou secas, furos artesianos comunitários manuais avariados.'
      },
      {
        name: 'Interior Seco de Inhambane (Funhalouro & Mabote)',
        province: 'Inhambane',
        district: 'Funhalouro',
        lat: -23.1000,
        lng: 34.4000,
        radiusMeters: 42000,
        riskDescription: 'Insegurança alimentar aguda de fase 3/4 e desertificação do estrato herbáceo com perda de sementes nativas.',
        criticalInfrastructure: 'Escolas rurais sem ponto de água funcional e centros de nutrição comunitária.'
      },
      {
        name: 'Bacia Sul de Tete (Changara e Cahora-Bassa Sul)',
        province: 'Tete',
        district: 'Changara',
        lat: -16.7000,
        lng: 33.1500,
        radiusMeters: 38000,
        riskDescription: 'Stress térmico extremo com temperaturas superiores a 44°C e salinização acentuada de poços rasos.',
        criticalInfrastructure: 'Canais de rega do Rio Luenha e pontos de distribuição de ração e forragem animal.'
      }
    ],
    mitigationMeasures: [
      'Instalação de furos profundos alimentados a energia solar com dessalinizadores por membrana',
      'Distribuição emergencial de sementes crioulas de mapira, mexoeira e mandioca resistente à seca',
      'Criação de reservas estratégicas comunitárias de água através de cisternas de ferrocimento'
    ]
  }
];

// ==========================================
// PAINEL DE RECURSOS COMUNITÁRIOS (KITS & ÁGUA)
// ==========================================

export const INITIAL_REFORESTATION_KITS: ReforestationKitItem[] = [
  {
    id: 'kit-01',
    province: 'Sofala',
    district: 'Beira',
    communityCenter: 'Centro Comunitário Praia Nova & Chiveve',
    availableStock: 480,
    allocatedDistributed: 1520,
    targetSeasonalStock: 2500,
    speciesDistribution: [
      { speciesName: 'Mangal Vermelho (Rhizophora)', quantity: 280, type: 'Mangal Costeiro' },
      { speciesName: 'Mangal Branco (Avicennia marina)', quantity: 120, type: 'Mangal Costeiro' },
      { speciesName: 'Casuarina Costeira Fixadora', quantity: 80, type: 'Resiliente Seca' }
    ],
    toolsPack: ['Enxadas Forjadas (4x)', 'Regadores de Baixa Perda 10L (6x)', 'Tubo de Proteção de Propágulo (100x)', 'Manual Cívico de Plantio'],
    survivalRatePct: 84,
    nurseryPartner: 'Viveiro Municipal da Beira & Associação Amigos do Mar',
    lastRestockedDate: '2026-09-18',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-02',
    province: 'Sofala',
    district: 'Búzi',
    communityCenter: 'Núcleo de Resiliência Agrária de Guara-Guara',
    availableStock: 95,
    allocatedDistributed: 1105,
    targetSeasonalStock: 1800,
    speciesDistribution: [
      { speciesName: 'Chanfuta Nativa (Afzelia quanzensis)', quantity: 45, type: 'Nativa Miombo' },
      { speciesName: 'Moringa Oleifera Nutritiva', quantity: 30, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Acácia de Sombra Rápida', quantity: 20, type: 'Resiliente Seca' }
    ],
    toolsPack: ['Enxadas de Cabo Curto (3x)', 'Baldes Plásticos Graduados (5x)', 'Composto Orgânico de Bagaço de Cana (50 kg)'],
    survivalRatePct: 76,
    nurseryPartner: 'Comité de Gestão Comunitária do Búzi',
    lastRestockedDate: '2026-09-10',
    status: 'Estoque Crítico'
  },
  {
    id: 'kit-03',
    province: 'Zambézia',
    district: 'Quelimane',
    communityCenter: 'Brigada Verde Estuário dos Bons Sinais',
    availableStock: 620,
    allocatedDistributed: 2100,
    targetSeasonalStock: 3000,
    speciesDistribution: [
      { speciesName: 'Mangal Negro (Bruguiera gymnorrhiza)', quantity: 350, type: 'Mangal Costeiro' },
      { speciesName: 'Umbila de Rápido Crescimento', quantity: 170, type: 'Nativa Miombo' },
      { speciesName: 'Cajueiro Enxertado Resistente', quantity: 100, type: 'Frutífera / Agroflorestal' }
    ],
    toolsPack: ['Pás Articuladas (4x)', 'Fitas de Medição Biométrica', 'Redes de Proteção contra Caranguejos (80x)'],
    survivalRatePct: 89,
    nurseryPartner: 'Instituto Oceanográfico de Quelimane & ORAM',
    lastRestockedDate: '2026-09-22',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-04',
    province: 'Zambézia',
    district: 'Mocuba',
    communityCenter: 'Cooperativa Agrícola Vale do Licungo',
    availableStock: 140,
    allocatedDistributed: 860,
    targetSeasonalStock: 1500,
    speciesDistribution: [
      { speciesName: 'Pau-Ferro (Swartzia madagascariensis)', quantity: 60, type: 'Nativa Miombo' },
      { speciesName: 'Chanfuta', quantity: 50, type: 'Nativa Miombo' },
      { speciesName: 'Muda de Abacateiro Local', quantity: 30, type: 'Frutífera / Agroflorestal' }
    ],
    toolsPack: ['Enxadas (5x)', 'Regadores Metálicos Galvanizados (4x)', 'Manual de Agroecologia'],
    survivalRatePct: 79,
    nurseryPartner: 'Viveiro Comunitário de Mocuba Central',
    lastRestockedDate: '2026-09-12',
    status: 'Nível Alerta'
  },
  {
    id: 'kit-05',
    province: 'Niassa',
    district: 'Lichinga',
    communityCenter: 'Plataforma dos Guardiões do Miombo de Lichinga',
    availableStock: 750,
    allocatedDistributed: 1850,
    targetSeasonalStock: 3200,
    speciesDistribution: [
      { speciesName: 'Pau-Preto (Dalbergia melanoxylon)', quantity: 350, type: 'Nativa Miombo' },
      { speciesName: 'Umbila (Pterocarpus angolensis)', quantity: 250, type: 'Nativa Miombo' },
      { speciesName: 'Pinheiro Nativo e Cedro', quantity: 150, type: 'Nativa Miombo' }
    ],
    toolsPack: ['Machados para Limpeza de Aceiros (2x)', 'Enxadas Largas (6x)', 'Termómetros de Substrato', 'Adubo de Vermicompostagem (100 kg)'],
    survivalRatePct: 91,
    nurseryPartner: 'Faculdade de Engenharia Florestal de Lichinga',
    lastRestockedDate: '2026-09-24',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-06',
    province: 'Cabo Delgado',
    district: 'Pemba',
    communityCenter: 'Centro Social de Reassentamento e Restauração',
    availableStock: 210,
    allocatedDistributed: 1420,
    targetSeasonalStock: 2200,
    speciesDistribution: [
      { speciesName: 'Mangal Vermelho', quantity: 120, type: 'Mangal Costeiro' },
      { speciesName: 'Baobá / Embondeiro Jovem', quantity: 50, type: 'Resiliente Seca' },
      { speciesName: 'Moringa Oleifera', quantity: 40, type: 'Frutífera / Agroflorestal' }
    ],
    toolsPack: ['Enxadas (4x)', 'Luvas Reforçadas de Proteção (10 pares)', 'Baldes de Transporte (8x)'],
    survivalRatePct: 82,
    nurseryPartner: 'Cruz Vermelha de Moçambique & SDAE Pemba',
    lastRestockedDate: '2026-09-14',
    status: 'Nível Alerta'
  },
  {
    id: 'kit-07',
    province: 'Gaza',
    district: 'Chókwè',
    communityCenter: 'Associação dos Agricultores do Regadio do Limpopo',
    availableStock: 520,
    allocatedDistributed: 1980,
    targetSeasonalStock: 2800,
    speciesDistribution: [
      { speciesName: 'Acácia Tortilis Fixadora de Dunas', quantity: 250, type: 'Resiliente Seca' },
      { speciesName: 'Cajueiro Silvestre de Gaza', quantity: 150, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Moringa', quantity: 120, type: 'Frutífera / Agroflorestal' }
    ],
    toolsPack: ['Enxadas com Cabo Reforçado (6x)', 'Mangueiras Micro-perfuradas de Gota-a-Gota (150m)', 'Sacos Plásticos Biodegradáveis de Viveiro (500x)'],
    survivalRatePct: 87,
    nurseryPartner: 'HICEP - Regadio do Limpopo & Direcção Distrital de Agricultura',
    lastRestockedDate: '2026-09-20',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-08',
    province: 'Gaza',
    district: 'Chigubo',
    communityCenter: 'Comité de Resiliência à Seca de Dindiza',
    availableStock: 45,
    allocatedDistributed: 680,
    targetSeasonalStock: 1200,
    speciesDistribution: [
      { speciesName: 'Acácia Karroo Resistente', quantity: 25, type: 'Resiliente Seca' },
      { speciesName: 'Palmeira Lala Tradicional', quantity: 20, type: 'Resiliente Seca' }
    ],
    toolsPack: ['Pás Quadradas de Aterro (2x)', 'Regadores de Tubo Longo (3x)', 'Substrato Retentor de Humidade Hydrogel (20 kg)'],
    survivalRatePct: 68,
    nurseryPartner: 'Serviço Distrital de Atividades Económicas de Chigubo',
    lastRestockedDate: '2026-09-05',
    status: 'Estoque Crítico'
  },
  {
    id: 'kit-09',
    province: 'Inhambane',
    district: 'Vilankulo',
    communityCenter: 'Clube Ambiental Mar e Dunas de Vilankulo',
    availableStock: 390,
    allocatedDistributed: 1350,
    targetSeasonalStock: 2000,
    speciesDistribution: [
      { speciesName: 'Mangal de Baía Rasa', quantity: 200, type: 'Mangal Costeiro' },
      { speciesName: 'Coqueiro Nativo Costeiro', quantity: 110, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Moringa', quantity: 80, type: 'Frutífera / Agroflorestal' }
    ],
    toolsPack: ['Estacas de Bambu Local (100x)', 'Fitas de Amarra Algodão', 'Enxadas Leves (5x)'],
    survivalRatePct: 88,
    nurseryPartner: 'Santuário Bravio de Vilankulo & Bazaruto Hope',
    lastRestockedDate: '2026-09-21',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-10',
    province: 'Manica',
    district: 'Sussundenga',
    communityCenter: 'Sede Comunitária do Parque de Chimanimani',
    availableStock: 310,
    allocatedDistributed: 990,
    targetSeasonalStock: 1600,
    speciesDistribution: [
      { speciesName: 'Muda de Café Agroflorestal de Altitude', quantity: 150, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Chanfuta de Montanha', quantity: 100, type: 'Nativa Miombo' },
      { speciesName: 'Pau-Ferro', quantity: 60, type: 'Nativa Miombo' }
    ],
    toolsPack: ['Enxadas (4x)', 'Tesouras de Poda Ergonómicas (4x)', 'Sementes Certificadas de Adubação Verde'],
    survivalRatePct: 92,
    nurseryPartner: 'Administração do Parque Nacional de Chimanimani',
    lastRestockedDate: '2026-09-17',
    status: 'Estoque Saudável'
  },
  {
    id: 'kit-11',
    province: 'Tete',
    district: 'Moatize',
    communityCenter: 'Brigada Verde Anti-Poluição de Nhantethe',
    availableStock: 180,
    allocatedDistributed: 820,
    targetSeasonalStock: 1400,
    speciesDistribution: [
      { speciesName: 'Neem Indiano de Barreira de Poeira', quantity: 90, type: 'Resiliente Seca' },
      { speciesName: 'Moringa', quantity: 50, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Acácia Africana', quantity: 40, type: 'Resiliente Seca' }
    ],
    toolsPack: ['Enxadas (4x)', 'Mascara de Filtro para Aplicação (8x)', 'Regadores de Plástico Reciclado (6x)'],
    survivalRatePct: 74,
    nurseryPartner: 'Associação dos Residentes Afetados pela Mineração (Tete)',
    lastRestockedDate: '2026-09-11',
    status: 'Nível Alerta'
  },
  {
    id: 'kit-12',
    province: 'Maputo Província',
    district: 'Marracuene',
    communityCenter: 'Parque Ecológico do Rio Incomáti',
    availableStock: 440,
    allocatedDistributed: 1780,
    targetSeasonalStock: 2500,
    speciesDistribution: [
      { speciesName: 'Mangal da Foz do Incomáti', quantity: 240, type: 'Mangal Costeiro' },
      { speciesName: 'Muda de Cajueiro Enxertado', quantity: 120, type: 'Frutífera / Agroflorestal' },
      { speciesName: 'Casuarina', quantity: 80, type: 'Resiliente Seca' }
    ],
    toolsPack: ['Enxadas (5x)', 'Regadores com Difusor Suave (6x)', 'Carrinho de Mão Metálico (1x)', 'Manual de Monitoria de Sobrevivência'],
    survivalRatePct: 86,
    nurseryPartner: 'Conselho Autárquico de Marracuene & UEM Biologia',
    lastRestockedDate: '2026-09-23',
    status: 'Estoque Saudável'
  }
];

export const INITIAL_WATER_POINTS: CommunityWaterPoint[] = [
  {
    id: 'wp-01',
    name: 'Furo Solar Comunitário de Guara-Guara',
    province: 'Sofala',
    district: 'Búzi',
    locality: 'Guara-Guara Vila',
    type: 'Furo Artesiano Solar',
    status: 'Operacional',
    dailyCapacityLiters: 18000,
    householdsServed: 650,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -19.9234, lng: 34.5821 },
    technicianContact: 'Delegação provincial de recursos hídricos',
    solarPowered: true,
    lastInspectionDate: '2026-09-20',
    nextScheduledAudit: '2026-10-20'
  },
  {
    id: 'wp-02',
    name: 'Estação de Dessalinização Solar de Nova Sofala',
    province: 'Sofala',
    district: 'Búzi',
    locality: 'Nova Sofala Litoral',
    type: 'Dessalinizador Costeiro',
    status: 'Operacional',
    dailyCapacityLiters: 9500,
    householdsServed: 320,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -20.1420, lng: 34.7210 },
    technicianContact: 'Delegação provincial do ambiente',
    solarPowered: true,
    lastInspectionDate: '2026-09-18',
    nextScheduledAudit: '2026-10-18'
  },
  {
    id: 'wp-03',
    name: 'Furo Artesiano Solar de Munhava Central',
    province: 'Sofala',
    district: 'Beira',
    locality: 'Munhava Matope',
    type: 'Furo Artesiano Solar',
    status: 'Manutenção Necessária',
    dailyCapacityLiters: 24000,
    householdsServed: 1200,
    waterQuality: 'Segura com Filtragem',
    coordinates: { lat: -19.8150, lng: 34.8620 },
    technicianContact: 'Equipa técnica provincial',
    solarPowered: true,
    lastInspectionDate: '2026-09-15',
    nextScheduledAudit: '2026-09-30'
  },
  {
    id: 'wp-04',
    name: 'Sistema Comunitário de Captação Pluvial de Dindiza',
    province: 'Gaza',
    district: 'Chigubo',
    locality: 'Dindiza Sede',
    type: 'Captação Pluvial Comunitária',
    status: 'Seca Sazonal',
    dailyCapacityLiters: 3500,
    householdsServed: 240,
    waterQuality: 'Segura com Filtragem',
    coordinates: { lat: -22.8450, lng: 33.5120 },
    technicianContact: 'Líder Comunitário Salomão Nhantumbo',
    solarPowered: false,
    lastInspectionDate: '2026-09-08',
    nextScheduledAudit: '2026-10-08'
  },
  {
    id: 'wp-05',
    name: 'Furo Profundo Solar de Chicualacuala Estação',
    province: 'Gaza',
    district: 'Chicualacuala',
    locality: 'Vila Eduardo Mondlane',
    type: 'Furo Artesiano Solar',
    status: 'Operacional',
    dailyCapacityLiters: 22000,
    householdsServed: 850,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -22.1833, lng: 31.8167 },
    technicianContact: 'Delegação provincial de recursos hídricos',
    solarPowered: true,
    lastInspectionDate: '2026-09-22',
    nextScheduledAudit: '2026-10-22'
  },
  {
    id: 'wp-06',
    name: 'Furo Solar do Regadio de Chókwè Bloco C',
    province: 'Gaza',
    district: 'Chókwè',
    locality: 'Lionde Regadio',
    type: 'Furo Artesiano Solar',
    status: 'Operacional',
    dailyCapacityLiters: 32000,
    householdsServed: 1400,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -24.5120, lng: 33.0210 },
    technicianContact: 'Brigada provincial de águas',
    solarPowered: true,
    lastInspectionDate: '2026-09-24',
    nextScheduledAudit: '2026-10-24'
  },
  {
    id: 'wp-07',
    name: 'Nascente Protegida do Monte Binga',
    province: 'Manica',
    district: 'Sussundenga',
    locality: 'Rotanda / Chimanimani',
    type: 'Nascente Protegida',
    status: 'Operacional',
    dailyCapacityLiters: 15000,
    householdsServed: 480,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -19.4320, lng: 33.2640 },
    technicianContact: 'Guarda Florestal Ernesto Simango',
    solarPowered: false,
    lastInspectionDate: '2026-09-19',
    nextScheduledAudit: '2026-10-19'
  },
  {
    id: 'wp-08',
    name: 'Dessalinizador Costeiro de Vilankulo Sul',
    province: 'Inhambane',
    district: 'Vilankulo',
    locality: 'Chibuene Pesca',
    type: 'Dessalinizador Costeiro',
    status: 'Operacional',
    dailyCapacityLiters: 11000,
    householdsServed: 410,
    waterQuality: 'Monitorização Salina',
    coordinates: { lat: -22.0450, lng: 35.3280 },
    technicianContact: 'Equipa técnica provincial',
    solarPowered: true,
    lastInspectionDate: '2026-09-23',
    nextScheduledAudit: '2026-10-23'
  },
  {
    id: 'wp-09',
    name: 'Furo Solar Comunitário de Funhalouro Sede',
    province: 'Inhambane',
    district: 'Funhalouro',
    locality: 'Bairro 25 de Junho',
    type: 'Furo Artesiano Solar',
    status: 'Manutenção Necessária',
    dailyCapacityLiters: 8000,
    householdsServed: 390,
    waterQuality: 'Segura com Filtragem',
    coordinates: { lat: -23.1120, lng: 34.3980 },
    technicianContact: 'Serviço Distrital de Actividades Económicas',
    solarPowered: true,
    lastInspectionDate: '2026-09-12',
    nextScheduledAudit: '2026-10-02'
  },
  {
    id: 'wp-10',
    name: 'Furo Solar do Centro de Reassentamento de Mecufi',
    province: 'Cabo Delgado',
    district: 'Pemba',
    locality: 'Mecufi Limite',
    type: 'Furo Artesiano Solar',
    status: 'Operacional',
    dailyCapacityLiters: 19500,
    householdsServed: 890,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -13.2500, lng: 40.5400 },
    technicianContact: 'Delegação provincial de recursos hídricos',
    solarPowered: true,
    lastInspectionDate: '2026-09-21',
    nextScheduledAudit: '2026-10-21'
  },
  {
    id: 'wp-11',
    name: 'Ponto de Captação e Filtragem Solar de Nicoadala',
    province: 'Zambézia',
    district: 'Quelimane',
    locality: 'Nicoadala Rio Licungo',
    type: 'Furo Artesiano Solar',
    status: 'Operacional',
    dailyCapacityLiters: 26000,
    householdsServed: 1100,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -17.6040, lng: 36.8120 },
    technicianContact: 'Direcção de Obras Públicas e Águas da Zambézia',
    solarPowered: true,
    lastInspectionDate: '2026-09-25',
    nextScheduledAudit: '2026-10-25'
  },
  {
    id: 'wp-12',
    name: 'Furo Solar Comunitário de Moatize Vila',
    province: 'Tete',
    district: 'Moatize',
    locality: 'Bairro Bagamoyo',
    type: 'Furo Artesiano Solar',
    status: 'Em Construção',
    dailyCapacityLiters: 16000,
    householdsServed: 700,
    waterQuality: 'Excelente / Potável',
    coordinates: { lat: -16.1280, lng: 33.7420 },
    technicianContact: 'Consórcio local de abastecimento de água',
    solarPowered: true,
    lastInspectionDate: '2026-09-17',
    nextScheduledAudit: '2026-10-10'
  }
];


export type CycleStage =
  | 'OBSERVAR'
  | 'LOCALIZAR'
  | 'DIAGNOSTICAR'
  | 'SIMULAR'
  | 'PLANEAR'
  | 'EXECUTAR'
  | 'MONITORIZAR'
  | 'AVALIAR'
  | 'INFORMAR';

// User roles in ECO-MZ 360:
// - cidadao (Citizen)
// - tecnico (Environmental Inspector / Fiscal de Terreno)
// - admin (Administrator)
// Additional legacy aliases supported: gestor, instituicao
export type UserRole = 'cidadao' | 'tecnico' | 'admin' | 'gestor' | 'instituicao';

export type StandardRole = 'Citizen' | 'Environmental Inspector' | 'Administrator';

export type EnvironmentalCategory =
  | 'Desmatamento'
  | 'Queimadas Descontroladas'
  | 'Poluição Hídrica'
  | 'Erosão Costeira/Pluvial'
  | 'Resíduos Sólidos Urbanos'
  | 'Destruição de Mangais'
  | 'Caça Furtiva & Biodiversidade'
  | 'Mineração Ilegal';

export type SeverityLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type OccurrenceStatus =
  | 'Recebido'
  | 'Em Validação'
  | 'Validado'
  | 'Em Intervenção'
  | 'Resolvido';

export type MozambiqueProvince =
  | 'Cabo Delgado'
  | 'Niassa'
  | 'Nampula'
  | 'Zambézia'
  | 'Tete'
  | 'Manica'
  | 'Sofala'
  | 'Inhambane'
  | 'Gaza'
  | 'Maputo Província'
  | 'Maputo Cidade';

export interface Occurrence {
  id: string;
  protocol: string;
  title: string;
  category: EnvironmentalCategory;
  severity: SeverityLevel;
  province: MozambiqueProvince;
  district: string;
  locationDetails: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reportedBy: string;
  isAnonymous: boolean;
  timestamp: string;
  status: OccurrenceStatus;
  description: string;
  imageUrl?: string;
  validationScore: number;
  assignedTeam?: string;
  actionSummary?: string;
}

export interface EnvironmentalProject {
  id: string;
  title: string;
  category: EnvironmentalCategory;
  province: MozambiqueProvince;
  district: string;
  leadEntity: string;
  status: 'Planeado' | 'Em Execução' | 'Concluído';
  progress: number;
  budgetTotalMZN: number;
  budgetRaisedMZN: number;
  startDate: string;
  targetDate: string;
  description: string;
  keyMetric: string;
  keyMetricAchieved: string;
  volunteerSpots: number;
  volunteersEnrolled: number;
}

export interface FieldActionTask {
  id: string;
  projectId: string;
  title: string;
  assignedTechnician: string;
  deadline: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  province: MozambiqueProvince;
  location: string;
  evidenceBefore?: string;
  evidenceAfter?: string;
  notes: string;
}

export interface VolunteerOpportunity {
  id: string;
  projectId: string;
  title: string;
  location: string;
  province: MozambiqueProvince;
  district?: string;
  date: string;
  hoursCredit: number;
  spotsTotal: number;
  spotsTaken: number;
  badgeName: string;
  description: string;
  requirements: string[];
  category?: string;
  spots?: number;
  enrolled?: number;
}

export interface GreenSealCert {
  id: string;
  institutionName: string;
  category: 'Empresa Privada' | 'ONG' | 'Comunidade Local' | 'Escola/Universidade';
  province: MozambiqueProvince;
  score: number;
  status: 'Certificado Ativo' | 'Em Auditoria' | 'Renovação Pendente';
  sealLevel: 'Ouro' | 'Prata' | 'Bronze';
  validUntil: string;
  achievements: string[];
}

export interface EarlyAlert {
  id: string;
  type: string;
  level: SeverityLevel | 'Vermelho' | 'Laranja' | 'Amarelo';
  affectedProvinces?: MozambiqueProvince[];
  affectedDistricts?: string[];
  issuedAt: string;
  expiresAt?: string;
  headline?: string;
  title?: string;
  threat?: string;
  instructions?: string;
  recommendations: string[];
  source: string;
  active: boolean;
}

export type EnvironmentalAlert = EarlyAlert;

export interface EducationalModule {
  id: string;
  title: string;
  topic?: 'Florestas & Biodiversidade' | 'Água & Bacias Hidrográficas' | 'Resíduos & Economia Circular' | 'Clima & Adaptação' | string;
  level?: string;
  duration?: string;
  readingTimeMin?: number;
  summary?: string;
  description?: string;
  lessonsCount?: number;
  keyLessons?: string[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
}

export interface SimulationParams {
  scenarioName: string;
  reforestationHectares: number;
  wasteRecyclingRate: number;
  mangroveRestorationKm: number;
  cleanEnergyBudgetMZN: number;
  targetYears: 1 | 5 | 10;
}

export type ClimateScenarioCategory =
  | 'sea_level_rise'
  | 'deforestation_rate'
  | 'cyclone_flooding'
  | 'drought_water_stress';

export interface ClimateScenarioConfig {
  id: string;
  category: ClimateScenarioCategory;
  title: string;
  subtitle: string;
  levelLabel: string;
  parameterValue: number;
  parameterUnit: string;
  targetYear: 2030 | 2040 | 2050 | 2100;
  severity: SeverityLevel;
  impactMetrics: {
    affectedPopulation: number;
    submergedOrDegradedAreaKm2: number;
    co2EquivalentImpactTonnes: number;
    economicRiskMZNMillions: number;
    criticalInfrastructuresAtRisk: number;
  };
  keyZones: {
    name: string;
    province: MozambiqueProvince;
    district: string;
    lat: number;
    lng: number;
    radiusMeters: number;
    riskDescription: string;
    criticalInfrastructure: string;
  }[];
  mitigationMeasures: string[];
}

export interface ReforestationKitItem {
  id: string;
  province: MozambiqueProvince;
  district: string;
  communityCenter: string;
  availableStock: number;
  allocatedDistributed: number;
  targetSeasonalStock: number;
  speciesDistribution: {
    speciesName: string;
    quantity: number;
    type: 'Nativa Miombo' | 'Mangal Costeiro' | 'Frutífera / Agroflorestal' | 'Resiliente Seca';
  }[];
  toolsPack: string[];
  survivalRatePct: number;
  nurseryPartner: string;
  lastRestockedDate: string;
  status: 'Estoque Saudável' | 'Nível Alerta' | 'Estoque Crítico' | 'Em Distribuição';
}

export interface CommunityWaterPoint {
  id: string;
  name: string;
  province: MozambiqueProvince;
  district: string;
  locality: string;
  type: 'Furo Artesiano Solar' | 'Captação Pluvial Comunitária' | 'Dessalinizador Costeiro' | 'Nascente Protegida';
  status: 'Operacional' | 'Manutenção Necessária' | 'Seca Sazonal' | 'Em Construção';
  dailyCapacityLiters: number;
  householdsServed: number;
  waterQuality: 'Excelente / Potável' | 'Segura com Filtragem' | 'Monitorização Salina';
  coordinates: {
    lat: number;
    lng: number;
  };
  technicianContact: string;
  solarPowered: boolean;
  lastInspectionDate: string;
  nextScheduledAudit: string;
}


import { UserRole } from '../types';

export interface UserRoleDefinition {
  id: UserRole;
  name: string; // Citizen, Environmental Inspector, Administrator
  labelPt: string;
  department: string;
  description: string;
  badgeColor: string;
  permissions: {
    canViewDashboard: boolean; // Citizen has citizen view, inspector has operational view, admin has full executive
    canViewReports: boolean; // restricted to Inspector & Administrator
    canGeneratePdfReports: boolean; // restricted to Inspector & Administrator
    canManageUsers: boolean; // restricted to Administrator
    canAuditData: boolean; // restricted to Inspector & Administrator
    canInspectOccurrences: boolean; // Inspector & Administrator
    canSubmitOccurrence: boolean; // All
    canViewSimulations: boolean; // Inspector & Administrator
  };
}

export const USER_ROLES_CATALOG: Record<'cidadao' | 'tecnico' | 'admin', UserRoleDefinition> = {
  cidadao: {
    id: 'cidadao',
    name: 'Citizen',
    labelPt: 'Cidadão Guardião Comunitário',
    department: 'Sociedade Civil & Cidadania Ambiental',
    description:
      'Acesso de participação cívica: submissão de denúncias e ocorrências ambientais georreferenciadas, voluntariado comunitário, educação ecológica e consultas públicas.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    permissions: {
      canViewDashboard: true, // Citizen-specific public dashboard
      canViewReports: false, // RESTRICTED: Reports reserved for Inspectors & Admins
      canGeneratePdfReports: false, // RESTRICTED
      canManageUsers: false,
      canAuditData: false,
      canInspectOccurrences: false, // Citizen reports, but doesn't change official validation status
      canSubmitOccurrence: true,
      canViewSimulations: false
    }
  },
  tecnico: {
    id: 'tecnico',
    name: 'Environmental Inspector',
    labelPt: 'Inspector Ambiental (Fiscal de Terreno)',
    department: 'AQUA - Agência Nacional de Controlo da Qualidade Ambiental',
    description:
      'Acesso operacional e fiscalizatório: validação técnica de ocorrências no terreno, emissão de autos de infração, inspeção territorial, acesso a relatórios e painéis operacionais.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    permissions: {
      canViewDashboard: true,
      canViewReports: true, // AUTHORIZED
      canGeneratePdfReports: true, // AUTHORIZED
      canManageUsers: false,
      canAuditData: true, // AUTHORIZED
      canInspectOccurrences: true, // AUTHORIZED
      canSubmitOccurrence: true,
      canViewSimulations: true
    }
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    labelPt: 'Administrador Central (MTA)',
    department: 'Ministério da Terra e Ambiente · Gabinete Central',
    description:
      'Acesso total e irrestrito: gestão de utilizadores e permissões, relatórios executivos em PDF com jsPDF, auditoria de dados, painéis analíticos e configuração de parâmetros nacionais.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    permissions: {
      canViewDashboard: true,
      canViewReports: true, // AUTHORIZED
      canGeneratePdfReports: true, // AUTHORIZED
      canManageUsers: true, // AUTHORIZED
      canAuditData: true, // AUTHORIZED
      canInspectOccurrences: true, // AUTHORIZED
      canSubmitOccurrence: true,
      canViewSimulations: true
    }
  }
};


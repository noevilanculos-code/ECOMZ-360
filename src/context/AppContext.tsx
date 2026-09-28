import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Occurrence,
  EnvironmentalProject,
  UserRole,
  CycleStage,
  MozambiqueProvince,
  OccurrenceStatus
} from '../types';
import {
  UserProfile,
  NoticeItem,
  NewsItem,
  SimulationScenario,
  ReportItem,
  INITIAL_USER_PROFILE,
  MASTER_OCCURRENCES,
  MASTER_PROJECTS,
  MASTER_NOTICES,
  MASTER_NEWS,
  MASTER_SIMULATIONS,
  MASTER_REPORTS
} from '../data/masterData';

import {
  auth,
  emailPasswordSignIn,
  emailPasswordSignUp,
  logout as firebaseLogout
} from '../lib/googleAuth';
import { changeOccurrenceStatus, createOccurrence, listOccurrences } from '../lib/occurrencesApi';
import { createProject, listProjects } from '../lib/projectsApi';

// Re-export interfaces and initial data so existing imports from this module continue to work
export type { UserProfile, NoticeItem, NewsItem, SimulationScenario, ReportItem };

export type ThemeMode = 'light' | 'dark' | 'system';
export type RoleApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface RegisteredUserRecord {
  profile: UserProfile;
  role: UserRole;
  approvalStatus: RoleApprovalStatus;
  requestedAt: string;
  reviewedAt?: string;
}

const DEMO_OCCURRENCES: Occurrence[] = import.meta.env.DEV
  ? MASTER_OCCURRENCES.map((occurrence) => ({
      ...occurrence,
      id: `demo-${occurrence.id}`,
      protocol: `DEMO-${occurrence.protocol}`,
      reportedBy: 'Conta fictícia de apresentação',
      description: `[DADO FICTÍCIO] ${occurrence.description}`,
      imageUrl: undefined,
      validationScore: 0,
      assignedTeam: undefined,
      actionSummary: undefined
    }))
  : [];

const DEMO_PROJECTS: EnvironmentalProject[] = import.meta.env.DEV
  ? MASTER_PROJECTS.map((project) => ({
      ...project,
      id: `demo-${project.id}`,
      title: `DEMO: ${project.title}`,
      leadEntity: 'Entidade fictícia de demonstração',
      description: `[DADO FICTÍCIO] ${project.description}`
    }))
  : [];

const readRegisteredUsers = (): RegisteredUserRecord[] => {
  try {
    const raw = localStorage.getItem('ecomz_registered_users');
    if (!raw) return [];
    const records = JSON.parse(raw) as Array<Partial<RegisteredUserRecord> & { profile: UserProfile; role: UserRole }>;
    return records.map((record) => ({
      ...record,
      approvalStatus: record.approvalStatus || (record.role === 'cidadao' ? 'approved' : 'pending'),
      requestedAt: record.requestedAt || new Date().toISOString()
    }));
  } catch {
    localStorage.removeItem('ecomz_registered_users');
    return [];
  }
};

export interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isLoggedIn: boolean;
  login: (email?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (email?: string, name?: string) => Promise<boolean>;
  registerUser: (userData: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    province?: string;
    organization?: string;
  }) => Promise<'active' | 'pending'>;
  registeredUsers: RegisteredUserRecord[];
  reviewRegisteredUser: (email: string, decision: 'approved' | 'rejected') => void;
  canManageUsers: boolean;
  logout: () => void;
  occurrences: Occurrence[];
  projects: EnvironmentalProject[];
  notices: NoticeItem[];
  news: NewsItem[];
  simulations: SimulationScenario[];
  reports: ReportItem[];
  addReport: (newReport: Omit<ReportItem, 'id' | 'downloadsCount'>) => ReportItem;
  addOccurrence: (newOcc: Occurrence) => Promise<Occurrence>;
  updateOccurrenceStatus: (id: string, status: OccurrenceStatus, note?: string) => Promise<void>;
  addProject: (newProj: EnvironmentalProject) => Promise<EnvironmentalProject>;
  updateProjectProgress: (id: string, progress: number) => void;
  selectedProvince: MozambiqueProvince | 'Todas';
  setSelectedProvince: (prov: MozambiqueProvince | 'Todas') => void;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  cycleThemeMode: () => void;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  markNoticeAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ecomz_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USER_PROFILE;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>(readRegisteredUsers);

  const [occurrences, setOccurrences] = useState<Occurrence[]>(DEMO_OCCURRENCES);
  const [projects, setProjects] = useState<EnvironmentalProject[]>(DEMO_PROJECTS);
  const [notices, setNotices] = useState<NoticeItem[]>(MASTER_NOTICES);
  const [news, setNews] = useState<NewsItem[]>(MASTER_NEWS);
  const [simulations, setSimulations] = useState<SimulationScenario[]>(MASTER_SIMULATIONS);
  const [reports, setReports] = useState<ReportItem[]>(MASTER_REPORTS);
  const [selectedProvince, setSelectedProvince] = useState<MozambiqueProvince | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ecomz_role') as UserRole;
      if (saved && (saved === 'cidadao' || saved === 'tecnico' || saved === 'admin' || saved === 'gestor' || saved === 'instituicao')) {
        return saved;
      }
    }
    return 'admin';
  });

  const currentUserRecord = registeredUsers.find(
    (record) => record.profile.email.toLowerCase() === user.email.toLowerCase()
  );
  const canManageUsers = currentUserRecord?.role === 'admin' && currentUserRecord.approvalStatus === 'approved';

  const setActiveRole = (role: UserRole) => {
    const assignedRole = currentUserRecord?.approvalStatus === 'approved'
      ? currentUserRecord.role
      : 'cidadao';
    if (!canManageUsers && role !== assignedRole) return;

    setActiveRoleState(role);
    localStorage.setItem('ecomz_role', role);

    // Synchronize user profile display with role while preserving user identity
    setUser((prev) => {
      // Detect Google-authenticated users — never overwrite their Google identity
      const isGoogleUser = prev.role?.includes('Google') ||
                           prev.functionTitle?.includes('Google Account') ||
                           prev.organization?.includes('Google Workspace');

      let roleTitle = prev.role;
      let functionTitle = prev.functionTitle;
      let organization = prev.organization;

      if (isGoogleUser) {
        // Google users keep their Google org — only update role context label
        if (role === 'cidadao') {
          roleTitle = 'Cidadão (Google)';
          functionTitle = 'Autenticado via Google Account • Cidadão';
        } else if (role === 'tecnico') {
          roleTitle = 'Inspector (Google)';
          functionTitle = 'Autenticado via Google Account • Inspector';
        } else if (role === 'gestor') {
          roleTitle = 'Gestor (Google)';
          functionTitle = 'Autenticado via Google Account • Gestor';
        } else if (role === 'instituicao') {
          roleTitle = 'Instituição (Google)';
          functionTitle = 'Autenticado via Google Account • Instituição';
        } else {
          roleTitle = 'Administrador (Google)';
          functionTitle = 'Autenticado via Google Account';
        }
        // organization stays as 'Google Workspace • Acesso Institucional'
      } else {
        if (role === 'cidadao') {
          roleTitle = 'Citizen (Cidadão)';
          functionTitle = 'Cidadão Guardião Comunitário';
          organization = prev.organization.includes('MTA') || prev.organization.includes('AQUA') ? 'Sociedade Civil Moçambicana' : prev.organization;
        } else if (role === 'tecnico') {
          roleTitle = 'Environmental Inspector';
          functionTitle = 'Inspector Ambiental de Terreno';
          organization = 'AQUA - Fiscalização Ambiental de Moçambique';
        } else if (role === 'gestor') {
          roleTitle = 'Gestor Ambiental';
          functionTitle = 'Coordenador de Projetos e Restauração';
          organization = 'Fundo Nacional de Desenvolvimento Sustentável (FNDS)';
        } else if (role === 'instituicao') {
          roleTitle = 'Instituição Parceira';
          functionTitle = 'Delegado Operacional de Gestão de Riscos';
          organization = 'Instituto Nacional de Gestão de Desastres (INGD)';
        } else if (role === 'admin') {
          roleTitle = 'Administrador Geral';
          functionTitle = 'Diretor de Sistemas de Informação Ambiental';
          organization = 'Ministério da Terra e Ambiente (MTA)';
        }
      }

      const updated: UserProfile = {
        ...prev,
        role: roleTitle,
        functionTitle,
        organization
      };
      localStorage.setItem('ecomz_user', JSON.stringify(updated));
      return updated;
    });
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => onAuthStateChanged(auth, (firebaseUser) => {
    setIsLoggedIn(Boolean(firebaseUser));
  }), []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    listOccurrences()
      .then(({ data }) => {
        if (!cancelled) setOccurrences(data.length ? data : DEMO_OCCURRENCES);
      })
      .catch((error) => {
        console.error('Não foi possível carregar ocorrências persistidas:', error);
        if (!cancelled && import.meta.env.DEV) setOccurrences(DEMO_OCCURRENCES);
      });
    listProjects()
      .then(({ data }) => {
        if (!cancelled) {
          const loadedProjects = data.length ? data : DEMO_PROJECTS;
          const loadedIds = new Set(loadedProjects.map((project) => project.id));
          setProjects((previous) => [
            ...loadedProjects,
            ...previous.filter((project) => !loadedIds.has(project.id))
          ]);
        }
      })
      .catch((error) => {
        console.error('Não foi possível carregar projetos persistidos:', error);
        if (!cancelled && import.meta.env.DEV) setProjects(DEMO_PROJECTS);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('ecomz_theme_mode') as ThemeMode;
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        return savedMode;
      }
      const savedOld = localStorage.getItem('ecomz_theme');
      if (savedOld === 'dark') return 'dark';
      if (savedOld === 'light') return 'light';
      return 'system';
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('ecomz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('ecomz_theme', 'light');
    }
    localStorage.setItem('ecomz_theme_mode', themeMode);
  }, [isDarkMode, themeMode]);

  const cycleThemeMode = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const toggleDarkMode = () => {
    cycleThemeMode();
  };

  const login = async (emailOrUsername?: string, password?: string): Promise<boolean> => {
    const identifier = (emailOrUsername || '').trim();
    if (!identifier || !password) return false;

    const credential = await emailPasswordSignIn(identifier.toLowerCase(), password);
    const authenticatedEmail = credential.user.email || identifier;
    const savedUser = readRegisteredUsers().find(
      (entry) => entry.profile.email.toLowerCase() === authenticatedEmail.toLowerCase()
    );
    if (savedUser && savedUser.role !== 'cidadao' && savedUser.approvalStatus !== 'approved') {
      await firebaseLogout();
      const error = new Error('O perfil ainda não foi aprovado.') as Error & { code: string };
      error.code = savedUser.approvalStatus === 'rejected' ? 'app/role-rejected' : 'app/role-pending';
      throw error;
    }

    const role: UserRole = savedUser?.role || 'cidadao';
    const profile: UserProfile = savedUser?.profile || {
      name: credential.user.displayName || authenticatedEmail.split('@')[0],
      role: 'Citizen (Cidadão)',
      email: authenticatedEmail,
      phone: '',
      location: 'Maputo, Moçambique',
      organization: 'Comunidade Guardiã',
      functionTitle: 'Cidadão Guardião',
      language: 'Português',
      avatarUrl: credential.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      memberSince: '2026',
      status: 'Online'
    };

    setUser(profile);
    setActiveRoleState(role);
    setIsLoggedIn(true);
    localStorage.setItem('ecomz_user', JSON.stringify(profile));
    localStorage.setItem('ecomz_role', role);
    localStorage.setItem('ecomz_auth', 'authenticated');
    return true;
  };

  const registerUser = async (userData: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    province?: string;
    organization?: string;
  }): Promise<'active' | 'pending'> => {
    const email = userData.email.trim().toLowerCase();
    if (!userData.name.trim() || !email.includes('@') || (userData.password || '').length < 6) return false;

    const role: UserRole = userData.role || 'cidadao';
    const credential = await emailPasswordSignUp(email, userData.password || '');
    const profile: UserProfile = {
      name: userData.name.trim() || 'Novo Utilizador',
      role: role === 'cidadao' ? 'Citizen (Cidadão)' : role === 'tecnico' ? 'Environmental Inspector' : role === 'gestor' ? 'Gestor Ambiental' : role === 'instituicao' ? 'Instituição Parceira' : 'Administrador',
      email,
      phone: '',
      location: userData.province ? `${userData.province}, Moçambique` : 'Moçambique',
      organization: userData.organization || (role === 'tecnico' ? 'AQUA Fiscalização' : role === 'cidadao' ? 'Comunidade Guardiã' : role === 'gestor' ? 'FNDS Moçambique' : 'Ministério da Terra e Ambiente'),
      functionTitle: role === 'tecnico' ? 'Inspector Ambiental' : role === 'cidadao' ? 'Cidadão Guardião' : role === 'gestor' ? 'Gestor de Projetos' : 'Membro Registado',
      language: 'Português',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      memberSince: 'Hoje',
      status: 'Online'
    };

    const approvalStatus: RoleApprovalStatus = role === 'cidadao' ? 'approved' : 'pending';
    const records = readRegisteredUsers().filter((record) => record.profile.email.toLowerCase() !== email);
    records.push({
      profile: { ...profile, name: credential.user.displayName || profile.name },
      role,
      approvalStatus,
      requestedAt: new Date().toISOString()
    });
    localStorage.setItem('ecomz_registered_users', JSON.stringify(records));
    setRegisteredUsers(records);

    if (approvalStatus === 'pending') {
      await firebaseLogout();
      return 'pending';
    }

    // Set as active session
    setUser(profile);
    localStorage.setItem('ecomz_user', JSON.stringify(profile));
    setActiveRoleState(role);
    localStorage.setItem('ecomz_role', role);
    setIsLoggedIn(true);
    localStorage.setItem('ecomz_auth', 'authenticated');

    return 'active';
  };

  const loginWithGoogle = async (email?: string, name?: string): Promise<boolean> => {
    const googleEmail = (email || localStorage.getItem('ecomz_google_email') || '').trim();
    const googleName = (name || localStorage.getItem('ecomz_google_name') || 'Utilizador').trim();
    const records = readRegisteredUsers();
    const registeredUser = records.find((record) => record.profile.email.toLowerCase() === googleEmail.toLowerCase());

    if (registeredUser && registeredUser.role !== 'cidadao' && registeredUser.approvalStatus !== 'approved') {
      await firebaseLogout();
      const error = new Error('O perfil ainda não foi aprovado.') as Error & { code: string };
      error.code = registeredUser.approvalStatus === 'rejected' ? 'app/role-rejected' : 'app/role-pending';
      throw error;
    }

    const googleProfile: UserProfile = registeredUser?.profile || {
      name: googleName,
      role: 'Citizen (Cidadão)',
      email: googleEmail,
      phone: '',
      location: 'Maputo, Moçambique',
      organization: 'Comunidade Guardiã',
      functionTitle: 'Cidadão Guardião • Autenticado via Google',
      language: 'Português',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      memberSince: 'Conta Google Ativa',
      status: 'Online'
    };

    if (!registeredUser) {
      records.push({
        profile: googleProfile,
        role: 'cidadao',
        approvalStatus: 'approved',
        requestedAt: new Date().toISOString()
      });
      localStorage.setItem('ecomz_registered_users', JSON.stringify(records));
      setRegisteredUsers(records);
    }

    setUser(googleProfile);
    localStorage.setItem('ecomz_user', JSON.stringify(googleProfile));
    localStorage.setItem('ecomz_google_email', googleEmail);
    localStorage.setItem('ecomz_google_name', googleName);
    setActiveRoleState(registeredUser?.role || 'cidadao');
    localStorage.setItem('ecomz_role', registeredUser?.role || 'cidadao');
    setIsLoggedIn(true);
    localStorage.setItem('ecomz_auth', 'authenticated');

    return true;
  };

  const reviewRegisteredUser = (email: string, decision: 'approved' | 'rejected') => {
    const records = readRegisteredUsers().map((record) =>
      record.profile.email.toLowerCase() === email.toLowerCase()
        ? { ...record, approvalStatus: decision, reviewedAt: new Date().toISOString() }
        : record
    );
    localStorage.setItem('ecomz_registered_users', JSON.stringify(records));
    setRegisteredUsers(records);
  };

  const logout = () => {
    void firebaseLogout().catch((error) => console.error('Falha ao terminar sessão Firebase:', error));
    setIsLoggedIn(false);
    setUser(INITIAL_USER_PROFILE);
    setActiveRoleState('admin');
    localStorage.setItem('ecomz_auth', 'logged_out');
    localStorage.removeItem('ecomz_user');
    localStorage.removeItem('ecomz_role');
    // Preserve Google credentials for convenience on re-login
  };

  const addOccurrence = async (newOcc: Occurrence): Promise<Occurrence> => {
    const savedOccurrence = await createOccurrence(newOcc);
    setOccurrences((prev) => [
      savedOccurrence,
      ...prev.filter((item) => !item.id.startsWith('demo-') && item.id !== savedOccurrence.id)
    ]);
    return savedOccurrence;
  };

  const updateOccurrenceStatus = async (id: string, status: OccurrenceStatus, note?: string) => {
    if (import.meta.env.DEV && id.startsWith('demo-')) {
      setOccurrences((prev) => prev.map((occurrence) => occurrence.id === id
        ? { ...occurrence, status, actionSummary: note || occurrence.actionSummary }
        : occurrence));
      return;
    }
    await changeOccurrenceStatus(id, status, note);
    setOccurrences((prev) =>
      prev.map((occ) => {
        if (occ.id === id) {
          return {
            ...occ,
            status,
            actionSummary: note || occ.actionSummary
          };
        }
        return occ;
      })
    );
  };

  const addProject = async (newProj: EnvironmentalProject) => {
    const savedProject = await createProject(newProj);
    setProjects((prev) => [
      savedProject,
      ...prev.filter((project) => !project.id.startsWith('demo-') && project.id !== savedProject.id)
    ]);
    return savedProject;
  };

  const addReport = (newReport: Omit<ReportItem, 'id' | 'downloadsCount'>) => {
    const reportItem: ReportItem = {
      ...newReport,
      id: `rep-${Date.now()}`,
      downloadsCount: 0
    };
    setReports((prev) => [reportItem, ...prev]);
    return reportItem;
  };

  const updateProjectProgress = (id: string, progress: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              progress,
              status: progress >= 100 ? 'Concluído' : progress > 0 ? 'Em Execução' : 'Planeado'
            }
          : p
      )
    );
  };

  const markNoticeAsRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        login,
        loginWithGoogle,
        registerUser,
        registeredUsers,
        reviewRegisteredUser,
        canManageUsers,
        logout,
        occurrences,
        projects,
        notices,
        news,
        simulations,
        reports,
        addReport,
        addOccurrence,
        updateOccurrenceStatus,
        addProject,
        updateProjectProgress,
        selectedProvince,
        setSelectedProvince,
        isDarkMode,
        themeMode,
        setThemeMode,
        cycleThemeMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        activeRole,
        setActiveRole,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        markNoticeAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

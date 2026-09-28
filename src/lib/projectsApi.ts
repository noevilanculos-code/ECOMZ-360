import { EnvironmentalProject } from '../types';
import { authenticatedFetch } from './occurrencesApi';

interface ProjectPage {
  data: EnvironmentalProject[];
  pagination: { page: number; pageSize: number; total: number };
}

export const listProjects = (): Promise<ProjectPage> =>
  authenticatedFetch('/api/v1/projects?page=1&pageSize=100');

export const createProject = async (project: EnvironmentalProject): Promise<EnvironmentalProject> => {
  const payload = await authenticatedFetch('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(project)
  });
  return payload.data as EnvironmentalProject;
};
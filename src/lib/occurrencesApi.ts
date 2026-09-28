import { auth } from './googleAuth';
import { Occurrence, OccurrenceStatus } from '../types';

interface OccurrencePage {
  data: Occurrence[];
  pagination: { page: number; pageSize: number; total: number };
}

export const authenticatedFetch = async (path: string, init: RequestInit = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Entre na sua conta para usar ocorrências persistentes.');

  const idToken = await user.getIdToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...init.headers
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Não foi possível comunicar com o serviço de ocorrências.');
  }
  return payload;
};

export const listOccurrences = async (page = 1, pageSize = 100): Promise<OccurrencePage> =>
  authenticatedFetch(`/api/v1/occurrences?page=${page}&pageSize=${pageSize}`);

export const createOccurrence = async (occurrence: Occurrence): Promise<Occurrence> => {
  const payload = await authenticatedFetch('/api/v1/occurrences', {
    method: 'POST',
    body: JSON.stringify(occurrence)
  });
  return payload.data as Occurrence;
};

export const changeOccurrenceStatus = async (
  id: string,
  status: OccurrenceStatus,
  reason?: string
): Promise<void> => {
  await authenticatedFetch(`/api/v1/occurrences/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason })
  });
};

import { randomUUID } from 'crypto';
import { Router } from 'express';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { EnvironmentalCategory, EnvironmentalProject, MozambiqueProvince } from '../../src/types';
import { AuthenticatedRequest, requireFirebaseUser, requireRoles } from '../firebaseAuth';
import { getDatabase } from '../db';

const router = Router();

const categories: EnvironmentalCategory[] = [
  'Desmatamento', 'Queimadas Descontroladas', 'Poluição Hídrica',
  'Erosão Costeira/Pluvial', 'Resíduos Sólidos Urbanos', 'Destruição de Mangais',
  'Caça Furtiva & Biodiversidade', 'Mineração Ilegal'
];
const provinces: MozambiqueProvince[] = [
  'Cabo Delgado', 'Niassa', 'Nampula', 'Zambézia', 'Tete', 'Manica', 'Sofala',
  'Inhambane', 'Gaza', 'Maputo Província', 'Maputo Cidade'
];

interface ProjectRow extends RowDataPacket {
  id: string;
  title: string;
  category: EnvironmentalCategory;
  province: MozambiqueProvince;
  district: string;
  lead_entity: string;
  status: EnvironmentalProject['status'];
  progress: number;
  budget_total_mzn: number | string;
  budget_raised_mzn: number | string;
  start_date: string | Date;
  target_date: string | Date;
  description: string;
  key_metric: string;
  key_metric_achieved: string;
  volunteer_spots: number;
  volunteers_enrolled: number;
}

const toDateString = (value: string | Date) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);

const toProject = (row: ProjectRow): EnvironmentalProject => ({
  id: row.id,
  title: row.title,
  category: row.category,
  province: row.province,
  district: row.district,
  leadEntity: row.lead_entity,
  status: row.status,
  progress: Number(row.progress),
  budgetTotalMZN: Number(row.budget_total_mzn),
  budgetRaisedMZN: Number(row.budget_raised_mzn),
  startDate: toDateString(row.start_date),
  targetDate: toDateString(row.target_date),
  description: row.description,
  keyMetric: row.key_metric,
  keyMetricAchieved: row.key_metric_achieved,
  volunteerSpots: Number(row.volunteer_spots),
  volunteersEnrolled: Number(row.volunteers_enrolled)
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const selectColumns = `id, title, category, province, district, lead_entity, status,
  progress, budget_total_mzn, budget_raised_mzn, start_date, target_date, description,
  key_metric, key_metric_achieved, volunteer_spots, volunteers_enrolled`;

router.get('/', requireFirebaseUser, async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(request.query.pageSize) || 100));
  const authUser = (request as AuthenticatedRequest).authenticatedUser;
  try {
    const database = getDatabase();
    const [rows] = await database.execute<ProjectRow[]>(
      `SELECT ${selectColumns} FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [pageSize, (page - 1) * pageSize]
    );
    const [[countRow]] = await database.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM projects'
    );
    return response.json({
      data: rows.map(toProject),
      pagination: { page, pageSize, total: Number(countRow.total) },
      permissions: { canCreateProjects: ['admin', 'gestor'].includes(authUser?.role || '') }
    });
  } catch (error) {
    console.error('Falha ao listar projetos persistidos:', error);
    return response.status(503).json({ error: 'Não foi possível consultar os projetos.' });
  }
});

router.post('/', requireFirebaseUser, requireRoles('admin', 'gestor'), async (request, response) => {
  const body = request.body;
  if (!isRecord(body)) return response.status(400).json({ error: 'Pedido inválido.' });

  const { title, category, province, district, leadEntity, budgetTotalMZN, startDate,
    targetDate, description, keyMetric, keyMetricAchieved, volunteerSpots } = body;
  if (typeof title !== 'string' || title.trim().length < 5 || title.length > 180 ||
      !categories.includes(category as EnvironmentalCategory) ||
      !provinces.includes(province as MozambiqueProvince)) {
    return response.status(400).json({ error: 'Título, categoria ou província inválida.' });
  }
  if (typeof district !== 'string' || !district.trim() || district.length > 100 ||
      typeof leadEntity !== 'string' || !leadEntity.trim() || leadEntity.length > 180) {
    return response.status(400).json({ error: 'Distrito ou entidade líder inválidos.' });
  }
  if (typeof budgetTotalMZN !== 'number' || !Number.isFinite(budgetTotalMZN) || budgetTotalMZN < 0 || budgetTotalMZN > 9999999999999.99 ||
      typeof volunteerSpots !== 'number' || !Number.isInteger(volunteerSpots) || volunteerSpots < 0 || volunteerSpots > 1000000) {
    return response.status(400).json({ error: 'Orçamento ou número de vagas inválido.' });
  }
  if (!isDate(startDate) || !isDate(targetDate) || targetDate < startDate ||
      typeof description !== 'string' || description.length > 5000 ||
      typeof keyMetric !== 'string' || !keyMetric.trim() || keyMetric.length > 180 ||
      typeof keyMetricAchieved !== 'string' || !keyMetricAchieved.trim() || keyMetricAchieved.length > 180) {
    return response.status(400).json({ error: 'Datas, descrição ou metas inválidas.' });
  }

  const authUser = (request as AuthenticatedRequest).authenticatedUser;
  if (!authUser) return response.status(401).json({ error: 'Autenticação necessária.' });

  const id = randomUUID();
  const project: EnvironmentalProject = {
    id,
    title: title.trim(),
    category: category as EnvironmentalCategory,
    province: province as MozambiqueProvince,
    district: district.trim(),
    leadEntity: leadEntity.trim(),
    status: 'Planeado',
    progress: 0,
    budgetTotalMZN,
    budgetRaisedMZN: 0,
    startDate,
    targetDate,
    description: description.trim(),
    keyMetric: keyMetric.trim(),
    keyMetricAchieved: keyMetricAchieved.trim(),
    volunteerSpots,
    volunteersEnrolled: 0
  };

  let connection: PoolConnection | null = null;
  try {
    const database = getDatabase();
    connection = await database.getConnection();
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO projects
        (id, title, category, province, district, lead_entity, status, progress,
         budget_total_mzn, budget_raised_mzn, start_date, target_date, description,
         key_metric, key_metric_achieved, volunteer_spots, volunteers_enrolled, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'Planeado', 0, ?, 0, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, project.title, project.category, project.province, project.district,
        project.leadEntity, project.budgetTotalMZN, project.startDate, project.targetDate,
        project.description, project.keyMetric, project.keyMetricAchieved,
        project.volunteerSpots, authUser.id]
    );
    await connection.execute(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, after_json)
       VALUES (?, 'CREATE', 'project', ?, JSON_OBJECT('title', ?, 'status', 'Planeado'))`,
      [authUser.id, id, project.title]
    );
    await connection.commit();
    return response.status(201).json({ data: project });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Falha ao criar projeto:', error);
    return response.status(503).json({ error: 'Não foi possível registar o projeto.' });
  } finally {
    connection?.release();
  }
});

export default router;
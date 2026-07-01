import { supabase } from '../lib/supabaseClient';
import { cearaCoordinates } from '../mock/cearaCoordinates';
import { Installation, Project, ProjectFormData } from '../types';

// Linhas como vêm do Postgres (snake_case)
interface ProjectRow {
  id: string;
  client_name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  installed_power: number;
  status: Project['status'];
  start_date: string;
  estimated_value: number;
  responsible: string;
}

interface InstallationRow {
  id: string;
  project_id: string;
  installed_at: string;
  panel_count: number;
  inverter_model: string;
  notes: string | null;
}

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  clientName: row.client_name,
  address: row.address,
  city: row.city,
  lat: row.lat,
  lng: row.lng,
  installedPower: row.installed_power,
  status: row.status,
  startDate: row.start_date,
  estimatedValue: row.estimated_value,
  responsible: row.responsible,
});

const toInstallation = (row: InstallationRow): Installation => ({
  id: row.id,
  projectId: row.project_id,
  installedAt: row.installed_at,
  panelCount: row.panel_count,
  inverterModel: row.inverter_model,
  notes: row.notes ?? '',
});

const formToRow = (data: ProjectFormData) => {
  const coord = cearaCoordinates[data.city] ?? { lat: -5.0, lng: -39.0 };
  return {
    client_name: data.clientName,
    address: data.address,
    city: data.city,
    lat: coord.lat,
    lng: coord.lng,
    installed_power: data.installedPower,
    status: data.status,
    start_date: data.startDate,
    estimated_value: data.estimatedValue,
    responsible: data.responsible,
  };
};

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ProjectRow[]).map(toProject);
  },

  getById: async (id: string): Promise<Project | undefined> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? toProject(data as ProjectRow) : undefined;
  },

  getByStatus: async (status: Project['status']): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status);
    if (error) throw error;
    return (data as ProjectRow[]).map(toProject);
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const { data: inserted, error } = await supabase
      .from('projects')
      .insert(formToRow(data))
      .select()
      .single();
    if (error) throw error;
    return toProject(inserted as ProjectRow);
  },

  update: async (id: string, data: ProjectFormData): Promise<Project> => {
    const { data: updated, error } = await supabase
      .from('projects')
      .update(formToRow(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!updated) throw new Error('Projeto não encontrado');
    return toProject(updated as ProjectRow);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};

export const installationService = {
  getByProjectId: async (projectId: string): Promise<Installation | undefined> => {
    const { data, error } = await supabase
      .from('installations')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return data ? toInstallation(data as InstallationRow) : undefined;
  },
};

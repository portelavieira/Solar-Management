export type ProjectStatus = 'Em andamento' | 'Concluído' | 'Aguardando';

export interface Project {
  id: string;
  clientName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  installedPower: number; // kWp
  status: ProjectStatus;
  startDate: string; // ISO date string
  estimatedValue: number; // BRL
  responsible: string;
}

export interface ProjectFormData {
  clientName: string;
  address: string;
  city: string;
  installedPower: number;
  status: ProjectStatus;
  startDate: string;
  estimatedValue: number;
  responsible: string;
}

export interface Installation {
  id: string;
  projectId: string;
  installedAt: string; // ISO date string
  panelCount: number;
  inverterModel: string;
  notes: string;
}

export interface InstallationFormData {
  installedAt: string;
  panelCount: number;
  inverterModel: string;
  notes: string;
}

import Chip from '@mui/material/Chip';
import { ProjectStatus } from '../../types';

interface StatusChipProps {
  status: ProjectStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: 'primary' | 'success' | 'warning' }
> = {
  'Em andamento': { label: 'Em andamento', color: 'primary' },
  Concluído: { label: 'Concluído', color: 'success' },
  Aguardando: { label: 'Aguardando', color: 'warning' },
};

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const { label, color } = statusConfig[status];
  return <Chip label={label} color={color} size={size} variant="filled" />;
}

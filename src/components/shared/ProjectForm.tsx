import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Project, ProjectFormData, ProjectStatus } from '../../types';
import { cearaCoordinates } from '../../mock/cearaCoordinates';

interface ProjectFormProps {
  initial?: Project;
  onSave: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

const initialData: ProjectFormData = {
  clientName: '',
  address: '',
  city: '',
  installedPower: 0,
  status: 'Aguardando',
  startDate: '',
  estimatedValue: 0,
  responsible: '',
};

export function ProjectForm({ initial, onSave, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>(
    initial
      ? {
          clientName: initial.clientName,
          address: initial.address,
          city: initial.city,
          installedPower: initial.installedPower,
          status: initial.status,
          startDate: initial.startDate,
          estimatedValue: initial.estimatedValue,
          responsible: initial.responsible,
        }
      : initialData,
  );
  const [saving, setSaving] = useState(false);

  const cities = Object.keys(cearaCoordinates).sort();

  const set = <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const isValid =
    form.clientName.trim() &&
    form.address.trim() &&
    form.city &&
    form.installedPower > 0 &&
    form.startDate &&
    form.estimatedValue > 0 &&
    form.responsible.trim();

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
      <TextField
        label="Nome do cliente"
        required
        size="small"
        value={form.clientName}
        onChange={(e) => set('clientName', e.target.value)}
      />
      <TextField
        label="Endereço"
        required
        size="small"
        value={form.address}
        onChange={(e) => set('address', e.target.value)}
      />
      <FormControl required size="small">
        <InputLabel>Cidade</InputLabel>
        <Select
          value={form.city}
          label="Cidade"
          onChange={(e) => set('city', e.target.value)}
        >
          {cities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Potência instalada (kWp)"
        required
        type="number"
        size="small"
        inputProps={{ min: 0, step: 0.01 }}
        value={form.installedPower || ''}
        onChange={(e) => set('installedPower', parseFloat(e.target.value) || 0)}
      />
      <FormControl required size="small">
        <InputLabel>Status</InputLabel>
        <Select
          value={form.status}
          label="Status"
          onChange={(e) => set('status', e.target.value as ProjectStatus)}
        >
          <MenuItem value="Aguardando">Aguardando</MenuItem>
          <MenuItem value="Em andamento">Em andamento</MenuItem>
          <MenuItem value="Concluído">Concluído</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Data de início"
        required
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={form.startDate}
        onChange={(e) => set('startDate', e.target.value)}
      />
      <TextField
        label="Valor estimado (R$)"
        required
        type="number"
        size="small"
        inputProps={{ min: 0, step: 0.01 }}
        value={form.estimatedValue || ''}
        onChange={(e) => set('estimatedValue', parseFloat(e.target.value) || 0)}
      />
      <TextField
        label="Responsável técnico"
        required
        size="small"
        value={form.responsible}
        onChange={(e) => set('responsible', e.target.value)}
      />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={!isValid || saving}>
          {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar projeto'}
        </Button>
      </Box>
    </Box>
  );
}

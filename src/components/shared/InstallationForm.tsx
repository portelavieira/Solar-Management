import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Installation, InstallationFormData } from '../../types';

interface InstallationFormProps {
  initial?: Installation;
  onSave: (data: InstallationFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: InstallationFormData = {
  installedAt: '',
  panelCount: 0,
  inverterModel: '',
  notes: '',
};

export function InstallationForm({ initial, onSave, onCancel }: InstallationFormProps) {
  const [form, setForm] = useState<InstallationFormData>(
    initial
      ? {
          installedAt: initial.installedAt,
          panelCount: initial.panelCount,
          inverterModel: initial.inverterModel,
          notes: initial.notes,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof InstallationFormData>(key: K, value: InstallationFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
    form.installedAt &&
    form.panelCount > 0 &&
    form.inverterModel.trim();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}
    >
      <TextField
        label="Data de instalação"
        type="date"
        required
        size="small"
        InputLabelProps={{ shrink: true }}
        value={form.installedAt}
        onChange={(e) => set('installedAt', e.target.value)}
      />
      <TextField
        label="Quantidade de painéis"
        type="number"
        required
        size="small"
        inputProps={{ min: 1, step: 1 }}
        value={form.panelCount || ''}
        onChange={(e) => set('panelCount', parseInt(e.target.value) || 0)}
      />
      <TextField
        label="Modelo do inversor"
        required
        size="small"
        value={form.inverterModel}
        onChange={(e) => set('inverterModel', e.target.value)}
      />
      <TextField
        label="Observações"
        multiline
        rows={3}
        size="small"
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
      />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={!isValid || saving}>
          {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Registrar instalação'}
        </Button>
      </Box>
    </Box>
  );
}

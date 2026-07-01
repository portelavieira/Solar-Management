import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from '../components/shared/ProjectForm';
import { StatusChip } from '../components/shared/StatusChip';
import { installationService, projectService } from '../services/projectService';
import { Installation, Project, ProjectFormData } from '../types';
import { useAuth } from '../lib/AuthContext';

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5 }}>
      {icon && (
        <Box sx={{ color: 'text.disabled', mt: 0.2, flexShrink: 0, fontSize: 18 }}>{icon}</Box>
      )}
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = (projectId: string) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    Promise.all([projectService.getById(projectId), installationService.getByProjectId(projectId)])
      .then(([proj, inst]) => {
        if (!proj) {
          setNotFound(true);
        } else {
          setProject(proj);
          setInstallation(inst ?? null);
        }
      })
      .catch(() => setError('Erro ao carregar os dados do projeto.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  const handleEditSave = async (data: ProjectFormData) => {
    if (!id) return;
    await projectService.update(id, data);
    setEditOpen(false);
    setSnackbar('Projeto atualizado com sucesso!');
    load(id);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: '#F5A623' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (notFound || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Projeto não encontrado. O ID informado não corresponde a nenhum registro.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>
          Voltar para Projetos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          Projetos
        </Button>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {project.clientName}
            </Typography>
            <StatusChip status={project.status} size="medium" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {project.city} · ID: {project.id}
          </Typography>
        </Box>

        {session && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
          >
            Editar
          </Button>
        )}
      </Box>

      <Grid container spacing={2.5}>
        {/* Project info card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1C1C2E' }}>
                Informações do Projeto
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <InfoRow
                label="Endereço"
                value={`${project.address}, ${project.city}`}
                icon={<LocationOnIcon fontSize="inherit" />}
              />
              <Divider sx={{ opacity: 0.4 }} />
              <InfoRow
                label="Data de início"
                value={formatDate(project.startDate)}
                icon={<CalendarTodayIcon fontSize="inherit" />}
              />
              <Divider sx={{ opacity: 0.4 }} />
              <InfoRow
                label="Responsável técnico"
                value={project.responsible}
                icon={<PersonIcon fontSize="inherit" />}
              />
              <Divider sx={{ opacity: 0.4 }} />
              <InfoRow
                label="Potência instalada"
                value={`${project.installedPower.toFixed(2)} kWp`}
                icon={<ElectricBoltIcon fontSize="inherit" />}
              />
              <Divider sx={{ opacity: 0.4 }} />
              <InfoRow
                label="Valor estimado"
                value={formatCurrency(project.estimatedValue)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Installation card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1C1C2E' }}>
                Dados de Instalação
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {installation ? (
                <>
                  <InfoRow label="Data de instalação" value={formatDate(installation.installedAt)} />
                  <Divider sx={{ opacity: 0.4 }} />
                  <InfoRow
                    label="Quantidade de painéis"
                    value={`${installation.panelCount} painéis`}
                  />
                  <Divider sx={{ opacity: 0.4 }} />
                  <InfoRow label="Modelo do inversor" value={installation.inverterModel} />
                  <Divider sx={{ opacity: 0.4 }} />
                  <Box sx={{ pt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Observações
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {installation.notes}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Chip label="Instalação pendente" color="warning" variant="outlined" />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    Os dados de instalação ainda não foram registrados para este projeto.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary chips */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                Resumo rápido
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={`${project.installedPower.toFixed(1)} kWp`}
                  icon={<ElectricBoltIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: '#F5A623', color: '#F5A623' }}
                />
                <Chip
                  label={project.city}
                  icon={<LocationOnIcon />}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={formatCurrency(project.estimatedValue)}
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: '#2ECC71', color: '#2ECC71' }}
                />
                {installation && (
                  <Chip
                    label={`${installation.panelCount} painéis`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Projeto</DialogTitle>
        <DialogContent>
          {project && (
            <ProjectForm
              initial={project}
              onSave={handleEditSave}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

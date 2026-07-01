import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '../components/shared/ProjectForm';
import { StatusChip } from '../components/shared/StatusChip';
import { useAuth } from '../lib/AuthContext';
import { projectService } from '../services/projectService';
import { Project, ProjectFormData, ProjectStatus } from '../types';

type FilterStatus = ProjectStatus | 'Todos';

export function Projects() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todos');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    projectService
      .getAll()
      .then(setProjects)
      .catch(() => setError('Erro ao carregar a lista de projetos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, filterStatus]);

  const openCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setDialogOpen(true);
  };

  const handleSave = async (data: ProjectFormData) => {
    if (editingProject) {
      await projectService.update(editingProject.id, data);
      setSnackbar('Projeto atualizado com sucesso!');
    } else {
      await projectService.create(data);
      setSnackbar('Projeto criado com sucesso!');
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    try {
      await projectService.delete(id);
      setSnackbar('Projeto excluído com sucesso!');
      load();
    } catch {
      setSnackbar('Erro ao excluir projeto.');
    }
    setDeletingId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por cliente ou cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Em andamento">Em andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
            <MenuItem value="Aguardando">Aguardando</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {session ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo Projeto
          </Button>
        ) : (
          <Tooltip title="Faça login para criar projetos">
            <span>
              <Button variant="contained" startIcon={<AddIcon />} disabled>
                Novo Projeto
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress sx={{ color: '#F5A623' }} />
        </Box>
      )}

      {/* Error */}
      {!loading && error && <Alert severity="error">{error}</Alert>}

      {/* Table */}
      {!loading && !error && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#FAFAFA', fontSize: 13 } }}>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Cidade</TableCell>
                  <TableCell align="right">Potência (kWp)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Valor estimado</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      Nenhum projeto encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((project) => (
                    <TableRow
                      key={project.id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                    >
                      <TableCell onClick={() => navigate(`/projects/${project.id}`)}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.clientName}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/projects/${project.id}`)}>
                        <Typography variant="body2" color="text.secondary">
                          {project.city}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={() => navigate(`/projects/${project.id}`)}>
                        <Typography variant="body2">{project.installedPower.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/projects/${project.id}`)}>
                        <StatusChip status={project.status} />
                      </TableCell>
                      <TableCell align="right" onClick={() => navigate(`/projects/${project.id}`)}>
                        <Typography variant="body2">
                          {project.estimatedValue.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/projects/${project.id}`)}>
                        <Typography variant="body2" color="text.secondary">
                          {project.responsible}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {session && (
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(project)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {session && (
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => setDeletingId(project.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado
              {filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          <ProjectForm
            initial={editingProject ?? undefined}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Excluir
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar feedback */}
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

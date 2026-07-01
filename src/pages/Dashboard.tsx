import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProjectMap } from '../components/shared/ProjectMap';
import { StatCard } from '../components/shared/StatCard';
import { useExportPDF } from '../lib/useExportPDF';
import { projectService } from '../services/projectService';
import { Project } from '../types';

const ACCENT = '#F5A623';
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const FUNNEL_COLORS = ['#F5A623', '#6C63FF', '#2ECC71'];

function buildMonthlyData(projects: Project[]) {
  const counts: Record<number, number> = {};
  projects.forEach((p) => {
    const month = new Date(p.startDate).getMonth();
    counts[month] = (counts[month] ?? 0) + 1;
  });
  return MONTH_LABELS.map((name, i) => ({ name, projetos: counts[i] ?? 0 }));
}

function buildFunnelData(projects: Project[]) {
  const stages = ['Aguardando', 'Em andamento', 'Concluído'] as const;
  const counts: Record<string, number> = { Aguardando: 0, 'Em andamento': 0, Concluído: 0 };
  projects.forEach((p) => { counts[p.status]++; });

  const stageOrder = ['Aguardando', 'Em andamento', 'Concluído'];
  const avgDays: Record<string, number> = {};
  const now = new Date();

  // Estimate avg days in each stage based on start date and (for concluded) a proxy
  stageOrder.forEach((status) => {
    const filtered = projects.filter((p) => p.status === status);
    if (filtered.length === 0) {
      avgDays[status] = 0;
      return;
    }
    if (status === 'Concluído') {
      const days = filtered.map((p) => {
        const start = new Date(p.startDate);
        // Assume ~60 days after start for concluded projects as rough proxy
        const estEnd = new Date(start);
        estEnd.setDate(start.getDate() + 60);
        return Math.round((estEnd.getTime() - start.getTime()) / 86400000);
      });
      avgDays[status] = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    } else {
      const days = filtered.map((p) =>
        Math.round((now.getTime() - new Date(p.startDate).getTime()) / 86400000),
      );
      avgDays[status] = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    }
  });

  return stages.map((s) => ({
    name: s,
    value: counts[s],
    tempoMédio: `${avgDays[s]} dias`,
  }));
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    projectService
      .getAll()
      .then(setProjects)
      .catch(() => setError('Erro ao carregar os dados do dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const { exportReport } = useExportPDF();

  const availableYears = useMemo(() => {
    const years = [...new Set(projects.map((p) => new Date(p.startDate).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [projects]);

  const effectiveYear = selectedYear || availableYears[0] || 2024;

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const filteredByYear = useMemo(
    () => projects.filter((p) => new Date(p.startDate).getFullYear() === effectiveYear),
    [projects, effectiveYear],
  );

  const stats = useMemo(() => {
    const total = filteredByYear.length;
    const concluidos = filteredByYear.filter((p) => p.status === 'Concluído').length;
    const potencia = filteredByYear.reduce((acc, p) => acc + p.installedPower, 0);
    const valor = filteredByYear.reduce((acc, p) => acc + p.estimatedValue, 0);
    return { total, concluidos, potencia, valor };
  }, [filteredByYear]);

  const monthlyData = useMemo(() => buildMonthlyData(filteredByYear), [filteredByYear]);
  const funnelData = useMemo(() => buildFunnelData(filteredByYear), [filteredByYear]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: ACCENT }} />
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Page header with export button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => exportReport(filteredByYear, stats, effectiveYear)}
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total de Projetos"
            value={stats.total}
            Icon={FolderSpecialIcon}
            accentColor="#6C63FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Projetos Concluídos"
            value={stats.concluidos}
            Icon={AssignmentTurnedInIcon}
            accentColor="#2ECC71"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Potência Instalada"
            value={`${stats.potencia.toFixed(1)} kWp`}
            Icon={ElectricBoltIcon}
            accentColor={ACCENT}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Valor Total"
            value={stats.valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            })}
            Icon={AttachMoneyIcon}
            accentColor="#E74C3C"
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Monthly chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  Projetos iniciados por mês
                </Typography>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Ano</InputLabel>
                  <Select
                    value={effectiveYear}
                    label="Ano"
                    onChange={(e) => setSelectedYear(e.target.value as number)}
                  >
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Distribuição ao longo de {effectiveYear}
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(245,166,35,0.06)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #eee',
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [value, 'Projetos']}
                  />
                  <Bar dataKey="projetos" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Funnel */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Funil de Conversão
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Projetos por etapa e tempo médio
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {funnelData.map((item, idx) => {
                  const maxVal = Math.max(...funnelData.map((d) => d.value), 1);
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <Box key={item.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.value} ({item.tempoMédio})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 28,
                          bgcolor: '#f5f5f5',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${pct}%`,
                            height: '100%',
                            bgcolor: FUNNEL_COLORS[idx],
                            borderRadius: 1.5,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Localização dos Projetos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {projects.length} projetos no Ceará
          </Typography>

          <ProjectMap projects={projects} />
        </CardContent>
      </Card>
    </Box>
  );
}

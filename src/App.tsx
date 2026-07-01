import MenuIcon from '@mui/icons-material/Menu';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AuthProvider } from './lib/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ProjectDetail } from './pages/ProjectDetail';
import { Projects } from './pages/Projects';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const theme = createTheme({
  palette: {
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
    },
  },
});

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projetos',
  };
  const pageTitle = pathname.startsWith('/projects/')
    ? 'Detalhe do Projeto'
    : pageTitles[pathname] ?? 'Solar Management';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  ml: { md: `${SIDEBAR_WIDTH}px` },
                }}
              >
                <AppBar
                  position="sticky"
                  elevation={0}
                  sx={{
                    bgcolor: '#fff',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
                    <IconButton
                      edge="start"
                      onClick={() => setMobileOpen(true)}
                      sx={{ mr: 1.5, display: { md: 'none' } }}
                    >
                      <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                      {pageTitle}
                    </Typography>

                    <TopBar />
                  </Toolbar>
                </AppBar>

                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', overflow: 'auto' }}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          }
        />
      </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

import BoltIcon from '@mui/icons-material/Bolt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { NavLink, useLocation } from 'react-router-dom';

export const SIDEBAR_WIDTH = 240;
const SIDEBAR_BG = '#1C1C2E';
const ACCENT = '#F5A623';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', Icon: DashboardIcon },
  { label: 'Projetos', path: '/projects', Icon: SolarPowerIcon },
];

interface SidebarContentProps {
  onItemClick?: () => void;
}

function SidebarContent({ onItemClick }: SidebarContentProps) {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        bgcolor: SIDEBAR_BG,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BoltIcon sx={{ color: ACCENT, fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.1 }}>
            Solar
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase' }}
          >
            Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      <List sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
        {navItems.map(({ label, path, Icon }) => {
          const isActive =
            path === '/dashboard'
              ? location.pathname === '/dashboard' || location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={path}
                onClick={onItemClick}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  color: isActive ? ACCENT : 'rgba(255,255,255,0.6)',
                  bgcolor: isActive ? 'rgba(245,166,35,0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(245,166,35,0.18)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? ACCENT : '#fff',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      bgcolor: ACCENT,
                      borderRadius: 2,
                      ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
          v1.0.0 · Portfolio
        </Typography>
      </Box>
    </Box>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { bgcolor: SIDEBAR_BG, width: SIDEBAR_WIDTH, border: 'none' },
        }}
      >
        <SidebarContent onItemClick={onClose} />
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { bgcolor: SIDEBAR_BG, width: SIDEBAR_WIDTH, border: 'none' },
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}

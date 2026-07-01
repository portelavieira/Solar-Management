import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export function TopBar() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return (
      <Button
        size="small"
        startIcon={<LoginIcon fontSize="small" />}
        onClick={() => navigate('/login')}
      >
        Entrar
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {session.user.email}
      </Typography>
      <Button
        size="small"
        startIcon={<LogoutIcon fontSize="small" />}
        onClick={() => signOut()}
      >
        Sair
      </Button>
    </Box>
  );
}

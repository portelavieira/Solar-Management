import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: SvgIconComponent;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  Icon,
  accentColor = '#F5A623',
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${accentColor}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: accentColor, fontSize: 24 }} />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

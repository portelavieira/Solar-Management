import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Project } from '../../types';

const statusColors: Record<string, string> = {
  'Concluído': '#2ECC71',
  'Em andamento': '#6C63FF',
  'Aguardando': '#F5A623',
};

function createIcon(status: string) {
  const color = statusColors[status] ?? '#F5A623';
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
    `,
  });
}

interface ProjectMapProps {
  projects: Project[];
}

export function ProjectMap({ projects }: ProjectMapProps) {
  const center: [number, number] = projects.length > 0
    ? [projects.reduce((s, p) => s + p.lat, 0) / projects.length,
       projects.reduce((s, p) => s + p.lng, 0) / projects.length]
    : [-5.0, -39.0];

  return (
    <Box sx={{ height: 400, borderRadius: 3, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createIcon(p.status)}>
            <Popup>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {p.clientName}
              </Typography>
              <Typography variant="caption" display="block">
                {p.city}
              </Typography>
              <Typography variant="caption" display="block">
                {p.installedPower.toFixed(1)} kWp · {p.status}
              </Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}

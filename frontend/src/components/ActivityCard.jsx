// components/ActivityCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Tooltip,
  ListItem,
} from '@mui/material';
import MinutesIcon from '@mui/icons-material/TimerOutlined';
import DistanceIcon from '@mui/icons-material/Straighten';
import PublicIcon from '@mui/icons-material/Public';
import PrivateIcon from '@mui/icons-material/Lock';

import SportTypeIcon from './SportTypeIcon';

function formatDatetime(datetime) {
  const date = new Date(datetime);
  const dateStr = date.toDateString();

  const today = new Date()
  const todayStr = today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  const formattedDate = (
    (dateStr === todayStr) ? 'Today' :
    (dateStr === yesterdayStr) ? 'Yesterday' :
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  )

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formattedDate} at ${formattedTime}`
}


export default function ActivityCard({ activity }) {
  const datetimeStr = formatDatetime(activity.datetime)


  return (
    <ListItem key={activity.activity_id} disablePadding sx={{ mb: 1.5 }}>
      <Card
        elevation={3}
        sx={{
          width: '100%',
          textDecoration: 'none',
          borderLeft: 5,
          borderColor: 'primary.light',
        }}
        component="a"
        href={`https://www.strava.com/activities/${activity.activity_id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardContent sx={{ pt: 1, '&:last-child': { pb: 1 }}}>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title={activity.sport_type}>
                <SportTypeIcon sportType={activity.sport_type} fontSize="small" />
              </Tooltip>
              <Typography variant="h6" fontWeight="bold">
                {activity.name}
              </Typography>
            </Stack>
            <Tooltip title={activity.private ? 'Private Activity' : 'Public Activity'}>
              {activity.private ? <PrivateIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
            </Tooltip>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            {datetimeStr}
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ mt: 1}}>
            <Tooltip title={"Minutes"}>
              <Box display="flex" alignItems="center">
                <MinutesIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">{activity.minutes} min</Typography>
              </Box>
            </Tooltip>
            <Tooltip title={"Distance"}>
              <Box display="flex" alignItems="center">
                <DistanceIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">{activity.distance.toFixed(2)} mi</Typography>
              </Box>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </ListItem>
  );
}

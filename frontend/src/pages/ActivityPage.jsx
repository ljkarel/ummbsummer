import { useState, useEffect } from 'react';
import { api } from '../utilities';
import {
  Box,
  List,
  CircularProgress,
  Typography,
} from '@mui/material';
import ActivityCard from '../components/ActivityCard';
import WeeklyStats from '../components/WeeklyStats';

export default function ActivityPage() {
  const [activities, setActivities] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    api.get('/activities', { withCredentials: true })
      .then(res => setActivities(res.data));

    api.get('/metrics/me', { withCredentials: true })
      .then(res => setWeeklyStats(res.data))
  }, []);

  if (!activities || !weeklyStats) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">No activities found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Your Weekly Summary</Typography>
      <WeeklyStats data={weeklyStats} />
      
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Your Activities</Typography>
      <List>
        {activities.map(activity => (
          <ActivityCard key={activity.activity_id} activity={activity} />
        ))}
      </List>
    </Box>
  );
}

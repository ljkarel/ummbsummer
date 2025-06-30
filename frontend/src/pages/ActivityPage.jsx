import { useState, useEffect } from 'react';
import { api } from '../utilities';
import {
  Box,
  List,
  CircularProgress,
  Typography,
} from '@mui/material';
import ActivityCard from '../components/ActivityCard';

export default function ActivityPage() {
  const [activities, setActivities] = useState(null);

  useEffect(() => {
    api.get('/activities', { withCredentials: true })
      .then(res => setActivities(res.data));
  }, []);

  if (!activities) {
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
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <List>
        {activities.map(activity => (
          <ActivityCard key={activity.activity_id} activity={activity} />
        ))}
      </List>
    </Box>
  );
}

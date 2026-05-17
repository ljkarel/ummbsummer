import { useState, useEffect } from 'react';
import { api } from '../utilities';
import {
  Box,
  List,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import ActivityCard from '../components/ActivityCard';
import WeeklyStats from '../components/WeeklyStats';
import Loading from '../components/Loading';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivities = (url = '/activities') => {
    setLoading(true);
    api.get(url, { withCredentials: true }).then(res => {
      setActivities(res.data.results);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchActivities();
    api.get('/metrics/me', { withCredentials: true })
      .then(res => setWeeklyStats(res.data));
  }, []);

  if (loading || !weeklyStats) return <Loading />;

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

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          disabled={!prevUrl}
          onClick={() => fetchActivities(prevUrl)}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          disabled={!nextUrl}
          onClick={() => fetchActivities(nextUrl)}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

export default function WeeklyStats({ data }) {
  if (!data || data.length === 0) {
    return <Typography>No activity data available.</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
        {data.map((weekData) => (
          <Grid key={weekData.week}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Week {weekData.week}
                </Typography>
                <Typography variant="body1">
                  <strong>Minutes:</strong> {weekData.minutes}
                </Typography>
                <Typography variant="body1">
                  <strong>Points:</strong> {weekData.points.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}
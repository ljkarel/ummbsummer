import { Box, Typography } from "@mui/material";

export default function RegistrationSection({ title, icon, children, id }) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', m: 2, p: 2, pb: 4 }} id={id}>
      <Box
        sx={{
          px: 2,
          py: 1,
          mb: 3,
          backgroundColor: 'secondary.main',
          color: 'primary.dark',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5">{title}</Typography>
        {icon}
      </Box>
      {children}
    </Box>
  );
}
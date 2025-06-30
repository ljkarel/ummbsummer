// react
import { useState } from 'react'

// MUI components
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  LinearProgress 
} from '@mui/material'

// MUI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RegisteredIcon from '@mui/icons-material/CheckCircle'
import UnregisteredIcon from '@mui/icons-material/Cancel'

export default function RegistrationMembers({ sections }) {
  const [expanded, setExpanded] = useState(false)

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {sections.map((section, index) => {
        const total = section.members.length
        const registered = section.members.filter(m => m.registered).length
        const progress = (registered / total) * 100

        return (
          <Accordion
            elevation={3}
            disableGutters
            key={index}
            expanded={expanded === index}
            onChange={handleChange(index)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '95%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {section.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 7, borderRadius: 1, my: 0.5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {registered} of {total} registered
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {section.members.map((member, i) => (
                  <ListItem key={i}>
                    <ListItemIcon>
                      {member.registered ? (
                        <RegisteredIcon color="success" />
                      ) : (
                        <UnregisteredIcon color="error" />                      
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${member.name}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  );
}
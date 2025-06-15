// react
import { useState } from "react"

// MUI components
import Accordion from "@mui/material/Accordion"
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from "@mui/material/AccordionDetails"
import Typography from "@mui/material/Typography"
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material'

// MUI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'


// custom badge for each section
const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: -20,
    top: 12,
  }
}))

export default function RegistrationMembers(props) {
  const [expanded, setExpanded] = useState(false)

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {props.sections.map((section, index) => (
        <Accordion elevation={3} disableGutters key={index} expanded={expanded === index} onChange={handleChange(index)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StyledBadge badgeContent={section.members.length} color='primary'>
                <Typography>{section.name}</Typography>
            </StyledBadge>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {section.members.map((member, index) => (
                <ListItem key={index}>
                  <Typography variant='subtitle1'>{member.first_name} {member.last_name}</Typography>
                </ListItem>
              ))}
            </List>   
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
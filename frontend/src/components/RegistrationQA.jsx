// react
import { useState } from "react"

// MUI components
import Accordion from "@mui/material/Accordion"
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from "@mui/material/AccordionDetails"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

// MUI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export default function RegistrationQA() {
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
      <Accordion elevation={3} disableGutters expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            How does this work?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            When you press <strong>Connect with STRAVA</strong>, you will be brought to Strava{"'"}s authentication page
            for our minute tracker app, where you can grant us permission to your activities (to track minutes). If you 
            wish to have any private activities count for your section, you may opt to grant permission to track activities 
            that are private. Strava will then provide the app with an authorization code (via OAuth2) to access the 
            content you allowed. The app will then be able to track your minutes.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion elevation={3} disableGutters expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Why is this necessary?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            While there are many great things about Strava, unfortunately it is not currently possible to track 
            activities/minutes for each member of the club. We wish to allow users to keep activities private if they 
            wish; however, we want them to have the option to have them still count toward their team goals. Since 
            Strava{"'"}s leaderboard is limited to the top 100 atheletes each week and does not include private activities, 
            it is not an ideal way to track minutes for the band, thus we are utilizing this minute tracker app.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion elevation={3} disableGutters expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Is this secure?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes. This application uses OAuth2 with Strava to securely access information from Strava{"'"}s database. No 
            usernames or passwords are shared with this app in the process. At any point you may go to <strong>Strava 
            {">"} My Settings {">"} My Apps </strong> and revoke access for this app. <i>NOTE: Revoking access to this 
            app will mean that your activities will no longer count toward your section.</i>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion elevation={3} disableGutters expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            It{"'"}s not working?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Please contact Lukas Karel at <strong>karel084@umn.edu</strong> with any issues.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
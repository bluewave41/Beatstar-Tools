import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

const NotesAccordion = (props) => {
    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Notes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        - Once you upload a chart the boxes will be autofilled with your sections and normal values.
                        <br />
                        - A smaller perfect size will make the notes harder to hit as you need to be more precise.
                        <br />
                        - The size of the perfect bar is determined by the value you provide as beat index 0. It will not change size throughout the song.
                        <br />
                        - A smaller speed will make the notes move faster. Higher speeds make the notes move slower.
                        <br />
                        - The speeds should ideally be set at section markers with space after them. The speed change is what causes the floating notes towards you.
                    </Typography>
                </AccordionDetails>
            </Accordion>
      </div>
    )
}

export default NotesAccordion;
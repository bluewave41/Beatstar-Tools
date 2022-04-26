import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import NumberRow from './NumberRow';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const SlideDownPanel = (props) => {
    const onChange = (id, name, value) => {
        props.onChange(id, name, value);
    }

    const onRemove = (id, name) => {
        props.onRemove(id, name);
    }

    const onAddRow = () => {
        props.onAddRow(props.field);
    }

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{props.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        {props.values.map((el, index) => (
                            <NumberRow key={el.offset} id={index} offset={el.offset} multiplier={el.multiplier} onChange={onChange} onRemove={onRemove} field={props.field} />
                        ))}
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <Button sx={{
                                backgroundColor: 'green',
                                ':hover': {
                                    backgroundColor: 'green'
                                }
                                }}
                                onClick={onAddRow}>+</Button>
                        </Box>
                    </Typography>
                </AccordionDetails>
            </Accordion>
      </div>
    )
}

export default SlideDownPanel;
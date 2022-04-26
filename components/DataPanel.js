import Box from '@mui/material/Box';
import NotesAccordion from './NotesAccordion';
import SlideDownPanel from './SlideDownPanel';

const DataPanel = (props) => {
    const onChange = (id, name, value) => {
        props.onChange(id, name, value);
    }

    const onRemove = (id, name) => {
        props.onRemove(id, name);
    }

    const onAddRow = (name) => {
        props.onAddRow(name);
    }

    if(props.speeds.length) {
        return (
            <Box>
                <NotesAccordion />
                <SlideDownPanel title="Perfect Sizes" field='perfect' values={props.perfectSizes} onChange={onChange} onRemove={onRemove} onAddRow={onAddRow} />
                <SlideDownPanel title="Speeds" field='speed' values={props.speeds} onChange={onChange} onRemove={onRemove} onAddRow={onAddRow} />
            </Box>
        )
    }
}

export default DataPanel;
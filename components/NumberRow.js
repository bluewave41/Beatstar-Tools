import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const NumberRow = (props) => {
    const onRemove = (e) => {
        props.onRemove(props.id, e.target.name);
    }
    const onChange = (e) => {
        props.onChange(props.id, e.target.name, parseFloat(e.target.value));
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: '10px'
        }}>
            <TextField label="Offset" name={props.field + '-offset'} defaultValue={props.offset} onChange={onChange}/>
            <TextField label="Multiplier" name={props.field + '-multiplier'} defaultValue={props.multiplier} onChange={onChange}/>
            <Button sx={{
                ':hover': {
                    backgroundColor: 'red'
                }
            }}
            onClick={onRemove} name={props.field + '-remove'}>X</Button>
        </Box>
    )
}

export default NumberRow;
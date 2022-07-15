import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

const FieldCard = (props) => {
    const onTypeChange = (e) => {
        props.onTypeChange(props.field, e.target.value);
    }

    const onClick = (e) => {
        props.onCardClick(props.field);
    }

    return (
        <Card>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {props.field}
                </Typography>
                <Typography variant="h5" component="div">
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    <Select value={props.data.type} onChange={onTypeChange}>
                        <MenuItem value={'varint'}>Varint</MenuItem>
                        <MenuItem value={'string'}>String</MenuItem>
                        <MenuItem value={'length-encoded'}>Length-Encoded</MenuItem>
                        <MenuItem value={'packed'}>Packed</MenuItem>
                        <MenuItem value={'group'}>Group</MenuItem>
                        <MenuItem value={'32bit'}>32bit</MenuItem>
                        <MenuItem value={'64bit'}>64bit</MenuItem>
                    </Select>
                </Typography>
                {props.data.type != 'length-encoded' && props.data.type != 'packed' &&
                    <Typography>
                        {props.data.val}
                    </Typography>
                }
                <Typography variant="body2">
                    {props.data.length &&
                        <div>
                            Size: {props.data.length}
                        </div>
                    }
                    {Array.isArray(props.data.val) && 
                        <div>
                            Children: {props.data.val.length}
                            <Button onClick={onClick}>View</Button>
                        </div>
                    }
                </Typography>
            </CardContent>
        </Card>
    )
}

const FieldGrid = (props) => {
    const keys = Object.keys(props.data);

    return (
        <Grid container>
            {keys.map(el => (
                <FieldCard field={el} data={props.data[el]} onTypeChange={props.onTypeChange} onCardClick={props.onCardClick} />
            ))}
        </Grid>
    )
}

export default FieldGrid;
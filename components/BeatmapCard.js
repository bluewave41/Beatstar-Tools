import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Medal from 'components/Medal';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

const BeatmapCard = (props) => {
    let border;
    switch(props.difficultyId) {
        case 1:
            border = '3px solid red';
            break;
        case 3:
            border = '3px solid orange';
            break;
        default:
            border = '3px solid white';
            break;
    }
    return (
        <Card sx={{
            border: border,
            m: 1,
            minHeight: '224px',
            maxHeight: '256px',
            maxWidth: '256px',
            bgcolor: '#141414',
            color: 'white'
        }}>
            <CardContent>
                <Typography variant='h6'>
                    {props.label}
                </Typography>
                <Typography>
                    {props.score}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    {props.icon && <Medal type='ui' icon={props.icon} /> }
                </Box>
            </CardContent>
        </Card>
    )
}

export default BeatmapCard;
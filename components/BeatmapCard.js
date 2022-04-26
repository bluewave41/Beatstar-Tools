import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Medal from 'components/Medal';

const BeatmapCard = (props) => {
    let border;
    switch(props.difficultyId) {
        case 1:
            border = '1px solid red';
            break;
        case 3:
            border = '1px solid orange';
            break;
        default:
            border = '1px solid black';
            break;
    }
    return (
        <Card sx={{
            border: border,
            m: 1,
            minHeight: '183px',
            maxWidth: '275px'
        }}>
            <CardContent>
                <Typography>
                    {props.label}
                </Typography>
                <Typography>
                    {props.score}
                </Typography>
                {props.icon && <Medal type='ui' icon={props.icon} /> }
            </CardContent>
        </Card>
    )
}

export default BeatmapCard;
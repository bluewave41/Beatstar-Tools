import Box from '@mui/material/Box';
import ScoreRepository from 'repositories/ScoreRepository';
import BeatmapCard from 'components/BeatmapCard';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const BeatmapRow = (props) => {
    const colors = {
        1: '2px solid red',
        3: '2px solid orange',
        4: '2px solid white'
    }

    console.log(colors[props.difficultyId])

    return (
        <Box sx={{
            outline: colors[props.difficultyId],
            minHeight: '64px'
        }}>
            {props.label}
        </Box>
    )
}

const UserPage = (props) => {
    return (
        <Box>
            <Typography variant='h3'>
                Scores
            </Typography>

            <Grid container>
                {props.scores.map(el => (
                    <Grid item xs={8} lg={2} key={el.beatmap.idLabel}>
                        <BeatmapCard 
                            label={el.beatmap.beatmapName ? el.beatmap.beatmapName : el.beatmap.idLabel}
                            score={el.score}
                            icon={el.medal}
                            difficultyId={el.beatmap.difficultyId}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export async function getServerSideProps(context) {
    const { androidId } = context.query; 
    const scores = await ScoreRepository.getScores(androidId);

    //find a better way to do this
    for(var x=0;x<scores.length;x++) {
        let score = scores[x].score;
        let gold = scores[x].medal.find(el => el.medalName == 'gold').requiredScore;
        let platinum = scores[x].medal.find(el => el.medalName == 'platinum').requiredScore;
        let diamond = scores[x].medal.find(el => el.medalName == 'diamond').requiredScore;
        let perfect = scores[x].medal.find(el => el.medalName == 'perfect').requiredScore;

        if(score == perfect) {
            scores[x].medal = 'perfect';
        }
        else if(score >= diamond) {
            scores[x].medal = 'diamond';
        }
        else if(score >= platinum) {
            scores[x].medal = 'platinum';
        }
        else if(score >= gold) {
            scores[x].medal = 'gold';
        }
        else {
            scores[x].medal = null;
        }

    }
    
    return {
        props: {
            scores: JSON.parse(JSON.stringify(scores))
        }
    }
}

export default UserPage;
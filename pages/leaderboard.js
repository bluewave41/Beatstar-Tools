import Box from '@mui/material/Box';
import Medal from 'components/Medal';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';
import Link from 'next/link';
import Fab from '@mui/material/Fab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
const UserRepository = require('repositories/UserRepository');

const Row = (props) => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '500px',
            outline: '1px solid black',
            p: 1,
            m: 1,
            background: 'linear-gradient(11deg, rgba(34,193,195,1) 0%, rgba(0,0,0,1) 35%, rgba(43,221,243,1) 82%, rgba(45,227,253,1) 100%)'
        }}>
            <Avatar sx={{
                bgcolor: props.place == 1 ? 'gold' : props.place == 2 ? 'silver' : props.place == 3 ? '#CD7F32' : 'black'
            }}>{props.place}</Avatar>

            <Link href={`/user/${props.username}`}>
                <a>
                    <Box sx={{ color: 'white' }}>{props.username}</Box>
                </a>
            </Link>

            <Box>
                <Medal type="blank" icon="gold" text={props.gold} />
                <Medal type="blank" icon="platinum" text={props.platinum} />
                <Medal type="blank" icon="diamond" text={props.diamond} />
                <Medal type="blank" icon="diamond" text={props.perfect} />
            </Box>
        </Box>
    )
}

const Leaderboard = (props) => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState(props.users);

    const onChangePage = async (e) => {
        if(e.target.name == 'back') {
            if(page == 1) {
                return;
            }
            try {
                let response = await axios.post('api/leaderboard/getPage', { page: page-1 });
                setData(response.data);
                setPage(page - 1);
            }
            catch(e) {}
        }
        else if(e.target.name == 'forward') {
            try {
                let response = await axios.post('api/leaderboard/getPage', { page: page+1 });
                setData(response.data);
                setPage(page + 1);
            }
            catch(e) {}
        }
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <h1>Leaderboard</h1>
            {data.map((el, index) => (
                <Row place={(page - 1) * 20 + index + 1}
                    username={el.username ? el.username : el.androidId}
                    gold={el.gold} platinum={el.platinum}
                    diamond={el.diamond}
                    perfect={el.perfect}
                />
            ))}
            <Box sx={{ display: 'flex', position: 'fixed', bottom: 0, width: '100%', justifyContent: 'space-between' }}>
                <Fab sx={{ left: 140, bgcolor: 'green' }} onClick={onChangePage} name='back'>
                    <ArrowBackIcon sx={{ pointerEvents: 'none' }} />
                </Fab>
                <Fab sx={{ right: 140, bgcolor: 'green' }} onClick={onChangePage} name='forward'>
                    <ArrowForwardIcon sx={{ pointerEvents: 'none' }} />
                </Fab>
            </Box>
        </Box>
    )
}

export async function getServerSideProps(context) {
    //get the first 20
    const users = await UserRepository.getPage(1);

    return {
        props: {
            users: JSON.parse(JSON.stringify(users))
        }
    }
}

export default Leaderboard;
import KeyIcon from '@mui/icons-material/Key';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import HelpIcon from '@mui/icons-material/Help';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';

const Tabs = (props) => {
    const tabs = [
        { text: 'Encrypt', icon: <KeyIcon />, link: '/encrypt' },
        { text: 'Decrypt', icon: <KeyOffIcon />, link: '/decrypt' },
        { text: 'Songs', icon: <MusicNoteIcon />, link: '/songs' },
        { text: 'Leaderboard', icon: <LeaderboardIcon />, link: '/leaderboard' },
        { text: 'How to', icon: <HelpIcon />, link: '/help ' }
    ]

    return (
        <List>
            {tabs.map(el => (
                <Link href={el.link} key={el.text}>
                    <ListItem button>
                        <ListItemIcon>
                            {el.icon}
                        </ListItemIcon>
                        <ListItemText primary={el.text} />
                    </ListItem>
                </Link>
            ))}
        </List>
    )
}

export default Tabs;
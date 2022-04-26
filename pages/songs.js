import fs from 'fs';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import TextField from '@mui/material/TextField';

const Songs = (props) => {
    const [songs, setSongs] = useState(props.data);
    const [songsToRender, setSongsToRender] = useState(props.data);

    const onChange = (e) => {
        if(!e.target.value) {
            setSongsToRender(songs);
        }
        else {
            setSongsToRender(songs.filter(el => el.idLabel.toLowerCase().includes(e.target.value)));
        }
    }

    return (
        <Box>
            <h1>Songs</h1>
            <h3>Filter</h3>
            <TextField onChange={onChange} />
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        {songsToRender.map(el => (
                            <TableRow>
                                <TableCell>
                                    {el.idLabel}
                                </TableCell>
                                <TableCell>
                                    <a href={el.audioUrl}>Audio</a>
                                </TableCell>
                                <TableCell>
                                    <a href={el.chartUrl}>Chart</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    )
}

export async function getServerSideProps(context) {
    const data = JSON.parse((await fs.promises.readFile('src/parsed.json')).toString());

    return {
        props: {
            data: data
        }
    }
}

export default Songs;
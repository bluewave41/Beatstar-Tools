import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import DataPanel from 'components/DataPanel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

const Encrypt = (props) => {
    const [info, setInfo] = useState({
        title: '',
        artist: '',
        id: 0,
        difficulty: 1
    });
    const [chart, setChart] = useState(null);
    const [artwork, setArtwork] = useState(null);
    const [audio, setAudio] = useState(null);
    const [message, setMessage] = useState([]);
    const [perfectSizes, setPerfectSizes] = useState([]);
    const [speeds, setSpeeds] = useState([]);

    const addDataField = (e) => {
		let value = e.target.value;
		if(Number.isInteger(parseInt(value))) {
			value = parseInt(value);
		}
		setInfo(prev => ({ ...prev, [e.target.name]: value }));
    }
    
    const onFileSelect = async (e) => {
        switch(e.target.name) {
            case 'chart':
                const samplePerfectSizes = [1, 0.8999999761581421, 0.800000011920929, 0.699999988079071, 0.6000000238418579, 0.5];
                const sampleSpeeds = [0.800000011920929, 0.699999988079071, 0.6000000238418579, 0.550000011920929, 0.5, 0.5];
                let perfectSizes = [];
                let speeds = [];

                const data = new FormData();
                data.append('chart', e.target.files[0]);
        
                const config = {
                    method: 'POST',
                    url: '/api/getSections',
                    data: data,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
        
                let response;
        
                try {
                    response = await axios(config);
                }
                catch(e) {
                    setMessage([e.response.data]);
                }

                //add a section at 0 if there isn't any
                if(!response.data[0].offset == 0) {
                    response.data.unshift({ offset: 0 });
                }

                for(var x=0;x<response.data.length;x++) {
                    let section = response.data[x];
                    perfectSizes.push({ offset: section.offset, multiplier: samplePerfectSizes[x]});
                    speeds.push({ offset: section.offset, multiplier: sampleSpeeds[x] });
                }

				setPerfectSizes(perfectSizes);
                setSpeeds(speeds);
                setChart(e.target.files[0]);
                break;
            case 'artwork':
                setArtwork(e.target.files[0]);
                break;
            case 'audio':
                setAudio(e.target.files[0]);
                break;
        } 
    }

    const onSubmit = async (e) => {
        let errors = [];
        const data = new FormData();
        const finalPerfects = perfectSizes.slice(0).sort((a, b) => a.offset - b.offset);
        const finalSpeeds = speeds.slice(0).sort((a, b) => a.offset - b.offset);

        for(var x=0;x<finalPerfects.length;x++) {
            if(!finalPerfects[x].multiplier) {
                errors.push("You have empty multipliers in perfect sizes.");
            }
        }

        for(var x=0;x<finalSpeeds.length;x++) {
            if(!finalSpeeds[x].multiplier) {
                errors.push("You have empty multipliers in speeds.");
            }
        }

        if(finalPerfects.filter(el => el.offset == 0).length != 1) {
            errors.push('You have too many 0 offsets in your perfect sizes.');
        }
        if(finalSpeeds.filter(el => el.offset == 0).length != 1) {
            errors.push('You have too many 0 offsets in your speeds.');
        }

        if(errors.length) {
            setMessage(errors);
            return;
        }

        data.append('chart', chart);
        data.append('audio', audio);
        data.append('artwork', artwork);
        data.append('info', JSON.stringify(info));
        data.append('data', JSON.stringify({ perfectSizes: finalPerfects, speeds: finalSpeeds }));

        const config = {
			method: 'POST',
			url: '/api/encrypt',
			data: data,
			headers: {
				'Content-Type': 'multipart/form-data',
            },
            responseType: 'arraybuffer'
		}

        let response;

        try {
            response = await axios(config);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'song.zip');
            document.body.appendChild(link);
            link.click();
        }
        catch(e) {
            console.log(Buffer.from(e.response.data).toJSON());
            setMessage(Buffer.from(e.response.data).toJSON());
        }
    }

    const onBoxChange = (id, name, value) => {
        let split = name.split('-');
        let copy = split[0] == 'perfect' ? perfectSizes.slice(0) : speeds.slice(0);
        copy[id][split[1]] = value;
        if(split[0] == 'perfect') {
            setPerfectSizes(copy);
        }
        else if(split[0] == 'speed') {
            setSpeeds(copy);
        }
    }

    const onRemoveBox = (id, name) => {
        let split = name.split('-');
        let copy = split[0] == 'perfect' ? perfectSizes.slice(0) : speeds.slice(0);
        copy.splice(id, 1);
        if(split[0] == 'perfect') {
            setPerfectSizes(copy);
        }
        else if(split[0] == 'speed') {
            setSpeeds(copy);
        }
    }

    const onAddRow = (name) => {
        let copy = name == 'perfect' ? perfectSizes.slice(0) : speeds.slice(0);
        copy.push({ offset: 0, multipier: 0 });
        if(name == 'perfect') {
            setPerfectSizes(copy);
        }
        else if(name == 'speed') {
            setSpeeds(copy);
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', justifyContent: 'space-between', gap: '10px' }}>
            <h1>Encrypt</h1>
            <TextField label="Title" name="title" onChange={addDataField} />
            <TextField label="Artist" name="artist" onChange={addDataField} />
            <TextField label="ID" type="number" name="id" onChange={addDataField} />

            <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                    value={info.difficulty}
                    label="Difficulty"
                    onChange={addDataField}
                    name='difficulty'
                >
                    <MenuItem value={4}>Normal</MenuItem>
                    <MenuItem value={3}>Hard</MenuItem>
                    <MenuItem value={1}>Extreme</MenuItem>
                </Select>
            </FormControl>

            
            <label>Chart:</label><input type="file" onChange={onFileSelect} accept='.chart' name='chart'></input>
            <label>Artwork:</label><input type="file" onChange={onFileSelect} accept='.png' name='artwork'></input>
            <label>Audio:</label><input type="file" onChange={onFileSelect} accept='.wem' name='audio'></input>
            <DataPanel perfectSizes={perfectSizes} speeds={speeds} onChange={onBoxChange} onRemove={onRemoveBox} onAddRow={onAddRow} />

            <Button variant='contained' onClick={onSubmit}>Convert</Button>

            <Box sx={{ color: 'red' }}>{message.map(el => (
                <Box key={el}>
                    {el}
                </Box>
            ))}</Box>
        </Box>
    )
}

export default Encrypt;
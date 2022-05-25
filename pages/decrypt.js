import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';

const Decrypt = (props) => {
    const [chart, setChart] = useState([]);
    const [message, setMessage] = useState('');

    const onChange = (e) => {
		let copy = [...chart];
		for(const c of e.target.files) {
			copy.push(c);
		}
        setChart(copy);
    }

    const onSubmit = async (e) => {
        const data = new FormData();
		for(const c of chart) {
			data.append('chart', c);
		}

        const config = {
			method: 'POST',
			url: '/api/decrypt',
			data: data,
			responseType: 'arraybuffer',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}

        let response;
        try {
            response = await axios(config);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'chart.zip');
            document.body.appendChild(link);
            link.click();
        }
        catch(e) {
            setMessage(e.response.data);
        }
    }

    return (
        <Box>
            <h1>Decrypt</h1>
            <input
                type="file"
                accept=".bytes"
				multiple
                onChange={onChange}
            ></input>
            <Button variant='contained' onClick={onSubmit}>Submit</Button>
            <Box sx={{ color: 'red'}}>
                {message}
            </Box>
        </Box>
    )
}

export default Decrypt;
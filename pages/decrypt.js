import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';

const Decrypt = (props) => {
    const [chart, setChart] = useState(null);
    const [message, setMessage] = useState('');

    const onChange = (e) => {
        setChart(e.target.files[0]);
    }

    const onSubmit = async (e) => {
        const data = new FormData();
        data.append('chart', chart);

        const config = {
			method: 'POST',
			url: '/api/decrypt',
			data: data,
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
            link.setAttribute('download', 'chart.chart');
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
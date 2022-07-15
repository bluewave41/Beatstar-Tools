import Box from '@mui/material/Box';
import { useState } from 'react';

const TextByte = (props) => {
    const [inside, setInside] = useState(false);

    const onMouseEnter = () => {
        setInside(true);
    }
    const onMouseLeave = () => {
        setInside(false);
    }

    return (
        <span
            style={{
                display: 'inline-block',
                paddingTop: '5px',
                paddingBottom: '5px',
                backgroundColor: inside ? '#333' : 'transparent'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {props.byte}
        </span>
    )
}

const TextPanel = (props) => {
    return (
        <Box
            sx={{
                fontFamily: 'Source Code Pro',
                display: 'flex',
                flexDirection: 'column',
                whiteSpace: 'pre'
            }}
        >
            {props.hex.map((el, index) => (
                <Box
                    sx={{
                        flex: '1'
                    }}
                    key={index}
                >
                    {el.map(el => {
                        const val = parseInt(el.val, 16);
                        const char = val < 31 ? '.' : String.fromCharCode(val);

                        return <TextByte key={el.id} byte={char} />
                    })}
                </Box>
            ))}
        </Box>
    )
}

export default TextPanel;
import Box from '@mui/material/Box';
import { useState, useCallback, memo } from 'react';

const HexByte = memo(function HexByte(props) {
    const [clicked, setClicked] = useState(false);

    const onMouseEnter = () => {
        props.onHover(props.index);
        //setInside(true);
    }
    const onMouseLeave = () => {
        //setInside(false);
    }
    const onClick = () => {
        //setClicked(true);
    }

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '5px',
                backgroundColor: clicked ? '#555' : props.hoverIndex == props.index ? '#777' : 'transparent',
                color: 'darkblue'
            }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {props.byte}
        </span>
    )
}, (prevProps, nextProps) => nextProps.hoverIndex != nextProps.index);

const HexPanel = (props) => {
    const onHover = useCallback((id) => {
        props.onHover(id);
    })
    return (
        <Box
            sx={{
                fontFamily: 'Source Code Pro',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {props.hex.map((el, index) => (
                <Box key={index}>
                    {el.map(el => (
                        <HexByte key={el.id} byte={el.val} onHover={onHover} hoverIndex={props.hoverIndex} index={el.id} />
                    ))}
                </Box>
            ))}
        </Box>
    )
}

export default HexPanel;
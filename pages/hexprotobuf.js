import { useState } from 'react';
import ProtobufReader from 'lib/ProtobufReader';
import Box from '@mui/material/Box';
import { chunk } from 'lib/Utilities';
import HexPanel from 'components/HexPanel';
import TextPanel from 'components/TextPanel';

const Column = (props) => {
    return (
        <Box
            sx={{
                flex: props.width
            }}
        >
            {props.children}
        </Box>
    )
}

const hexprotobuf = (props) => {
    const [file, setFile] = useState(null);
    const [hex, setHex] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(0);

    const onChange = (e) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const buffer = new Buffer(event.target.result);
            const protoBuf = new ProtobufReader(buffer);
            const hex = chunk(chunk(Buffer.from(buffer).toString('hex').toUpperCase(), 2).map(function(el, index) {
                return {
                    id: index,
                    val: el
                }
            }), 16);

            setHex(hex);
            protoBuf.process();

            setFile(protoBuf);
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }

    const onHover = (id) => {
        setHoverIndex(id);
    }

    if (!file) {
        return (
            <input type="file" onChange={onChange} />
        )
    }
    else {
        return (
            <Box
                sx={{
                    display: 'flex'
                }}
            >
                <Column width='40%'>
                    Hello Box
                </Column>
                <Column width='60%'>
                    <Box
                        sx={{
                            display: 'flex',
                            height: '90vh',
                            overflow: 'auto',
                        }}
                    >
                        <HexPanel hex={hex} onHover={onHover} hoverIndex={hoverIndex} />
                        <TextPanel hex={hex} onHover={onHover} />
                    </Box>
                </Column>
            </Box>

        )
    }
}

export default hexprotobuf;
import Image from 'next/image';
import Box from '@mui/material/Box';

const Medal = (props) => {
    const path = `/medals/${props.type}/${props.icon}.png`;

    return (
		<Box sx={{
			position: "relative",
			width: "64px",
			height: "64px",
			display: "inline-block"
		}}>
			<Image src={path} width="64" height="64" alt="medal" />
			<Box sx={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)"
			}}>
				<b>{props.text}</b>
			</Box>
		</Box>
    )
}

export default Medal;
import Box from '@mui/material/Box';

const Help = (props) => {
    return (
        <Box>
            <h1>Help</h1>
            <h3>Converting an audio bundle to OGG</h3>
            <p>Required tools:</p>
            <ul>
                <li>
                    <a href="https://github.com/hpxro7/wwiseutil/releases">wwiseutil</a>
                </li>
                <li>
                    <a href="https://github.com/Perfare/AssetStudio/releases/tag/v0.16.40">Asset Studio</a>
                </li>
                <li>
                    <a href="https://github.com/hcs64/ww2ogg/releases/tag/0.24">ww2ogg</a>
                </li>
            </ul>
            <ol>
                <li>Open Asset Studio and drag your bundle file inside it. Open the Asset List tab and right click and export the audio file.</li>
                <li>Rename the exported file so the extension is .bnk instead of .bytes</li>
                <li>Open wwiseutil-gui and file>open your .bnk file</li>
                <li>Click Export WEMs and save them somewhere</li>
                <li>Open your ww2ogg folder and run the following command. "ww2ogg (wem file) --pcb packed_codebooks_aoTuV_603.bin"</li>
                <li>This will output a new file with an OGG extension.</li>
            </ol>
            <h3>Converting a chart to Moonscraper</h3>
            <p>Required tools:</p>
            <ul>
                <li>
                <a href="https://github.com/Perfare/AssetStudio/releases/tag/v0.16.40">Asset Studio</a>
                </li>
            </ul>
            <ol>
                <li>Open Asset Studio and drag your bundle file inside it. Open the Asset List tab and right click and export the chart file.</li>
                <li>Go to the decrypt tab and upload the exported .bytes file</li>
                <li>Open the saved .chart file with Moonscraper.</li>
            </ol>
        </Box>
    )
}

export default Help;
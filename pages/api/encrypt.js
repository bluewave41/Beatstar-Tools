import Chart from 'lib/Chart';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsp } from 'fs';
import Utilities from 'lib/Utilities';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import formidable from 'formidable';
const execFile = require('child_process').execFile;


const getFiles = (req) => {
	const form = formidable({ 
		uploadDir: './public/uploads',
		multiples: true,
		filename: function(name) {
			return Date.now() + '_' + name;
		}
	});
	
	return new Promise(function(resolve, reject) {
		form.parse(req, (err, field, files) => {
			resolve({ ...field, ...files });
		})
	})
}

export default async function(req, res) {
	const files = await getFiles(req);
    const info = JSON.parse(files.info);
    const data = JSON.parse(files.data);
    const chart = new Chart(info.difficulty);
	
	const art = (await fsp.readFile(files.artwork.filepath)).slice(0, 8);
	if(Buffer.compare(art, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return res.status(500).json([{ error: "Your image is not a PNG."}]);
	}
    
    try {
        await chart.read(files.chart.filepath, files.chart.originalFilename);
        if (chart.errors.length) {
            return res.status(500).json(JSON.stringify(chart.errors));
        }
    }
    catch (e) {
        return res.status(500).send(e.message);
    }

    const resolution = chart.data.songData.Resolution;
    info.bpm = chart.data.syncData.bpms[0].bpm;
    info.sections = chart.getSections().length;
    info.maxScore = chart.getMaxScore();
    chart.setPerfectSizes(data.perfectSizes);
    chart.setSpeeds(data.speeds);

    const header = chart.getHeaderBuffer();
    const noteBuffer = chart.getNoteBuffer(resolution);
    const sectionBuffer = chart.getSectionBuffer(resolution);
    const perfectSizeBuffer = chart.getMetadataBuffer('perfects', resolution);
    const speedsBuffer = chart.getMetadataBuffer('speeds', resolution);

    const circlesBuffer = Buffer.from([0x0c, 0x0b, 0x0d, 0x00, 0x00, 0x00, 0x41, 0x20, 0x05, 0x20, 0x03, 0x20, 0x1f]);

    const finalBuffer = Buffer.concat([header, noteBuffer, sectionBuffer, perfectSizeBuffer, speedsBuffer, circlesBuffer]);
    const uuid = uuidv4();

    //create file system
    try {
        await createFileSystem(uuid, finalBuffer, files, info);
        await createBundles(uuid);
    }
    catch(e) {
        console.log(e.message);
    }
    
    await zipFiles(uuid);

    const filePath = path.join(process.cwd(), `/${uuid}/song.zip`);
    const fileBuffer = fs.createReadStream(filePath);

    await new Promise(function (resolve) {
        fileBuffer.pipe(res);
        fileBuffer.on('end', function () {
            fs.rm(uuid, { recursive: true, force: true }, async function (e) {
                await fsp.unlink(files.chart.filepath);
                await fsp.unlink(files.audio.filepath);
                await fsp.unlink(files.artwork.filepath);
                resolve();
            })
        });
    })
}

async function createFileSystem(uuid, finalBuffer, files, info) {
    await fsp.mkdir(uuid);
    await fsp.mkdir(uuid + '/chart');
    await fsp.mkdir(uuid + '/artwork');
    await fsp.mkdir(uuid + '/audio');
    await fsp.mkdir(uuid + '/audio/bnk');
    await fsp.mkdir(uuid + '/audio/edited');

    await fsp.writeFile(uuid + '/chart/508', finalBuffer);
    await fsp.copyFile(files.artwork.filepath, uuid + '/artwork/FooFighter_Everlong.png');
    await fsp.copyFile(files.audio.filepath, uuid + '/audio/bnk/1.wem');
    await fsp.writeFile(uuid + '/info.json', JSON.stringify(info));
}

async function createBundles(uuid) {
    const commands = [
        {
            command: 'tools/bnk/wwiseutil.exe',
            parameters: ['-f', 'everlong/audio.bnk', '-r', '-t', uuid + '/audio/bnk', '-o', uuid + '/audio/edited/TST00026'],
            container: '',
            type: 'bnk'
        },
        {
            command: 'tools/replacer/UnityAssetReplacer.exe',
            parameters: ['-b', 'everlong/chart.bundle', '-i', uuid + '/chart', '-m', 'm_Script', '-o', uuid + '/chart/chart.bundle'],
            container: /0207725071a623d62e45b4a33e9c7b85/g,
            type: 'chart'
        },

        {
            command: 'tools/replacer/UnityAssetReplacer.exe',
            parameters: ['-b', 'everlong/artwork.bundle', '-i', uuid + '/artwork', '-t', '-o', uuid + '/artwork/artwork.bundle'],
            container: /a317cdbf067bab183d6dd12d870c1303/g,
            type: 'artwork'
        },

        {
            command: 'tools/replacer/UnityAssetReplacer.exe',
            parameters: ['-b', 'everlong/audio.bundle', '-i', uuid + '/audio/edited', '-m', 'm_Script', '-o', uuid + '/audio/audio.bundle'],
            container: /f742e8322104e675c6e8a37ba2cebb96/g,
            type: 'audio'
        },
    ]

    for (var x = 0; x < commands.length; x++) {
        let c = commands[x];
        await runCommand(uuid, c.command, c.parameters, c.container, c.type);
    }
}

function runCommand(uuid, command, parameters, container, type) {
    let newContainerName = Utilities.rnd(32);
    return new Promise(async function (resolve) {
        execFile(command, parameters, async function (a1, a2, a3) {
            console.log(a1, a2, a3);
            
            if(type != 'bnk') {
                let data = (await fsp.readFile(uuid + `/${type}/${type}.bundle`)).toString('binary');
                data = data.replace(container, newContainerName);
                await fsp.writeFile(uuid + `/${type}/${type}.bundle`, data, 'binary');
            }

            resolve();
        })
    })
}

function zipFiles(uuid) {
	var output = fs.createWriteStream(uuid + '/song.zip');
	var archive = archiver('zip');
	
	return new Promise(function(resolve) {
		archive.pipe(output);
		archive.file(uuid + '/chart/chart.bundle', { name: 'chart.bundle' });
		archive.file(uuid + '/artwork/artwork.bundle', { name: 'artwork.bundle' });
		archive.file(uuid + '/audio/audio.bundle', { name: 'audio.bundle' });
		archive.file(uuid + '/info.json', { name: 'info.json' });
		archive.finalize();
		
		output.on('close', function() {
			resolve();
		})
	})
}

export const config = {
    api: {
        bodyParser: false,
    },
};
import Chart from 'lib/Chart';
import multer from 'multer';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsp } from 'fs';
import Utilities from 'lib/Utilities';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
const execFile = require('child_process').execFile;

const upload = multer({
    storage: multer.diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
    }),
});

const apiRoute = nextConnect({
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
    onError(err, req, res, next) {
        console.log(err);
        res.status(500).end(err.message);
    }
});

const uploadMiddleware = upload.fields([
    { name: 'chart', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'artwork', maxCount: 1 },
    { name: 'info', maxCount: 1 },
    { name: 'data', maxCount: 1 },
]);

apiRoute.use(uploadMiddleware);

apiRoute.post(async (req, res) => {
    const info = JSON.parse(req.body.info);
    const data = JSON.parse(req.body.data);
    const chart = new Chart(info.difficulty);
	
	const art = (await fsp.readFile(req.files.artwork[0].path)).slice(0, 8);
	if(Buffer.compare(art, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return res.status(500).json([{ error: "Your image is not a PNG."}]);
	}
    
    try {
        await chart.read(req.files.chart[0].path);
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
        await createFileSystem(uuid, finalBuffer, req, info);
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
            /*fs.rm(uuid, { recursive: true, force: true }, async function (e) {
                await fsp.unlink(req.files.chart[0].path);
                await fsp.unlink(req.files.audio[0].path);
                await fsp.unlink(req.files.artwork[0].path);
                resolve();
            })*/
        });
    })
})

async function createFileSystem(uuid, finalBuffer, req, info) {
    await fsp.mkdir(uuid);
    await fsp.mkdir(uuid + '/chart');
    await fsp.mkdir(uuid + '/artwork');
    await fsp.mkdir(uuid + '/audio');
    await fsp.mkdir(uuid + '/audio/bnk');
    await fsp.mkdir(uuid + '/audio/edited');

    await fsp.writeFile(uuid + '/chart/508', finalBuffer);
    await fsp.copyFile(req.files.artwork[0].path, uuid + '/artwork/FooFighter_Everlong.png');
    await fsp.copyFile(req.files.audio[0].path, uuid + '/audio/bnk/1.wem');
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

export default apiRoute;

export const config = {
    api: {
        bodyParser: false,
    },
};
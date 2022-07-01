import Chart from 'lib/Chart';
import multer from 'multer';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsp } from 'fs';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';

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
	{ name: 'chart', maxCount: 1000 },
]);

apiRoute.use(uploadMiddleware);

apiRoute.post(async (req, res) => {
	let files = [];
	const uuid = uuidv4();
	console.log(req.files.chart);
	
	for(var x=0;x<req.files.chart.length;x++) {
		try {
			let file = req.files.chart[x].path;
			const chart = new Chart();
			await chart.read(req.files.chart[x].path, req.files.chart[x].path);
			files.push({ data: await chart.getString(), name: req.files.chart[x].originalname.replace('bytes', 'chart') });
		}
		catch(e) {
			res.status(500).send(e.message);
		}
	}
	
	await fsp.mkdir(uuid);
	await fsp.mkdir(uuid + '/charts');
	var output = fs.createWriteStream(uuid + '/charts.zip');
	var archive = archiver('zip');
		
	for(const c of files) {
		console.log(uuid, c.name);
		try {
			await fsp.writeFile(uuid + `/charts/${c.name}`, c.data);
		}
		catch(e) {
			console.log('ERROR', e);
		}
	}
	
	archive.pipe(output);
	archive.directory(uuid + '/charts');
	await archive.finalize();
		
	output.on('close', function() {
		console.log('close');
		const filePath = path.join(process.cwd(), `/${uuid}/charts.zip`);
		const fileBuffer = fs.createReadStream(filePath);
		fileBuffer.pipe(res);
		fileBuffer.on('end', function () {
            fs.rm(uuid, { recursive: true, force: true }, async function (e) {
				for(const c of req.files.chart) {
					await fsp.unlink(c.path);
				}
            })
        });
	})
})

export default apiRoute;

export const config = {
	api: {
		bodyParser: false,
	},
};
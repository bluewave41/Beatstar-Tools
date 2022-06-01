import Chart from 'lib/Chart';
import multer from 'multer';
import nextConnect from 'next-connect';

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
]);

apiRoute.use(uploadMiddleware);

apiRoute.post(async (req, res) => {
    const chart = new Chart();
    try {
        await chart.read(req.files.chart[0].path);
		if(chart.errors) {
			res.status(500).send(chart.errors[0]);
			return;
		}
        res.status(200).send(JSON.stringify(chart.getSections()));
    }
    catch(e) {
        console.log(e.stack);
        res.status(500).send(e.message);
    }
})

export default apiRoute;

export const config = {
	api: {
		bodyParser: false,
	},
};
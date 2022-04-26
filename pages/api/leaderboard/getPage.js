import UserRepository from 'repositories/UserRepository';

export default async function getPage(req, res) {
    const { page } = req.body;
    if(!page) {
        return res.status(500).json({ success: false, message: 'Missing page parameter.' });
    }

    const data = await UserRepository.getPage(page);

    res.json(data);
    res.end();
}
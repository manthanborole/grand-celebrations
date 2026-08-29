export default function handler(req, res) {
    if (req.method === 'POST') {
        if (req.body.password === process.env.ADMIN_PASSWORD) {
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    return res.status(405).end('Method Not Allowed');
}
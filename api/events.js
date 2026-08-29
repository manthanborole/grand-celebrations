import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
    });
    
    await client.connect();

    try {
        if (req.method === 'GET') {
            const result = await client.query('SELECT * FROM events ORDER BY event_date ASC;');
            return res.status(200).json(result.rows);
        } 
        if (req.method === 'POST') {
            const { hostName, contactNumber, venueChoice, eventDate, timeSlot } = req.body;
            await client.query(
                'INSERT INTO events (host_name, contact_number, venue_choice, event_date, time_slot) VALUES ($1, $2, $3, $4, $5);',
                [hostName, contactNumber, venueChoice, eventDate, timeSlot]
            );
            return res.status(201).json({ message: 'Event added' });
        }
        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (id === 'ALL') {
                await client.query('DELETE FROM events;');
            } else {
                await client.query('DELETE FROM events WHERE id = $1;', [id]);
            }
            return res.status(200).json({ message: 'Deleted' });
        }
        return res.status(405).end('Method Not Allowed');
    } finally {
        await client.end();
    }
}

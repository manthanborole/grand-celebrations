import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
    // Explicitly tell it to use the POSTGRES_URL variable
    const client = createClient({ connectionString: process.env.POSTGRES_URL });
    await client.connect();

    try {
        if (req.method === 'GET') {
            const { rows } = await client.sql`SELECT * FROM events ORDER BY event_date ASC;`;
            return res.status(200).json(rows);
        } 
        if (req.method === 'POST') {
            const { hostName, contactNumber, venueChoice, eventDate, timeSlot } = req.body;
            await client.sql`INSERT INTO events (host_name, contact_number, venue_choice, event_date, time_slot) 
                      VALUES (${hostName}, ${contactNumber}, ${venueChoice}, ${eventDate}, ${timeSlot});`;
            return res.status(201).json({ message: 'Event added' });
        }
        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (id === 'ALL') {
                await client.sql`DELETE FROM events;`;
            } else {
                await client.sql`DELETE FROM events WHERE id = ${id};`;
            }
            return res.status(200).json({ message: 'Deleted' });
        }
        return res.status(405).end('Method Not Allowed');
    } finally {
        await client.end();
    }
}

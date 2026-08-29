// api/events.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { rows } = await sql`SELECT * FROM events ORDER BY event_date ASC;`;
        return res.status(200).json(rows);
    } 
    if (req.method === 'POST') {
        const { hostName, contactNumber, venueChoice, eventDate, timeSlot } = req.body;
        await sql`INSERT INTO events (host_name, contact_number, venue_choice, event_date, time_slot) 
                  VALUES (${hostName}, ${contactNumber}, ${venueChoice}, ${eventDate}, ${timeSlot});`;
        return res.status(201).json({ message: 'Event added' });
    }
    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (id === 'ALL') {
            await sql`DELETE FROM events;`;
        } else {
            await sql`DELETE FROM events WHERE id = ${id};`;
        }
        return res.status(200).json({ message: 'Deleted' });
    }
    return res.status(405).end('Method Not Allowed');
}

import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();

    try {
        // 1. PUBLIC: Anyone can view the calendar
        if (req.method === 'GET') {
            const result = await client.query('SELECT * FROM events ORDER BY event_date ASC;');
            return res.status(200).json(result.rows);
        } 
        
        // 2. SECURITY GUARD: Block unauthorized actions
        const token = req.headers.authorization;
        if (token !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Unauthorized! Nice try, hacker.' });
        }

        // 3. SECURE: Add Event
        if (req.method === 'POST') {
            const { hostName, contactNumber, venueChoice, eventDate, timeSlot } = req.body;
            
            const check = await client.query(
                'SELECT * FROM events WHERE venue_choice = $1 AND event_date = $2 AND time_slot = $3',
                [venueChoice, eventDate, timeSlot]
            );
            if (check.rows.length > 0) return res.status(409).json({ message: 'Slot booked!' });

            await client.query(
                'INSERT INTO events (host_name, contact_number, venue_choice, event_date, time_slot) VALUES ($1, $2, $3, $4, $5);',
                [hostName, contactNumber, venueChoice, eventDate, timeSlot]
            );
            return res.status(201).json({ message: 'Event added' });
        }
        
        // 4. SECURE: Delete Event
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

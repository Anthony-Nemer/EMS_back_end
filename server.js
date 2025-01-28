const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;
const cors = require('cors');
const bcrypt = require('bcrypt');


app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: 'nemeranthony2004@',      
  database: 'ems_db' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



app.get('/initial/login/:email', (req, res) => {
    const email = req.params.email;
    var query = `
        SELECT 
        (EXISTS (
            SELECT 1 
            FROM users 
            WHERE email = ?
        )) AS email_exists
    `;
    db.query(query, [email], (err, result) => {
        if (err) res.send(err);
        else res.send(result[0]);
    })
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const userQuery = `SELECT * FROM users WHERE email = ?`;

    db.query(userQuery, [email], async (err, result) => {
        if (err) {
            console.error('Database error:', err); 
            return res.status(500).send({ message: 'Database error' });
        }

        if (result.length === 0) {
            console.log('No user found for email:', email); 
            return res.status(401).send({ message: 'Invalid email' });
        } else {
            const user = result[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing password:', err);
                    return res.status(500).send({ message: 'Password comparison error' });
                }

                if (isMatch) {
                    const userInfo = {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullname,
                        mobileNumber: user.mobilenumber,
                        isSupplier: user.isSupplier,
                        isHost: user.ishost,
                    };
                    
                    // console.log(userInfo);

                    return res.send({
                        message: 'Login successful',
                        userInfo,
                        id: user.id,
                        fullName: user.fullname,
                        email: user.email,
                        mobileNumber: user.mobilenumber,
                        isSupplier: user.isSupplier,
                        isHost: user.isHost,
                    });
                } else {
                    console.log('Incorrect password for email:', email);
                    return res.status(401).send({ message: 'Invalid email or password' });
                }
            });
        }
    });
});






app.post('/register', async (req, res) => {
    const { fullName, email, password, mobile, role, service, employeePin } = req.body;

    const userQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(userQuery, [email], async (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            return res.status(401).send({ message: 'Email Already Exists' });
        }

        let isHost = 0;
        let isSupplier = 0;
        let finalService = service;
        let finalEmployeePin = employeePin;
        if (role === 'supplier') isSupplier = 1, finalEmployeePin = null;
        if (role === 'host') isHost = 1, finalService = null;;

        bcrypt.hash(password, 12, (err, hashedPassword) => {
            if (err) return res.status(500).send(err);

            const query = `INSERT INTO users (fullname, email, mobilenumber, password, isSupplier, ishost, ratings, serviceId, employee_pin) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

            db.query(query, [fullName, email, mobile, hashedPassword, isSupplier, isHost, null, service, employeePin], (err, results) => {
                if (err) return res.status(500).send(err);

                const userInfo = { fullName, email, mobile, isSupplier, isHost, finalService, finalEmployeePin };
                return res.status(200).send({ message: 'Register successful', userInfo });
            });
        });
    });
});


app.get('/fetch-cuisines', (req, res) => {
    var query = `SELECT * FROM cuisines`;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error("Error fetching cuisines:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.status(200).json(results); 
        }
    });
});



app.get('/fetch-venues', (req, res) => {
    const query = `SELECT id, name, capacity, price FROM venue WHERE isAvailable = '1'`;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error("Error fetching venues:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.status(200).json(results); 
        }
    });
});

app.get('/fetch-services', (req, res) => {
    const query = `SELECT * FROM services`;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error("Error fetching services:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.status(200).json(results); 
        }
    });
});



app.post('/book-event', async (req, res) => {
    const {
        user_id, 
        event_title,
        event_date,
        duration,
        venue_id,
        attendance_number,
        persons_per_table,
        number_of_tables,
        cuisine_id,
        selectedServices
    } = req.body;

    console.log("Received data:", req.body);

    const eventQuery = `INSERT INTO events
    (user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id, status) 
    // VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(eventQuery, [user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id, 'Pending Approval'], (err, results) => {
        if (err) {
            console.error("Error booking event:", err);
            return res.status(500).send({ error: "Database query failed." });
        }

        const newEventId = results.insertId; 

        if (selectedServices && selectedServices.length > 0) {
            const serviceQuery = 'INSERT INTO eventservices (event_id, service_id) VALUES ?';
            const servicesData = selectedServices.map(service => [newEventId, service]);

            db.query(serviceQuery, [servicesData], (err, serviceResults) => {
                if (err) {
                    console.error("Error saving services:", err);
                    return res.status(500).send({ error: "Service insertion failed." });
                }

                res.status(200).send({ message: "Event booked successfully with services!" });
            });
        } else {
            res.status(200).send({ message: "Event booked successfully without services!" });
        }
    });
});



app.post('/feedback', async (req, res) => {
    const { user_id, feedback, rating, services, suggestions } = req.body;


    if (!user_id || !feedback || !rating || !services) {
        return res.status(400).send({ error: "All fields are required." });
    }

    const query = 'INSERT INTO feedback (user_id, feedback, rating, services, suggestions) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [user_id, feedback, rating, services, suggestions], (err, results) => {
        if (err) {
            console.error("Error inserting feedback:", err);
            return res.status(500).send({ error: "Database query failed." });
        }
        res.status(200).send({ message: "Feedback submitted successfully!" });
    });
});



app.get('/get-events', (req, res) => {
    const userId = req.query.userId;

    const query = `
        SELECT 
            e.event_id,
            e.event_title,
            e.event_date,
            e.status,
            e.duration,
            e.venue_id,
            v.name AS venue_name,
            e.attendance_number,
            e.persons_per_table,
            e.number_of_tables,
            e.cuisine_id,
            c.cuisine AS cuisine_name
        FROM 
            events AS e
        JOIN 
            venue AS v ON v.id = e.venue_id
        JOIN 
            cuisines AS c ON c.id = e.cuisine_id
        WHERE 
            e.user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching events data:', err);
            return res.status(500).send({ error: "Database query failed" });
        }
        res.status(200).json(results);
    });
});



app.get('/fetch-payment', async (req, res) => {
    const { id } = req.query; 

    if (!id) {
        return res.status(400).send({ error: "Event ID is required." });
    }

    try {
        const query = `
            SELECT 
                e.event_id,
                v.name AS venue_name,
                CAST(v.price AS DECIMAL(10, 2)) AS venue_price,
                c.cuisine AS cuisine_name,
                (CAST(c.price AS DECIMAL(10, 2)) * e.attendance_number) AS cuisine_price,
                e.number_of_tables,
                (e.number_of_tables * 20) AS tables_cost,
                s.service_name,
                CAST(s.price AS DECIMAL(10, 2)) AS service_price
            FROM events e
            LEFT JOIN venue v ON e.venue_id = v.id
            LEFT JOIN cuisines c ON e.cuisine_id = c.id
            LEFT JOIN eventservices es ON e.event_id = es.event_id
            LEFT JOIN services s ON es.service_id = s.id
            WHERE e.event_id = ?
        `;

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching event data:", err);
                return res.status(500).send({ error: "Database query failed." });
            }

            if (results.length === 0) {
                return res.status(404).send({ error: "Event not found." });
            }

            const eventDetails = {
                event_id: results[0].event_id,
                venue: {
                    name: results[0].venue_name,
                    price: Number(results[0].venue_price),  
                },
                cuisine: {
                    name: results[0].cuisine_name,
                    price: Number(results[0].cuisine_price),  
                },
                tables: {
                    number: results[0].number_of_tables,
                    cost: Number(results[0].tables_cost), 
                },
                services: [],
                total_cost: 0,
            };

            let servicesCost = 0;

            results.forEach((row) => {
                if (row.service_name) {
                    eventDetails.services.push({
                        name: row.service_name,
                        price: Number(row.service_price),  
                    });
                    servicesCost += Number(row.service_price);  
                }
            });

            eventDetails.total_cost =
                eventDetails.venue.price +
                eventDetails.cuisine.price +
                eventDetails.tables.cost +
                servicesCost;  


            res.status(200).send(eventDetails);
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: "Internal server error." });
    }
});




app.post('/new-payment', (req, res) => {
    const { invoiceData, paymentMethod } = req.body; 
    if (!paymentMethod || !invoiceData) {
        return res.status(400).send({ error: 'Payment method and invoice data are required.' });
    }

    const paymentQuery = `
        INSERT INTO payment (event_id, payment_date, payment_method, amount) 
        VALUES (?, ?, ?, ?)
    `;
    db.query(paymentQuery, [
        invoiceData.event_id, 
        new Date(), 
        paymentMethod, 
        invoiceData.total_cost
    ], (err, result) => {
        if (err) {
            console.error('Error inserting payment into database:', err);
            return res.status(500).send({ error: 'Error processing payment.' });
        }

        const updateStatusQuery = `
            UPDATE events 
            SET status = 'Paid' 
            WHERE event_id = ?
        `;
        db.query(updateStatusQuery, [invoiceData.event_id], (updateErr, updateRes) => {
            if (updateErr) {
                console.error('Error updating event status:', updateErr);
                return res.status(500).send({ error: 'Error updating event status.' });
            }
            res.status(200).send({ message: 'Payment processed successfully, and event status updated.' });
        });
    });
});


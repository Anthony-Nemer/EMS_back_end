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
  password: 'jennyfakir@2004',      
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
    const { fullName, email, password, mobile, role, cuisineId, employeePin } = req.body;

    // console.log("Received Register Request:",req.body);

    const userQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(userQuery, [email], async (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }

        if (result.length > 0) {
            return res.status(401).send({ message: 'Email Already Exists' });
        }

        let isHost = 0;
        let isSupplier = 0;
        let finalCuisineId = cuisineId; // Use cuisineId correctly
        let finalEmployeePin = employeePin;

        if (role === 'supplier') {
            isSupplier = 1;
            finalEmployeePin = null;
        } else if (role === 'host') {
            isHost = 1;
            finalCuisineId = null; // Ensure cuisineId is null for hosts
        }

        bcrypt.hash(password, 12, (err, hashedPassword) => {
            if (err) {
                console.error("Hashing Error:", err);
                return res.status(500).send({ message: "Error hashing password" });
            }

            const query = `INSERT INTO users (fullname, email, mobilenumber, password, isSupplier, ishost, ratings, cuisineId, employee_pin) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

            db.query(query, [fullName, email, mobile, hashedPassword, isSupplier, isHost, null, cuisineId, finalEmployeePin], (err, results) => {
                if (err) {
                    console.error("Insert Error:", err);
                    // console.log("Inserted Cuisine ID:", cuisineId);
                    return res.status(500).send({ message: "Error inserting user into database" });
                }

                return res.status(200).send({ message: 'Register successful', userId: results.insertId });
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
    const query = `SELECT id, name,address, capacity,photo,isAvailable,price FROM venue WHERE isAvailable = '1'`;

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
        services 
    } = req.body;

    // console.log("Received data:", req.body);

    if (!Array.isArray(services)) {
        return res.status(400).send({ error: "Invalid services format. Expected an array." });
    }

    const eventQuery = `INSERT INTO events
    (user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(eventQuery, [user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id, 'Pending Approval'], (err, results) => {
        if (err) {
            console.error("Error booking event:", err);
            return res.status(500).send({ error: "Database query failed." });
        }

        const newEventId = results.insertId; 

        if (services.length > 0) {
            const serviceQuery = 'INSERT INTO eventservices (event_id, service_id) VALUES ?';
            const servicesData = services.map(service => [newEventId, service]);

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
                e.user_id = ?
            ORDER BY 
                CASE 
                    WHEN e.status LIKE '%pending%' THEN 0 
                    ELSE 1
                END,
                e.event_date ASC;  -- Secondary sorting by event_date (optional)
            `;

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


  
app.post('/new-venue', async (req, res) => {
    const { name, address, capacity, photo, isAvailable, price } = req.body;

    console.log("Received data:", req.body);

    
    if (!name || !address || !capacity || !photo || !price) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const query = 'INSERT INTO venue (name, address, capacity, photo, isAvailable, price) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [name, address, capacity, photo, isAvailable ?? true, price], (err, results) => {
        if (err) {
            console.error("Database Insertion Error:", err);
            return res.status(500).json({ error: "Database query failed." });
        }
        res.status(201).json({ message: "Venue added successfully!", id: results.insertId });
    });
});



  
app.post('/new-cuisine', async (req, res) => {
    const { cuisine, price } = req.body;

    console.log("Received data:", req.body);

    const query = 'INSERT INTO cuisines (cuisine,price) VALUES (?, ?)';

    db.query(query, [cuisine,price], (err, results) => {
        if (err) {
            console.error("Database Insertion Error:", err);
            return res.status(500).json({ error: "Database query failed." });
        }
        res.status(201).json({ message: "Cuisine added successfully!", id: results.insertId });
    });
});

app.get('/fetch-events',(req,res)=>{
    const query=`SELECT * 
            FROM events 
            ORDER BY 
            CASE 
                WHEN status LIKE '%pending%' THEN 0  
                ELSE 1  
            END,
            event_date ASC`;

    db.query(query,(err,results)=>{
        if(err){
            console.error("Error fetching events:", err);
            res.status(500).send({error:"Database query failed."});
        }else{
            res.status(200).json(results);
        }
    });
});

app.put('/event-status', async (req, res) => {  
    const { event_id, status } = req.body;

    // console.log('Event id: '+ event_id);
    // console.log('Event status: '+ status);

    if (!['accepted', 'denied'].includes(status)) {
        return res.status(400).send({ error: "Invalid status update." });
    }

    if(status === 'accepted'){
        const query = 'UPDATE events SET status = ? WHERE event_id = ?';
        db.query(query, ['Payment Pending', event_id], (err, result) => {
            if (err) {
                console.error("Error updating event status:", err);
                return res.status(500).send({ error: "Database update failed." });
            }
            res.status(200).send({ message: `Event ${status} successfully! Waiting for payment.` });
        });
    }
    else if(status=== 'denied'){
        const query = 'UPDATE events SET status = ? WHERE event_id = ?';
        db.query(query, ['Rejected', event_id], (err, result) => {
            if (err) {
                console.error("Error updating event status:", err);
                return res.status(500).send({ error: "Database update failed." });
            }
            res.status(200).send({ message: `Event ${status} successfully!` });
        });
    }
});


app.get('/fetch-suppliers', (req, res) => {
    const query = `
        SELECT  u.fullname, u.email, u.mobilenumber, u.serviceId, s.service_name, s.price
        FROM users u
        JOIN services s ON u.serviceId = s.ID
        WHERE u.isSupplier = 1
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching suppliers:", err);
            return res.status(500).send({ error: "Database query failed." });
        }
        res.status(200).json(results);
    });
});

app.post('/restock-request', (req, res) => {
    const { host_id, cuisine_id, items } = req.body;

    const supplierQuery = `SELECT id FROM users WHERE isSupplier = 1 AND cuisineId = ?`;
    db.query(supplierQuery, [cuisine_id], (err, suppliers) => {
        if (err) {
            console.error("Error finding suppliers:", err);
            return res.status(500).send({ error: "Database error" });
        }
        
        if (suppliers.length === 0) {
            return res.status(404).send({ message: "No suppliers available for this cuisine" });
        }

        const restockRequests = suppliers.map(supplier => 
            items.map(item => [host_id, supplier.id, cuisine_id, item.name, item.quantity])
        ).flat();

        const insertQuery = `INSERT INTO restock_requests (host_id, supplier_id, cuisine_id, item_name, quantity) VALUES ?`;

        db.query(insertQuery, [restockRequests], (err, result) => {
            if (err) {
                console.error("Error inserting restock requests:", err);
                return res.status(500).send({ error: "Database error" });
            }
            res.status(200).send({ message: "Restock requests sent successfully!" });
        });
    });
});
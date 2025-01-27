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
      services
    } = req.body;
  
    try {
      await db.promise().beginTransaction();
        const [eventResult] = await db.promise().query(
        `INSERT INTO events (user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, event_title, event_date, duration, venue_id, attendance_number, persons_per_table, number_of_tables, cuisine_id]
      );
  
      const event_id = eventResult.insertId;
  
      const serviceInsertPromises = services.map((service_id) => {
        return db.promise().query(
          `INSERT INTO eventservices (event_id, service_id) VALUES (?, ?)`,
          [event_id, service_id]
        );
      });
        await Promise.all(serviceInsertPromises);
        await db.promise().commit();
  
      res.status(200).json({ message: 'Event booked successfully', event_id });
    } catch (error) {
      await db.promise().rollback();
      console.error("Error booking event:", error);
      res.status(500).json({ error: 'Failed to book event' });
    }
  });


  app.post('/feedback',async(req,res)=>{
    const{
        user_id,
        feedback,
        rating,
        services,
        suggestions
    }=req.body;

    console.log("Received data:".req.body)

    if(!user_id || !feedback || !rating || !services){
        return res.status(400).send({
            error:"All fields are required."
        });
    }

    const query='INSERT INTO feedback (user_id, feedback,rating,services,suggestions) VALUES (?,?,?,?,?)';

    db.query(query, [user_id,feedback,rating,services,suggestions],(err,results)=>{
        if(err){
            console.error("Error inserting feedback:",err);
            return res.status(500).send({error:"Database query failed."});
        }
        res.status(200).send({message:"Feedback submitted successfully!"});
    });
                 
});


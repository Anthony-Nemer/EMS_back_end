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




app.get('/fetch-services', (req, res) =>{
    var query = `SELECT id, service_name FROM services`;

    db.query(query, (err, result)=>{
        if(err) {
            console.log('Error fetching services: '+err);
            res.send(err);
        }
        res.send(result);
    })
})


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

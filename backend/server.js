require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Redis = require('redis');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new  Pool({ connectionString: process.env.DATABASE_URL });

// Redis connection for caching
const redisClient = Redis.createClient({ url: process.env.REDDIS_URL });
redisClient.connect().catch(console.error);

// Test route
app.get('/', (req, res) => {
    res.send('Backend server is running');
});

app.listen(port, () => {
    console.log('Server running on port' +  port );
});
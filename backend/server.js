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

// Import Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Cache key helper
const getCacheKey = (key) => `symptom:${key}`;

// GET all symptoms (cached)
app.get('/symptoms', async (req, res) => {
    const cacheKey = 'all_symptoms';
    let symptoms = await redisClient.get(cacheKey);
    if (symptoms) {
        return res.json(JSON.parse(symptoms));
    }
    try {
        const result = await pool.query('SELECT * FROM symptoms ORDER BY logged_at DESC');
        symptoms = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(symptoms), { EX: 60 });
        res.json(symptoms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single symptom
app.get('/symptoms/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = getCacheKey(id);
    let symptom = await redisClient.get(cacheKey);
    if (symptom) {
        return res.json(JSON.parse(symptom));
    }
    try {
        const result = await pool.query('SELECT * FROM symptoms WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Symptom not found' });
        symptom = result.rows[0];
        await redisClient.set(cacheKey, JSON.stringify(symptom), { EX: 60 });
        res.json(symptom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new symptom
app.post('/symptoms', async (req, res) => {
    const { symptom_type, severity, notes } = req.body;
    try {
        const result = await pool.query('INSERT INTO symptoms (symptom_type, severity, notes) VALUES ($1, $2, $3) RETURNING *', [symptom_type, severity, notes]);
        await redisClient.del('all_symptoms');
        await redisClient.del('symptoms_trends');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update symptom
app.put('/symptoms/:id', async (req, res) => {
    const { id } = req.params;
    const { symptom_type, severity, notes } = req.body;
    try {
        const result = await pool.query('UPDATE symptoms SET symptom_type = $1, severity = $2, notes = $3 WHERE id = $4 RETURNING *', [symptom_type, severity, notes, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Symptom not found' });
        await redisClient.del(getCacheKey(id));
        await redisClient.del('all_symptoms');
        await redisClient.del('symptoms_trends');
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE symptom
app.delete('/symptoms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM symptoms WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Symptom not found' });
        await redisClient.del(getCacheKey(id));
        await redisClient.del('all_symptoms');
        await redisClient.del('symptoms_trends');
        res.json({ message: 'Symptom deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET trends (aggregated severity over time, cached)
app.get('/symptoms/trends', async (req, res) => {
    const cacheKey = 'symptoms_trends';
    let trends = await redisClient.get(cacheKey);
    if (trends) {
        return res.json(JSON.parse(trends));
    }
    try {
        const result = await pool.query(`
            SELECT DATE(logged_at) as date, AVG(severity) as avg_severity
            FROM symptoms
            GROUP BY DATE(logged_at)
            ORDER BY date DESC
        `);
        trends = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(trends), { EX: 60 });
        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET AI insight using Gemini
app.get('/symptoms/insights', async (req, res) => {
    try {
        const result = await pool.query('SELECT severity, symptom_type FROM symptoms ORDER BY logged_at DESC LIMIT 5');
        const recentSymptoms = result.rows.map(r => `Type: ${r.symptom_type}, Severity: ${r.severity}`).join(', ');
        const prompt = `Based on these recent symptoms: ${recentSymptoms}. Provide a short health insight or recommendation.`;
        
        const genResult = await model.generateContent(prompt);
        const insight = genResult.response.text();

        res.json({ insight });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
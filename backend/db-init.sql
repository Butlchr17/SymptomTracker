CREATE TABLE symptoms (
    id SERIAL PRIMARY KEY,
    symptom_type VARCHAR(255) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symptoms_logged_at ON symptoms(logged_at);

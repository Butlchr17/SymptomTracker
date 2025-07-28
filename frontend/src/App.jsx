import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [symptoms, setSymptoms] = useState([]);
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState(1);
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    fetchSymptoms();
    fetchTrends();
    fetchInsights();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/symptoms');
      setSymptoms(res.data);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get('http://localhost:5000/symptoms/trends');
      setTrends(res.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axios.get('http://localhost:5000/symptoms/insights');
      setInsight(res.data.insight);
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/symptoms/${editId}`, { symptom_type: symptomType, severity, notes });
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/symptoms', { symptom_type: symptomType, severity, notes });
      }
      setSymptomType('');
      setSeverity(1);
      setNotes('');
      fetchSymptoms();
      fetchTrends();
      fetchInsights();
    } catch (err) {
      console.error('Error submitting symptom:', err);
    }
  };

  const handleEdit = (symptom) => {
    setSymptomType(symptom.symptom_type);
    setSeverity(symptom.severity);
    setNotes(symptom.notes);
    setEditId(symptom.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/symptoms/${id}`);
      fetchSymptoms();
      fetchTrends();
      fetchInsights();
    } catch (err) {
      console.error('Error deleting symptom:', err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Symptom Logs', 10, 10);
    symptoms.forEach((s, i) => {
      doc.text(`${i+1}. ${s.symptom_type} - Severity: ${s.severity} (${new Date(s.logged_at).toLocaleString()})`, 10, 20 + i*10);
    });
    doc.save('symptoms.pdf');
  };

  const chartData = {
    labels: trends.map(t => t.date),
    datasets: [{ label: 'Avg Severity', data: trends.map(t => t.avg_severity), borderColor: 'blue' }],
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 dark:text-blue-300">Symptom Tracker</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Symptom Type"
          value={symptomType}
          onChange={(e) => setSymptomType(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          required
        />
        <input
          type="number"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          required
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          rows="4"
        />
        <button type="submit" className="bg-blue-500 text-white p-3 w-full rounded-md hover:bg-blue-600 transition duration-200 dark:bg-blue-600 dark:hover:bg-blue-700">
          {editId ? 'Update' : 'Log'} Symptom
        </button>
      </form>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Trends</h2>
        <Line data={chartData} />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">AI Insight</h2>
        <p className="text-gray-600 dark:text-gray-300">{insight || 'No insights yet—log some symptoms!'}</p>
      </div>
      <button onClick={exportPDF} className="bg-green-500 text-white p-3 w-full rounded-md hover:bg-green-600 transition duration-200 mb-8 dark:bg-green-600 dark:hover:bg-green-700">
        Export PDF
      </button>
      <ul className="space-y-4">
        {symptoms.map((s) => (
          <li key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{s.symptom_type} - Severity: {s.severity}</h3>
              <p className="text-gray-600 dark:text-gray-300">{s.notes}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(s.logged_at).toLocaleString()}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(s)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200 dark:bg-yellow-600 dark:hover:bg-yellow-700">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 dark:bg-red-600 dark:hover:bg-red-700">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
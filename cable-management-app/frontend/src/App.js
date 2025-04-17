import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [cables, setCables] = useState([]);
  const [connections, setConnections] = useState([]);
  const [formData, setFormData] = useState({
    outlet_name: '',
    type: 'סיב אופטי',
    location: '',
    status: 'פעיל'
  });
  const [connectionForm, setConnectionForm] = useState({
    cable1_id: '',
    cable2_id: ''
  });
  const [message, setMessage] = useState('');

  // שליפת כבלים
  useEffect(() => {
    fetchCables();
    fetchConnections();
  }, []);

  const fetchCables = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cables');
      setCables(response.data);
    } catch (error) {
      console.error('שגיאה בשליפת כבלים:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/connections');
      setConnections(response.data);
    } catch (error) {
      console.error('שגיאה בשליפת חיבורים:', error);
    }
  };

  // טיפול בהגשת טופס כבל
  const handleCableSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/cables', formData);
      setMessage(response.data.message);
      setFormData({ outlet_name: '', type: 'סיב אופטי', location: '', status: 'פעיל' });
      fetchCables();
    } catch (error) {
      setMessage(error.response?.data?.error || 'שגיאה בהוספת כבל');
    }
  };

  // טיפול בהגשת טופס חיבור
  const handleConnectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/connections', connectionForm);
      setMessage(response.data.message);
      setConnectionForm({ cable1_id: '', cable2_id: '' });
      fetchConnections();
    } catch (error) {
      setMessage(error.response?.data?.error || 'שגיאה ביצירת חיבור');
    }
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">מערכת ניהול כבלים</h1>
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700">{message}</div>
      )}

      {/* טופס הוספת כבל */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">הוסף כבל</h2>
        <form onSubmit={handleCableSubmit} className="space-y-4">
          <div>
            <label className="block">שם השקע</label>
            <input
              type="text"
              value={formData.outlet_name}
              onChange={(e) => setFormData({ ...formData, outlet_name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block">סוג</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="סיב אופטי">סיב אופטי</option>
              <option value="נחושת">נחושת</option>
            </select>
          </div>
          <div>
            <label className="block">מיקום</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block">סטטוס</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="פעיל">פעיל</option>
              <option value="לא פעיל">לא פעיל</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            הוסף כבל
          </button>
        </form>
      </div>

      {/* טופס יצירת חיבור */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">צור חיבור</h2>
        <form onSubmit={handleConnectionSubmit} className="space-y-4">
          <div>
            <label className="block">כבל 1</label>
            <select
              value={connectionForm.cable1_id}
              onChange={(e) => setConnectionForm({ ...connectionForm, cable1_id: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">בחר כבל</option>
              {cables.map((cable) => (
                <option key={cable.id} value={cable.id}>
                  {cable.outlet_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block">כבל 2</label>
            <select
              value={connectionForm.cable2_id}
              onChange={(e) => setConnectionForm({ ...connectionForm, cable2_id: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">בחר כבל</option>
              {cables.map((cable) => (
                <option key={cable.id} value={cable.id}>
                  {cable.outlet_name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            צור חיבור
          </button>
        </form>
      </div>

      {/* רשימת כבלים */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">כבלים</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">שם השקע</th>
              <th className="p-2 border">סוג</th>
              <th className="p-2 border">מיקום</th>
              <th className="p-2 border">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {cables.map((cable) => (
              <tr key={cable.id}>
                <td className="p-2 border">{cable.outlet_name}</td>
                <td className="p-2 border">{cable.type}</td>
                <td className="p-2 border">{cable.location}</td>
                <td className="p-2 border">{cable.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* רשימת חיבורים */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">חיבורים</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">כבל 1</th>
              <th className="p-2 border">כבל 2</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn) => (
              <tr key={conn.id}>
                <td className="p-2 border">{conn.cable1_name}</td>
                <td className="p-2 border">{conn.cable2_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
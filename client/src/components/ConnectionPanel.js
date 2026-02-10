import React, { useState } from 'react';
import axios from 'axios';
import { Database } from 'lucide-react';
import './ConnectionPanel.css';

function ConnectionPanel({ onConnection, connectionId }) {
  const [formData, setFormData] = useState({
    type: 'sqlite',
    path: '',
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/db/connect', formData);
      
      if (response.data.success) {
        setConnected(true);
        onConnection(response.data.connectionId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    onConnection(null);
    setError(null);
  };

  return (
    <div className="card ConnectionPanel">
      <h2><Database size={18} /> Database Connection</h2>
      
      {connected ? (
        <div className="connection-status">
          <div className="status-indicator connected">
            <span className="status-dot"></span>
            Connected
          </div>
          <button className="button" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label>Database Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              className="select"
            >
              <option value="sqlite">SQLite</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          {formData.type === 'sqlite' ? (
            <div className="form-group">
              <label>Database File Path (optional - defaults to database.db)</label>
              <input
                type="text"
                name="path"
                value={formData.path}
                onChange={handleChange}
                className="input"
                placeholder="e.g., ./mydatabase.db or C:/data/mydb.db"
              />
              <small style={{ color: '#6b6b7f', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                Leave empty to use default: database.db in server folder
              </small>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Host</label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  className="input"
                  placeholder="localhost"
                />
              </div>

              <div className="form-group">
                <label>Port</label>
                <input
                  type="text"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  className="input"
                  placeholder="5432"
                />
              </div>

              <div className="form-group">
                <label>Database</label>
                <input
                  type="text"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  className="input"
                  placeholder="database_name"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
                  placeholder="username"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="password"
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            className="button" 
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </>
      )}
    </div>
  );
}

export default ConnectionPanel;

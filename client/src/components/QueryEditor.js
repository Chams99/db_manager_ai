import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { FileEdit, AlertTriangle, Zap } from 'lucide-react';
import './QueryEditor.css';

function QueryEditor({ connectionId, onQueryResult, loading, setLoading, queryToSet, onQuerySet }) {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  useEffect(() => {
    if (queryToSet) {
      setQuery(queryToSet);
      onQuerySet();
    }
  }, [queryToSet, onQuerySet]);

  const handleExecute = async () => {
    if (!connectionId) {
      setError('Please connect to a database first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setExecutionTime(null);

    try {
      console.log('Executing query:', { connectionId, query: query.trim() });
      const response = await axios.post('/api/db/query', {
        connectionId,
        query: query.trim()
      });

      console.log('Query response:', response.data);

      if (response.data.success) {
        onQueryResult(response.data.results);
        setExecutionTime(response.data.executionTime);
      } else {
        setError(response.data.error || 'Query execution failed');
        onQueryResult(null);
      }
    } catch (err) {
      console.error('Query execution error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Query execution failed';
      setError(errorMessage);
      onQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleExecute();
    }
  };

  return (
    <div className="card QueryEditor">
      <div className="query-header">
        <h2><FileEdit size={18} /> Query Editor</h2>
        <div className="query-actions">
          <button 
            className="button" 
            onClick={handleExecute}
            disabled={loading || !connectionId}
          >
            {loading ? 'Executing...' : '▶ Execute (Ctrl+Enter)'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {!connectionId && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fef3c7', 
          color: '#92400e', 
          borderRadius: '8px', 
          marginBottom: '10px',
          fontSize: '0.9rem',
          border: '1px solid #fde68a'
        }}>
          <AlertTriangle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Please connect to a database first
        </div>
      )}

      <div className="editor-container">
        <Editor
          height="400px"
          defaultLanguage="sql"
          value={query}
          onChange={(value) => setQuery(value || '')}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true
          }}
          onKeyDown={handleKeyPress}
        />
      </div>

      {executionTime && (
        <div className="execution-info">
          <Zap size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Executed in {executionTime.toFixed(2)}ms
        </div>
      )}
    </div>
  );
}

export default QueryEditor;

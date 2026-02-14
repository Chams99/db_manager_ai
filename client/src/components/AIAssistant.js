import React, { useState } from 'react';
import axios from 'axios';
import { Bot, AlertTriangle } from 'lucide-react';
import './AIAssistant.css';

function AIAssistant({ connectionId, onUseQuery }) {
  const [input, setInput] = useState('');
  const [action, setAction] = useState('generate');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedQueries, setGeneratedQueries] = useState([]);

  const handleAsk = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);
    setGeneratedQueries([]);

    try {
      const res = await axios.post('/api/ai/assist', {
        query: input,
        action,
        connectionId: connectionId || null
      });

      if (res.data.success) {
        setResponse(res.data.response);
        
        // Always prioritize the queries array if it exists and has items
        if (res.data.queries && Array.isArray(res.data.queries) && res.data.queries.length > 0) {
          setGeneratedQueries(res.data.queries);
        } else if (res.data.query) {
          // Fallback to single query if queries array is empty or doesn't exist
          setGeneratedQueries([res.data.query]);
        } else {
          // No queries found - clear array
          setGeneratedQueries([]);
        }
      }
    } catch (err) {
      setResponse('Error: ' + (err.response?.data?.error || 'Failed to get AI assistance'));
    } finally {
      setLoading(false);
    }
  };

  const handleUseQuery = (query) => {
    if (query && onUseQuery) {
      onUseQuery(query);
    }
  };

  return (
    <div className="card AIAssistant">
      <h2><Bot size={18} /> AI Assistant</h2>
      
      <div className="ai-actions">
        <button
          className={`action-btn ${action === 'generate' ? 'active' : ''}`}
          onClick={() => setAction('generate')}
        >
          Generate Query
        </button>
        <button
          className={`action-btn ${action === 'optimize' ? 'active' : ''}`}
          onClick={() => setAction('optimize')}
        >
          Optimize
        </button>
        <button
          className={`action-btn ${action === 'explain' ? 'active' : ''}`}
          onClick={() => setAction('explain')}
        >
          Explain
        </button>
      </div>

      <div className="ai-input-group">
        <textarea
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            action === 'generate' 
              ? connectionId 
                ? 'e.g., "Get all users" or "Show products with price over 100"'
                : 'Connect to a database first to generate queries based on your schema'
              : action === 'optimize'
              ? 'Paste your SQL query here'
              : 'Paste your SQL query to explain'
          }
          rows="3"
        />
        <button 
          className="button" 
          onClick={handleAsk}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </div>

      {response && (
        <div className="ai-response">
          <div className="response-header">AI Response:</div>
          <div className="response-content">{response}</div>
          {generatedQueries.length > 0 && (
            <div className="generated-query">
              <div className="query-label">Generated {generatedQueries.length > 1 ? 'Queries' : 'Query'}:</div>
              {generatedQueries.map((query, index) => {
                const queryType = query.trim().match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i)?.[1] || 'SQL';
                const isModifying = /^(UPDATE|INSERT|DELETE)/i.test(query.trim());
                return (
                  <div key={index} className="query-item" style={{ 
                    marginBottom: '15px', 
                    padding: '12px', 
                    backgroundColor: isModifying ? '#fef3c7' : '#fafafa', 
                    borderRadius: '8px', 
                    border: isModifying ? '1px solid #fde68a' : '1px solid #e5e5e0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b6b7f', marginBottom: '5px' }}>
                      {queryType} Query {generatedQueries.length > 1 ? `#${index + 1}` : ''}
                      {isModifying && <span style={{ color: '#92400e', marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} />Modifies data</span>}
                    </div>
                    <code className="query-code" style={{ display: 'block', marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{query}</code>
                    <button 
                      className="button use-query-btn" 
                      onClick={() => handleUseQuery(query)}
                      style={{ 
                        backgroundColor: isModifying ? '#d97706' : '#1a1a3e',
                        color: isModifying ? '#fff' : '#fff',
                        border: isModifying ? '1px solid #d97706' : '1px solid #1a1a3e'
                      }}
                    >
                      Use This Query
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;

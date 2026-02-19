import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FileEdit, AlertTriangle, Zap } from 'lucide-react';
import './QueryEditor.css';

function QueryEditor({ connectionId, onQueryResult, loading, setLoading, queryToSet, onQuerySet, currentOffset, setCurrentOffset }) {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [lastExecutedOffset, setLastExecutedOffset] = useState(0);

  useEffect(() => {
    if (queryToSet) {
      setQuery(queryToSet);
      onQuerySet();
    }
  }, [queryToSet, onQuerySet]);

  const handleExecute = useCallback(async (offset = 0) => {
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
      // Stream results in very small chunks; limit is per "page".
      // 100 rows * very wide tables (hundreds of columns, like pixels) keeps
      // browser memory much lower while still giving a useful preview.
      const limit = 100;
      console.log('Executing query:', { connectionId, query: query.trim(), offset, limit });
      
      const response = await fetch('/api/db/query/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.REACT_APP_API_KEY && { 'X-API-Key': process.env.REACT_APP_API_KEY })
        },
        body: JSON.stringify({
          connectionId,
          query: query.trim(),
          limit,
          offset: offset
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let columns = [];
      let rows = [];
      let hasMore = false;
      let nextOffset = offset;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1]; // Keep incomplete line

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            
            if (dataStr === '[DONE]') {
              continue;
            }
            
            try {
              const event = JSON.parse(dataStr);
              
              if (event.type === 'columns') {
                // As soon as we know the columns, render an empty table header
                // so the user can see the structure before rows finish streaming.
                columns = event.columns;
                onQueryResult({
                  columns,
                  rows: [],
                  rowCount: 0,
                  offset: offset
                });
              } else if (event.type === 'row') {
                // Stream row-by-row: append each row and immediately update results.
                // Page size is small (100), so at most 100 renders per request.
                rows.push(event.row);

                onQueryResult({
                  columns,
                  rows: [...rows],
                  rowCount: rows.length,
                  offset: offset
                });
              } else if (event.type === 'complete') {
                setExecutionTime(event.executionTime);
                hasMore = event.hasMore;
                nextOffset = event.nextOffset;
                
                // Use actual rows length to ensure accuracy
                const actualRowCount = rows.length;
                
                // Send final results
                const finalResults = {
                  columns,
                  rows,
                  rowCount: actualRowCount,
                  isModifyingQuery: event.isModifyingQuery,
                  lastInsertRowid: event.lastInsertRowid,
                  hasMore: hasMore,
                  nextOffset: nextOffset,
                  offset: offset
                };
                
                onQueryResult(finalResults);
                
                console.log('Query completed:', {
                  actualRowCount: actualRowCount,
                  serverRowCount: event.rowCount,
                  rowsArrayLength: rows.length,
                  executionTime: event.executionTime,
                  hasMore: hasMore
                });
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch (err) {
              console.error('Error parsing SSE event:', err.message || 'Unknown error');
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Query execution failed';
      console.error('Query execution error:', errorMessage);
      setError(errorMessage);
      onQueryResult(null);
    } finally {
      setLoading(false);
    }
  }, [connectionId, query, onQueryResult, setLoading]);

  // Watch for offset changes to load more rows
  useEffect(() => {
    if (currentOffset > lastExecutedOffset && currentOffset > 0 && connectionId && query.trim()) {
      setLastExecutedOffset(currentOffset);
      handleExecute(currentOffset);
    }
  }, [currentOffset, connectionId, lastExecutedOffset, query, handleExecute]);

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
            onClick={() => handleExecute(0)}
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

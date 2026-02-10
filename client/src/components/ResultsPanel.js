import React from 'react';
import { BarChart, CheckCircle } from 'lucide-react';
import './ResultsPanel.css';

function ResultsPanel({ results }) {
  if (!results) {
    return (
      <div className="card ResultsPanel">
        <h2><BarChart size={18} /> Query Results</h2>
        <div className="no-results">
          <p>No results yet. Execute a query to see results here.</p>
        </div>
      </div>
    );
  }

  const hasRows = results.rows && results.rows.length > 0;
  const hasColumns = results.columns && results.columns.length > 0;

  return (
    <div className="card ResultsPanel">
      <div className="results-header">
        <h2><BarChart size={18} /> Query Results</h2>
        <div className="results-count">
          {results.rowCount} row{results.rowCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      {results.message && (
        <div className="query-message" style={{
          padding: '12px 16px',
          marginBottom: '15px',
          background: '#f0fdf4',
          color: '#059669',
          borderRadius: '8px',
          fontWeight: '600',
          border: '1px solid #bbf7d0'
        }}>
          <CheckCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{results.message}
        </div>
      )}
      
      {hasRows && hasColumns ? (
        <div className="results-container">
          <table className="results-table">
            <thead>
              <tr>
                {results.columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{cell !== null && cell !== undefined ? String(cell) : 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : results.isModifyingQuery && results.rowCount > 0 ? (
        <div className="no-results">
          <p style={{ color: '#059669', fontWeight: '600' }}>
            <CheckCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />Query executed successfully. {results.rowCount} row(s) affected.
          </p>
          {results.lastInsertRowid && (
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#6b6b7f' }}>
              Last inserted ID: {results.lastInsertRowid}
            </p>
          )}
        </div>
      ) : (
        <div className="no-results">
          <p>No rows returned.</p>
        </div>
      )}
    </div>
  );
}

export default ResultsPanel;

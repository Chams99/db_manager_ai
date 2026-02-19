import React, { useState } from 'react';
import { BarChart, CheckCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import './ResultsPanel.css';

function SingleResultTable({ result, title, resultSetIndex, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const columns = Array.isArray(result.columns) ? result.columns : [];
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const hasRows = rows.length > 0;
  const hasColumns = columns.length > 0;

  // Normalize each row to array of cell values (server may send array or object)
  const normalizedRows = rows.map(row =>
    Array.isArray(row) ? row : (row != null && typeof row === 'object' ? Object.values(row) : [])
  );

  if (!hasColumns) {
    return (
      <div className="result-set-block">
        <button type="button" className="result-set-header" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>{title}</span>
          <span className="result-set-count">0 rows</span>
        </button>
        {open && <div className="no-results-inline"><p>No rows returned.</p></div>}
      </div>
    );
  }

  const rowCount = result.rowCount != null ? result.rowCount : normalizedRows.length;
  const displayRows = hasRows ? normalizedRows : [];

  return (
    <div className="result-set-block">
      <button type="button" className="result-set-header" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
        <span className="result-set-count">{rowCount} row{rowCount !== 1 ? 's' : ''}</span>
      </button>
      {open && (
        <div className="results-container result-set-table-wrapper">
          <table className="results-table" key={`result-table-${resultSetIndex}`}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={`${resultSetIndex}-col-${idx}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIdx) => (
                <tr key={`${resultSetIndex}-row-${rowIdx}`}>
                  {row.map((cell, cellIdx) => (
                    <td key={`${resultSetIndex}-${rowIdx}-${cellIdx}`}>{cell !== null && cell !== undefined ? String(cell) : 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResultsPanel({ results, onLoadMore, hasMore, loading }) {
  const loadMore = () => {
    if (onLoadMore && typeof onLoadMore === 'function') {
      onLoadMore();
    }
  };

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

  // Multiple result sets (e.g. multiple SELECTs in one run)
  const resultSets = results.resultSets;
  if (resultSets && resultSets.length > 0) {
    const totalRows = resultSets.reduce((sum, rs) => sum + (rs.rowCount || 0), 0);
    return (
      <div className="card ResultsPanel">
        <div className="results-header">
          <h2><BarChart size={18} /> Query Results</h2>
          <div className="results-count">
            {resultSets.length} result set{resultSets.length !== 1 ? 's' : ''} · {totalRows} row{totalRows !== 1 ? 's' : ''} total
          </div>
        </div>
        <div className="result-sets-list">
          {resultSets.map((rs, idx) => (
            <SingleResultTable
              key={`result-set-${idx}`}
              resultSetIndex={idx}
              result={rs}
              title={`Result ${idx + 1}`}
              defaultOpen={resultSets.length <= 3 || idx === 0}
            />
          ))}
        </div>
      </div>
    );
  }

  const hasRows = results.rows && results.rows.length > 0;
  const hasColumns = results.columns && results.columns.length > 0;

  // Normalize rows to ensure they're arrays (server may send array or object)
  const normalizedRows = hasRows ? results.rows.map(row =>
    Array.isArray(row) ? row : (row != null && typeof row === 'object' ? Object.values(row) : [])
  ) : [];

  // Debug logging
  if (hasRows) {
    console.log('ResultsPanel rendering:', {
      rawRowsLength: results.rows?.length,
      normalizedRowsLength: normalizedRows.length,
      rowCount: results.rowCount,
      columnsLength: results.columns?.length
    });
  }

  return (
    <div className="card ResultsPanel">
      <div className="results-header">
        <h2><BarChart size={18} /> Query Results</h2>
        <div className="results-count">
          {results.rowCount || normalizedRows.length} row{(results.rowCount || normalizedRows.length) !== 1 ? 's' : ''}
          {hasMore && <span style={{ marginLeft: '8px', color: '#f59e0b' }}>+ more available</span>}
        </div>
      </div>
      
      {results.message && (
        <div className="query-message">
          <CheckCircle size={16} />{results.message}
        </div>
      )}
      
      {hasRows && hasColumns ? (
        <>
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
                {normalizedRows.map((row, rowIdx) => {
                  // Ensure we have a valid row
                  if (!row || !Array.isArray(row) || row.length === 0) {
                    console.warn(`Invalid row at index ${rowIdx}:`, row);
                    return null;
                  }
                  return (
                    <tr key={`row-${rowIdx}`}>
                      {row.map((cell, cellIdx) => (
                        <td key={`cell-${rowIdx}-${cellIdx}`}>{cell !== null && cell !== undefined ? String(cell) : 'NULL'}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="load-more-container">
              <button
                className="button load-more-button"
                onClick={loadMore}
                disabled={loading}
              >
                <Download size={16} />
                {loading ? 'Loading more...' : 'Load More Rows'}
              </button>
              <p className="load-more-info">
                Showing {results.offset || 0} - {(results.offset || 0) + (results.rowCount || 0)} rows
              </p>
            </div>
          )}
        </>
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

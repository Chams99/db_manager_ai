import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import './App.css';
import ConnectionPanel from './components/ConnectionPanel';
import QueryEditor from './components/QueryEditor';
import ResultsPanel from './components/ResultsPanel';
import AIAssistant from './components/AIAssistant';

function App() {
  const [connectionId, setConnectionId] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryToSet, setQueryToSet] = useState(null);

  const handleConnection = (id) => {
    setConnectionId(id);
    setQueryResults(null);
  };

  const handleQueryResult = (results) => {
    setQueryResults(results);
  };

  const handleUseQuery = (query) => {
    setQueryToSet(query);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1><Bot size={20} className="header-icon" />AI Database Assistant Manager</h1>
        <p>Intelligent database management with AI-powered assistance</p>
      </header>
      
      <div className="App-container">
        <div className="App-sidebar">
          <ConnectionPanel 
            onConnection={handleConnection} 
            connectionId={connectionId}
          />
          <AIAssistant 
            connectionId={connectionId}
            onUseQuery={handleUseQuery}
          />
        </div>
        
        <div className="App-main">
          <QueryEditor 
            connectionId={connectionId}
            onQueryResult={handleQueryResult}
            loading={loading}
            setLoading={setLoading}
            queryToSet={queryToSet}
            onQuerySet={() => setQueryToSet(null)}
          />
          <ResultsPanel results={queryResults} />
        </div>
      </div>
    </div>
  );
}

export default App;

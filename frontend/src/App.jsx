import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import NotebookStudio from './components/NotebookStudio';
import { fetchSources } from './api';

export default function App() {
  const [sources, setSources] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notebook'
  const [activeMode, setActiveMode] = useState('auto');

  const loadSources = async () => {
    try {
      const data = await fetchSources();
      setSources(data.sources || []);
      setTotalChunks(data.total_chunks || 0);
    } catch (err) {
      console.error("Failed to load workspace sources:", err);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      <Sidebar 
        sources={sources}
        totalChunks={totalChunks}
        onSourcesChange={loadSources}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {activeTab === 'chat' ? (
          <ChatWindow activeMode={activeMode} />
        ) : (
          <NotebookStudio sources={sources} />
        )}
      </main>
    </div>
  );
}

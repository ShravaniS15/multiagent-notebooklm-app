import React, { useRef } from 'react';
import { 
  FileText, Upload, Trash2, Database, Download, Sparkles, 
  Globe, Code, Image as ImageIcon, Headphones, BookOpen, Layers
} from 'lucide-react';
import { uploadDocument, clearSources, downloadCompleteAppZip } from '../api';

export default function Sidebar({ 
  sources, 
  totalChunks, 
  onSourcesChange, 
  activeTab, 
  setActiveTab,
  activeMode,
  setActiveMode
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const f of files) {
      try {
        await uploadDocument(f);
      } catch (err) {
        alert(`Failed to upload ${f.name}: ${err.message}`);
      }
    }
    onSourcesChange();
  };

  const handleClear = async () => {
    if (confirm("Clear all indexed documents from workspace?")) {
      await clearSources();
      onSourcesChange();
    }
  };

  const modes = [
    { id: 'auto', name: 'Auto Multiagent', icon: Sparkles, color: 'text-blue-400' },
    { id: 'audio', name: 'NotebookLM Podcast', icon: Headphones, color: 'text-purple-400' },
    { id: 'coder', name: 'Project Builder', icon: Code, color: 'text-emerald-400' },
    { id: 'scraper', name: 'Web Scraper Feed', icon: Globe, color: 'text-amber-400' },
    { id: 'image', name: 'AI Image Synth', icon: ImageIcon, color: 'text-pink-400' },
  ];

  return (
    <aside style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem', borderRight: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.95)' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NexusLM Studio
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multiagent RAG Platform</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('chat')}
          style={{ padding: '8px', borderRadius: '6px', border: 'none', background: activeTab === 'chat' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Sparkles size={14} /> Agent Chat
        </button>
        <button 
          onClick={() => setActiveTab('notebook')}
          style={{ padding: '8px', borderRadius: '6px', border: 'none', background: activeTab === 'notebook' ? 'var(--accent-purple)' : 'transparent', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <BookOpen size={14} /> NotebookLM
        </button>
      </div>

      {/* Execution Mode Selector */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} /> Agent Routing Mode
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} className={m.color} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NotebookLM Sources Section (RAG Document Store) */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={15} color="#60a5fa" /> Workspace Sources ({sources.length})
          </h4>
          {sources.length > 0 && (
            <button onClick={handleClear} title="Clear sources" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept=".pdf,.txt,.md,.json" 
          style={{ display: 'none' }} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary"
          style={{ width: '100%', marginBottom: '0.75rem', justifyContent: 'center', borderStyle: 'dashed', background: 'rgba(59, 130, 246, 0.05)' }}
        >
          <Upload size={16} color="#60a5fa" /> Upload PDF or Files
        </button>

        {/* Source List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No sources uploaded.<br/>Upload PDFs or text files to enable RAG index.
            </div>
          ) : (
            sources.map((s) => (
              <div 
                key={s.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '8px 10px', 
                  borderRadius: '6px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem' 
                }}
              >
                <FileText size={16} color="#c084fc" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f3f4f6' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {s.chunks_count} vector chunks • {(s.size_bytes / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total RAG Index Status */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Vector Index Chunks:</span>
          <span className="badge badge-emerald">{totalChunks} Chunks</span>
        </div>
      </div>

      {/* Download Complete Working Project ZIP */}
      <button 
        onClick={downloadCompleteAppZip}
        className="btn-primary"
        style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
      >
        <Download size={16} /> Download Full App ZIP
      </button>
    </aside>
  );
}

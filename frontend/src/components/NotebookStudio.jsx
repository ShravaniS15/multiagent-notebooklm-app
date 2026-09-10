import React, { useState } from 'react';
import { BookOpen, Sparkles, Network, HelpCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { generateBriefing, generateMindmap } from '../api';
import AudioPodcast from './AudioPodcast';

export default function NotebookStudio({ sources }) {
  const [topic, setTopic] = useState('Multiagent RAG Architecture & Vector Indexing');
  const [briefing, setBriefing] = useState(null);
  const [mindmap, setMindmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('briefing');

  const handleGenerateAll = async () => {
    setLoading(true);
    try {
      const bRes = await generateBriefing(topic);
      const mRes = await generateMindmap(topic);
      setBriefing(bRes);
      setMindmap(mRes);
    } catch (err) {
      alert("Failed to generate NotebookLM insights: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen color="#c084fc" /> NotebookLM Intelligence Suite
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Generate Podcast Audio, Executive Briefings, Flashcard Decks & Knowledge Graphs from your workspace documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter research topic..."
            style={{ width: '280px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', fontSize: '0.85rem' }}
          />
          <button 
            onClick={handleGenerateAll}
            disabled={loading}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Synthesize NotebookLM Insights
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('briefing')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeSubTab === 'briefing' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeSubTab === 'briefing' ? '#c084fc' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={16} /> Briefing Doc & Flashcards
        </button>
        <button 
          onClick={() => setActiveSubTab('mindmap')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeSubTab === 'mindmap' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: activeSubTab === 'mindmap' ? '#60a5fa' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Network size={16} /> Knowledge Graph Mindmap
        </button>
      </div>

      {/* Sub-Tab 1: Briefing & Flashcards */}
      {activeSubTab === 'briefing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {briefing ? (
            <>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.75rem' }}>
                  {briefing.title}
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  {briefing.executive_summary}
                </p>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.6rem' }}>
                  Key Takeaways Matrix
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {briefing.key_takeaways.map((kt, idx) => (
                    <div key={idx} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                      <ArrowRight size={14} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{kt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flashcards Section */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} /> Interactive Study Flashcards ({briefing.flashcards.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {briefing.flashcards.map((fc, idx) => (
                    <div key={idx} className="glass-panel-glow" style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f3f4f6', marginBottom: '0.5rem' }}>
                        Q: {fc.question}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        A: {fc.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click <strong>"Synthesize NotebookLM Insights"</strong> to auto-generate Executive Briefings & Flashcards from your workspace sources.
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Mindmap Knowledge Graph */}
      {activeSubTab === 'mindmap' && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          {mindmap ? (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', marginBottom: '1rem' }}>
                Knowledge Mindmap for: {mindmap.topic}
              </h3>
              <div style={{ padding: '2rem', background: '#030712', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', alignItems: 'center' }}>
                {mindmap.nodes.map((n) => {
                  const isRoot = n.type === 'root';
                  const isAgent = n.type === 'agent';
                  return (
                    <div 
                      key={n.id}
                      style={{
                        padding: isRoot ? '14px 24px' : '10px 16px',
                        borderRadius: '30px',
                        background: isRoot ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : isAgent ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: isRoot ? 'none' : isAgent ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-color)',
                        color: '#fff',
                        fontWeight: isRoot ? 800 : 600,
                        fontSize: isRoot ? '0.95rem' : '0.8rem',
                        boxShadow: isRoot ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                      }}
                    >
                      {n.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>
              Click <strong>"Synthesize NotebookLM Insights"</strong> to build the node-and-edge graph.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

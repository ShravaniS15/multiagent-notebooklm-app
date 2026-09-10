import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Globe, Code, Image as ImageIcon, Headphones, Loader2, Bot, User } from 'lucide-react';
import AgentTelemetry from './AgentTelemetry';
import RAGInspector from './RAGInspector';
import AudioPodcast from './AudioPodcast';
import CodeStudio from './CodeStudio';
import ImageStudio from './ImageStudio';

export default function ChatWindow({ activeMode }) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      agentName: 'Orchestrator Agent',
      text: '🚀 Welcome to **NexusLM Studio**! I am your Multiagent AI Assistant.\n\nYou can:\n- 📄 Upload PDFs or text files in the sidebar for RAG queries with page citations.\n- 🌐 Ask me to **"Scrape internet"** to see live web search transparency in real-time.\n- 💻 Request **"Create project"** to generate multi-file code and export ZIP archives.\n- 🎙️ Ask **"Generate podcast audio"** to synthesize NotebookLM Audio Overviews!',
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTelemetryEvents, setCurrentTelemetryEvents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTelemetryEvents]);

  const handleSend = (overridePrompt) => {
    const promptToSend = overridePrompt || inputPrompt;
    if (!promptToSend.trim() || isStreaming) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: promptToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setInputPrompt('');

    setIsStreaming(true);
    setCurrentTelemetryEvents([]);
    setCurrentAgent('Orchestrator');

    // Setup SSE connection to backend
    const sseUrl = `/api/stream?prompt=${encodeURIComponent(promptToSend)}&mode=${encodeURIComponent(activeMode)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'telemetry') {
          setCurrentAgent(data.agent || 'Swarm');
          setCurrentTelemetryEvents((prev) => [...prev, data]);
        } else if (data.type === 'final_response') {
          const agentMsg = {
            id: Date.now() + 1,
            sender: 'agent',
            agentName: data.agent || 'Multiagent Swarm',
            text: data.text,
            featureType: data.feature_type,
            citations: data.citations,
            audioData: data.audio_data,
            codeData: data.code_data,
            imageData: data.image_data,
            telemetrySnapshot: currentTelemetryEvents
          };
          setMessages((prev) => [...prev, agentMsg]);
          setIsStreaming(false);
          eventSource.close();
        }
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      setIsStreaming(false);
      eventSource.close();
    };
  };

  const quickPrompts = [
    { label: '🌐 Scrape Latest Web News', prompt: 'Scrape latest news on artificial intelligence agents and multiagent systems', mode: 'scraper' },
    { label: '💻 Build React Weather App', prompt: 'Create a React Weather App project with modern dark UI dashboard', mode: 'coder' },
    { label: '🎙️ Generate Podcast Audio', prompt: 'Generate podcast audio overview discussing multiagent workflows and vector RAG', mode: 'audio' },
    { label: '🎨 Synthesize Cyberpunk Art', prompt: 'Generate futuristic cyberpunk multiagent laboratory image', mode: 'image' }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Messages Timeline */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((m) => (
          <div 
            key={m.id}
            style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '85%',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {m.sender === 'agent' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}>
                <Bot size={20} color="#fff" />
              </div>
            )}

            <div 
              className={m.sender === 'user' ? '' : 'glass-panel'}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'var(--bg-card)',
                color: '#fff',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: m.sender === 'user' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              {m.sender === 'agent' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                    {m.agentName}
                  </span>
                  <span className="badge badge-purple">Verified Node</span>
                </div>
              )}

              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem' }}>
                {m.text}
              </p>

              {/* RAG Citations rendering */}
              {m.citations && <RAGInspector citations={m.citations} />}

              {/* NotebookLM Audio Overview player rendering */}
              {m.audioData && <AudioPodcast audioData={m.audioData} />}

              {/* Code Project Studio rendering */}
              {m.codeData && <CodeStudio codeData={m.codeData} />}

              {/* Image Synthesis rendering */}
              {m.imageData && <ImageStudio imageData={m.imageData} />}
            </div>

            {m.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="#fff" />
              </div>
            )}
          </div>
        ))}

        {/* Live Visual Telemetry Feed Streamer (Visible Scraping / RAG / Execution Logs) */}
        {isStreaming && (
          <AgentTelemetry 
            telemetryEvents={currentTelemetryEvents} 
            isStreaming={isStreaming}
            currentAgent={currentAgent}
          />
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ padding: '0 1.5rem', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isStreaming}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Console Bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.95)' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={inputPrompt} 
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything, scrape web, create project, or generate podcast audio..."
            disabled={isStreaming}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-glow)',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={isStreaming || !inputPrompt.trim()}
            className="btn-primary"
            style={{ padding: '0 1.5rem' }}
          >
            {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>Execute</span>
          </button>
        </form>
      </div>
    </div>
  );
}

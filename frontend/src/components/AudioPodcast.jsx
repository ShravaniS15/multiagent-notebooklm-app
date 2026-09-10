import React, { useState, useEffect } from 'react';
import { Play, Pause, Headphones, Radio, Volume2, RotateCcw } from 'lucide-react';

export default function AudioPodcast({ audioData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const dialogue = audioData?.dialogue || [];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          const nextVal = prev + 4;
          const speechIdx = Math.min(
            Math.floor((nextVal / 100) * dialogue.length),
            dialogue.length - 1
          );
          setCurrentSpeechIndex(speechIdx);
          return nextVal;
        });
      }, 600);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, dialogue.length]);

  const togglePlay = () => {
    if (!isPlaying && window.speechSynthesis && dialogue[currentSpeechIndex]) {
      // Trigger Web Speech API for voice playback
      window.speechSynthesis.cancel();
      const currentItem = dialogue[currentSpeechIndex];
      const utter = new SpeechSynthesisUtterance(currentItem.text);
      utter.rate = 1.05;
      utter.pitch = currentItem.speaker.includes("Alex") ? 1.1 : 0.95;
      window.speechSynthesis.speak(utter);
    } else if (isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentSpeechIndex(0);
  };

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '1.25rem', marginTop: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <Headphones size={22} color="#c084fc" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f3f4f6' }}>
              {audioData?.title || 'NotebookLM Audio Overview'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} color="#10b981" /> 2 Hosts Conversational Synthesis • {audioData?.duration || '1:15'}
            </span>
          </div>
        </div>
        <span className="badge badge-purple">NotebookLM Audio Engine</span>
      </div>

      {/* Main Control Console */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <button 
          onClick={togglePlay}
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
        </button>

        <button 
          onClick={handleReset}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          title="Restart Audio"
        >
          <RotateCcw size={18} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Speaker: <strong style={{ color: '#c084fc' }}>{dialogue[currentSpeechIndex]?.speaker || 'Host A'}</strong></span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <Volume2 size={20} color="#94a3b8" />
      </div>

      {/* Dialogue Script Timeline */}
      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {dialogue.map((item, idx) => {
          const isActive = idx === currentSpeechIndex;
          return (
            <div 
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isActive ? '#c084fc' : '#94a3b8', fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px' }}>
                <span>{item.speaker}</span>
                <span>{item.time}</span>
              </div>
              <p style={{ color: isActive ? '#fff' : 'var(--text-muted)', lineHeight: '1.4' }}>
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

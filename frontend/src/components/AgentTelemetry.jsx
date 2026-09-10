import React from 'react';
import { Terminal, Activity, Globe, Cpu, CheckCircle2, Loader2, Database } from 'lucide-react';

export default function AgentTelemetry({ telemetryEvents, isStreaming, currentAgent }) {
  if (!telemetryEvents || telemetryEvents.length === 0) return null;

  const latestEvent = telemetryEvents[telemetryEvents.length - 1];
  const progressPercent = latestEvent?.progress || (isStreaming ? 60 : 100);

  return (
    <div className="glass-panel glass-panel-glow scanline-effect" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38bdf8', letterSpacing: '0.05em' }}>
            AGENT EXECUTION & SCRAPING TELEMETRY
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isStreaming ? (
            <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Loader2 size={12} className="animate-spin" /> EXECUTING ({currentAgent || 'Swarm'})
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={12} /> COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.85rem' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', 
            transition: 'width 0.3s ease' 
          }} 
        />
      </div>

      {/* Real-time Telemetry Terminal feed */}
      <div className="terminal-box" style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {telemetryEvents.map((ev, idx) => (
          <div key={idx} style={{ marginBottom: '6px', display: 'flex', gap: '8px', lineHeight: '1.4' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', minWidth: '65px' }}>
              [{new Date().toLocaleTimeString().split(' ')[0]}]
            </span>
            <span style={{ color: '#c084fc', fontWeight: 600 }}>
              [{ev.agent || 'Orchestrator'}]:
            </span>
            <span style={{ color: ev.stage === 'SCRAPING_HTTP' ? '#fbbf24' : ev.stage === 'DOM_PARSED' ? '#34d399' : '#e2e8f0' }}>
              {ev.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Database, FileText, CheckCircle } from 'lucide-react';

export default function RAGInspector({ citations }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Database size={14} /> Retrieved RAG Vector Chunks ({citations.length})
      </h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {citations.map((c, idx) => (
          <div key={idx} style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <FileText size={14} color="#c084fc" />
              <span style={{ color: '#f3f4f6', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {c.doc_name} (Page {c.page})
              </span>
            </div>
            <span className="badge badge-emerald">
              {c.score}% Match
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

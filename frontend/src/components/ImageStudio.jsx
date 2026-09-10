import React from 'react';
import { Image as ImageIcon, Sparkles, Download, Layers } from 'lucide-react';

export default function ImageStudio({ imageData }) {
  if (!imageData) return null;

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '1.25rem', marginTop: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)' }}>
            <ImageIcon size={20} color="#f472b6" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f3f4f6' }}>
              AI Synthesized Image Render
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Style: {imageData.style || 'Digital Art'} • High Resolution Synthesis
            </span>
          </div>
        </div>

        <a 
          href={imageData.image_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', textDecoration: 'none' }}
        >
          <Download size={16} /> Open High-Res Art
        </a>
      </div>

      {/* Image Artwork Canvas View */}
      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#030712', textAlign: 'center' }}>
        {imageData.svg_fallback ? (
          <div 
            dangerouslySetInnerHTML={{ __html: imageData.svg_fallback }} 
            style={{ width: '100%', maxHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        ) : (
          <img 
            src={imageData.image_url} 
            alt={imageData.prompt} 
            style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
          />
        )}
      </div>

      <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={14} color="#f472b6" /> <em>Prompt: "{imageData.prompt}"</em>
      </div>
    </div>
  );
}

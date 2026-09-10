import urllib.parse
from typing import Dict, Any

class ImageAgent:
    def __init__(self):
        self.name = "Image Synthesizer Agent"

    def generate_image(self, prompt: str, style: str = "Digital Art") -> Dict[str, Any]:
        """
        Generates clean high-res image URLs via standard Pollinations AI synthesis engine
        and produces a SVG fallback template for immediate display.
        """
        clean_prompt = prompt.strip()
        enhanced_prompt = f"{clean_prompt}, {style}, highly detailed, 8k resolution, vibrant lighting, professional masterpiece"
        encoded_prompt = urllib.parse.quote(enhanced_prompt)
        
        # Public Pollinations AI image generator URL
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true&seed=42"

        # Also create a self-contained inline SVG artwork
        svg_artwork = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="#0f172a" rx="16"/>
  <circle cx="400" cy="250" r="180" fill="url(#grad1)" opacity="0.8"/>
  <circle cx="400" cy="250" r="220" fill="url(#glow)"/>
  <g fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3">
    <polygon points="400,100 550,350 250,350"/>
    <polygon points="400,400 250,150 550,150"/>
  </g>
  <text x="400" y="240" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">🎨 Nexus Synthesized Art</text>
  <text x="400" y="280" font-family="sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">"{clean_prompt[:45]}..."</text>
  <rect x="250" y="320" width="300" height="36" rx="18" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="400" y="343" font-family="sans-serif" font-size="13" fill="#93c5fd" text-anchor="middle">Style: {style} • Seed: 42</text>
</svg>'''

        return {
            "prompt": clean_prompt,
            "style": style,
            "image_url": image_url,
            "svg_fallback": svg_artwork
        }

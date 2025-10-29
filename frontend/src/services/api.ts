// In production, Flask serves the React app, so relative URLs work
// In dev, Vite proxy handles it, so we can use relative URLs too
const API_BASE = '';

export interface DetectionResult {
  ok: boolean;
  detected: Array<{ name: string; label: string; confidence: number }>;
  labels: string[];
  score: number;
  suggestions: string[];
  ready: boolean;
  error?: string;
}

export interface GeminiConvertResult {
  ok: boolean;
  image?: string;
  error?: string;
}

export interface GIFResult {
  ok: boolean;
  gif?: string;
  error?: string;
}

export async function detectItems(imageDataUrl: string): Promise<DetectionResult> {
  try {
    const res = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return {
        ok: false,
        detected: [],
        labels: [],
        score: 0,
        suggestions: [],
        ready: false,
        error: errorData.error || `HTTP ${res.status}`,
      };
    }
    
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Fetch error:', err);
    return {
      ok: false,
      detected: [],
      labels: [],
      score: 0,
      suggestions: [],
      ready: false,
      error: err?.message || 'Network error',
    };
  }
}

export async function convertToPerformative(
  imageDataUrl: string,
  taskHint?: string
): Promise<GeminiConvertResult> {
  try {
    console.log('Sending request to /gemini_convert...');
    const res = await fetch(`${API_BASE}/gemini_convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, task_hint: taskHint }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.error('Gemini API error:', res.status, errorData);
      return {
        ok: false,
        error: errorData.error || `HTTP ${res.status}`,
      };
    }
    
    const data = await res.json();
    console.log('Gemini response received:', data.ok ? 'Success' : `Error: ${data.error}`);
    return data;
  } catch (err: any) {
    console.error('Network error calling Gemini:', err);
    return {
      ok: false,
      error: err?.message || 'Network error',
    };
  }
}

export async function generateGIF(imageDataUrl: string): Promise<GIFResult> {
  const res = await fetch(`${API_BASE}/generate_gif`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  });
  return res.json();
}


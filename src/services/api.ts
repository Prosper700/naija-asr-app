// API service — real calls to live HuggingFace Space backend
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { API_URL, Language } from '../config/constants';

// Create axios instance with longer timeout (CPU is slow)
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes (model inference on CPU can be slow)
});

// ─── Translate text ───────────────────────────────────────────
export async function translateText(
  text: string,
  from: Language,
  to: Language
): Promise<string> {
  if (from === to) return text;

  try {
    const response = await api.post('/translate', {
      text: text.trim(),
      source_language: from,
      target_language: to,
    });
    return response.data.translation;
  } catch (err: any) {
    console.error('Translate error:', err.message);
    if (err.response) {
      throw new Error(err.response.data?.detail || 'Translation failed');
    }
    throw new Error('Network error — check your connection');
  }
}

// ─── Transcribe audio ──────────────────────────────────────────
export async function transcribeAudio(
  audioUri: string,
  language: Language
): Promise<string> {
  try {
    // Build multipart form data
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('language', language);

    const response = await axios.post(`${API_URL}/transcribe`, formData, {
      timeout: 120000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.transcription;
  } catch (err: any) {
    console.error('Transcribe error:', err.message);
    if (err.response) {
      throw new Error(err.response.data?.detail || 'Transcription failed');
    }
    throw new Error('Network error — check your connection');
  }
}

// ─── Full pipeline (audio → text → translation) ────────────────
export async function fullPipeline(
  audioUri: string,
  from: Language,
  to: Language
): Promise<{ transcription: string; translation: string }> {
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('source_language', from);
    formData.append('target_language', to);

    const response = await axios.post(`${API_URL}/pipeline`, formData, {
      timeout: 180000, // 3 minutes for full pipeline
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      transcription: response.data.transcription,
      translation: response.data.translation,
    };
  } catch (err: any) {
    console.error('Pipeline error:', err.message);
    if (err.response) {
      throw new Error(err.response.data?.detail || 'Pipeline failed');
    }
    throw new Error('Network error — check your connection');
  }
}

// ─── Health check ──────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health', { timeout: 10000 });
    return response.data.status === 'ok';
  } catch (err) {
    return false;
  }
}
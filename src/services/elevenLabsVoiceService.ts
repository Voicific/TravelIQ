class ElevenLabsVoiceService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  async generateSpeech(text: string, voiceId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found - will fallback to Gemini TTS');
    }

    if (!voiceId) {
      throw new Error('Voice ID is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSpeechWithAgent(agentId: string, text: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found - will fallback to Gemini TTS');
    }

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    try {
      // Use the agent's speech generation endpoint
      const response = await fetch(`${this.baseUrl}/text-to-speech/${agentId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs Agent API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs Agent TTS Error:', error);
      throw new Error(`Failed to generate speech with agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const elevenLabsService = new ElevenLabsVoiceService();
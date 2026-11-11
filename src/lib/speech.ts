// Web Speech API wrapper for smooth sentence and word narration

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: 'en-US' | 'en-GB' | 'vi-VN';
  onEnd?: () => void;
  onError?: () => void;
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onEnd) options.onEnd();
    return;
  }

  // Cancel any ongoing speech to avoid overlaps
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = options.pitch ?? 1.0;

  // Prefer high quality English voice if available
  const voices = window.speechSynthesis.getVoices();
  if (options.lang !== 'vi-VN' && voices.length > 0) {
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
  }

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (options.onError) options.onError();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}


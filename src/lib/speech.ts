// Audio & Web Speech wrapper supporting natural native Vietnamese (/api/tts) + Web Speech fallback

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: 'en-US' | 'en-GB' | 'vi-VN';
  onEnd?: () => void;
  onError?: () => void;
}

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
const MAX_CHUNK_LEN = 180;

let sharedAudio: HTMLAudioElement | null = null;
let playbackToken = 0;

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

function clearAudioHandlers(audio: HTMLAudioElement): void {
  audio.onended = null;
  audio.onerror = null;
}

/**
 * Call synchronously inside a user tap/click handler so mobile Safari/Chrome
 * unlocks sequential HTMLAudioElement playback for hands-free mode.
 */
export function unlockSpeechAudio(): void {
  const audio = getAudioElement();
  if (!audio) return;
  try {
    if (audio.paused && !audio.src) {
      audio.src = SILENT_WAV;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (audio.src === SILENT_WAV) {
              audio.pause();
            }
          })
          .catch(() => {});
      }
    }
  } catch {
    // Ignore autoplay unlock errors when Web Speech fallback handles playback
  }
}

export function stopSpeaking(): void {
  playbackToken += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const audio = sharedAudio;
  if (audio) {
    clearAudioHandlers(audio);
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore reset errors on uninitialized audio element
    }
  }
}

function pickBestVoice(voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;

  if (targetLang === 'vi-VN') {
    const viVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('vi'));
    if (viVoices.length === 0) return undefined;
    return (
      viVoices.find(
        (v) =>
          v.name.includes('HoaiMy') ||
          v.name.includes('NamMinh') ||
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Linh') ||
          v.name.includes('An')
      ) || viVoices[0]
    );
  }

  return voices.find(
    (v) =>
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')) &&
      v.lang.toLowerCase().startsWith('en')
  );
}

function speakViaWebSpeech(text: string, options: SpeakOptions, token: number): void {
  if (token !== playbackToken) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = options.lang || 'en-US';
  utterance.lang = lang;
  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = options.pitch ?? 1.0;

  const bestVoice = pickBestVoice(window.speechSynthesis.getVoices(), lang);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onend = () => {
    if (token !== playbackToken) return;
    options.onEnd?.();
  };

  utterance.onerror = () => {
    if (token !== playbackToken) return;
    options.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

function splitTextForTts(text: string, maxLen: number = MAX_CHUNK_LEN): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  let remaining = clean;
  while (remaining.length > maxLen) {
    let splitIdx = -1;
    for (const sep of ['. ', '; ', ', ', ' ']) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx > 0) {
        splitIdx = idx + sep.length;
        break;
      }
    }
    if (splitIdx <= 0) splitIdx = maxLen;
    const part = remaining.slice(0, splitIdx).trim();
    if (part) chunks.push(part);
    remaining = remaining.slice(splitIdx).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function playUrlQueue(
  urls: string[],
  options: SpeakOptions,
  token: number,
  onAllFailed: () => void
): void {
  const audio = getAudioElement();
  if (!audio || urls.length === 0) {
    onAllFailed();
    return;
  }

  let index = 0;
  const playNext = () => {
    if (token !== playbackToken) return;
    if (index >= urls.length) {
      clearAudioHandlers(audio);
      options.onEnd?.();
      return;
    }

    const url = urls[index];
    index += 1;
    clearAudioHandlers(audio);
    audio.src = url;
    audio.playbackRate = Math.max(0.75, Math.min(1.35, options.rate ?? 1));

    audio.onended = () => {
      if (token !== playbackToken) return;
      playNext();
    };

    audio.onerror = () => {
      if (token !== playbackToken) return;
      clearAudioHandlers(audio);
      onAllFailed();
    };

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (token !== playbackToken) return;
          clearAudioHandlers(audio);
          onAllFailed();
        });
      }
    } catch {
      clearAudioHandlers(audio);
      onAllFailed();
    }
  };

  playNext();
}

export function playAudioUrlWithFallback(
  audioUrl: string | undefined,
  fallbackText: string,
  options: SpeakOptions = {}
): void {
  stopSpeaking();
  const token = playbackToken;

  if (audioUrl) {
    playUrlQueue([audioUrl], options, token, () => speakViaWebSpeech(fallbackText, options, token));
    return;
  }

  speakViaWebSpeech(fallbackText, options, token);
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  stopSpeaking();
  const token = playbackToken;
  const cleanText = text.trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  if (options.lang === 'vi-VN') {
    const chunks = splitTextForTts(cleanText);
    const urls = chunks.map((chunk) => `/api/tts?lang=vi&text=${encodeURIComponent(chunk)}`);
    playUrlQueue(urls, options, token, () => speakViaWebSpeech(cleanText, options, token));
    return;
  }

  speakViaWebSpeech(cleanText, options, token);
}

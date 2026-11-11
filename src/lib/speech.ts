// Audio & Web Speech wrapper using /api/tts for clear EN/VI playback + Web Speech fallback

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
const CANCEL_SPEECH_COOLDOWN_MS = 75;

let sharedAudio: HTMLAudioElement | null = null;
let playbackToken = 0;
let audioAttemptId = 0;
let audioUnlocked = false;
let webSpeechTimer: ReturnType<typeof setTimeout> | null = null;
let lastSpeechCancelAt = 0;

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
 * Call inside a user click/tap when playback is NOT immediately starting on sharedAudio,
 * so mobile Safari/Chrome unlocks HTMLAudioElement for future queued steps.
 */
export function unlockSpeechAudio(): void {
  if (audioUnlocked) return;
  const audio = getAudioElement();
  if (!audio) return;
  try {
    if (audio.paused && !audio.src) {
      audio.src = SILENT_WAV;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            audioUnlocked = true;
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
  audioAttemptId += 1;

  if (webSpeechTimer !== null) {
    clearTimeout(webSpeechTimer);
    webSpeechTimer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      lastSpeechCancelAt = Date.now();
    }
    window.speechSynthesis.cancel();
  }

  const audio = sharedAudio;
  if (audio) {
    clearAudioHandlers(audio);
    try {
      if (!audio.paused) {
        audio.pause();
      }
    } catch {
      // Ignore pause errors on uninitialized audio element
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

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    lastSpeechCancelAt = Date.now();
    window.speechSynthesis.cancel();
  }

  const runUtterance = () => {
    webSpeechTimer = null;
    if (token !== playbackToken) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

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
  };

  // Chromium silently drops or cancels utterances spoken immediately after cancel()
  const elapsed = Date.now() - lastSpeechCancelAt;
  const delay = elapsed < CANCEL_SPEECH_COOLDOWN_MS ? CANCEL_SPEECH_COOLDOWN_MS - elapsed : 0;
  if (delay > 0) {
    webSpeechTimer = setTimeout(runUtterance, delay);
  } else {
    runUtterance();
  }
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

function buildTtsUrls(text: string, lang: 'en-US' | 'en-GB' | 'vi-VN' | undefined): string[] {
  const apiLang = lang === 'vi-VN' ? 'vi' : 'en';
  return splitTextForTts(text).map(
    (chunk) => `/api/tts?lang=${apiLang}&text=${encodeURIComponent(chunk)}`
  );
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
    const myAttempt = ++audioAttemptId;
    clearAudioHandlers(audio);
    const targetRate = Math.max(0.75, Math.min(1.35, options.rate ?? 1));
    audio.src = url;
    audio.playbackRate = targetRate;

    const triggerFailure = () => {
      if (token !== playbackToken || myAttempt !== audioAttemptId) return;
      audioAttemptId += 1;
      clearAudioHandlers(audio);
      onAllFailed();
    };

    audio.onended = () => {
      if (token !== playbackToken || myAttempt !== audioAttemptId) return;
      playNext();
    };

    audio.onerror = triggerFailure;

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            audioUnlocked = true;
            if (token === playbackToken && myAttempt === audioAttemptId) {
              audio.playbackRate = targetRate;
            }
          })
          .catch(triggerFailure);
      } else {
        audioUnlocked = true;
      }
    } catch {
      triggerFailure();
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
  const cleanText = fallbackText.trim();
  const ttsUrls = cleanText ? buildTtsUrls(cleanText, options.lang) : [];

  const playTtsOrWebSpeech = () => {
    if (ttsUrls.length > 0) {
      playUrlQueue(ttsUrls, options, token, () => speakViaWebSpeech(cleanText, options, token));
    } else if (cleanText) {
      speakViaWebSpeech(cleanText, options, token);
    } else {
      options.onEnd?.();
    }
  };

  if (audioUrl) {
    playUrlQueue([audioUrl], options, token, playTtsOrWebSpeech);
    return;
  }

  playTtsOrWebSpeech();
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  stopSpeaking();
  const token = playbackToken;
  const cleanText = text.trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const ttsUrls = buildTtsUrls(cleanText, options.lang);
  playUrlQueue(ttsUrls, options, token, () => speakViaWebSpeech(cleanText, options, token));
}

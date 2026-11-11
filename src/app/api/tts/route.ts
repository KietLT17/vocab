import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_TTS_LENGTH = 200;
const FETCH_TIMEOUT_MS = 3500;

function normalizeLang(raw: string | null): 'vi' | 'en' | null {
  const val = (raw || 'vi').trim().toLowerCase();
  if (val === 'vi' || val === 'vi-vn') return 'vi';
  if (val === 'en' || val === 'en-us' || val === 'en-gb') return 'en';
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawText = searchParams.get('text')?.trim() || '';
  const lang = normalizeLang(searchParams.get('lang'));

  if (!rawText) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }
  if (!lang) {
    return NextResponse.json({ error: 'Unsupported lang parameter' }, { status: 400 });
  }

  const text = rawText.slice(0, MAX_TTS_LENGTH);
  const upstreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(
    text
  )}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream TTS unavailable' }, { status: 502 });
    }

    const audioBuffer = await upstream.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty TTS response' }, { status: 502 });
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'TTS request timed out or failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}


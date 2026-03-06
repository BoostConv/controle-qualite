import { NextRequest, NextResponse } from 'next/server';
import { captureScreenshot } from '@/lib/screenshotone';
import { ScreenshotRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ScreenshotRequest = await request.json();

    if (!body.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!body.viewport || !['desktop', 'mobile'].includes(body.viewport)) {
      return NextResponse.json({ error: 'viewport must be "desktop" or "mobile"' }, { status: 400 });
    }

    const image = await captureScreenshot(body);

    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screenshot error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

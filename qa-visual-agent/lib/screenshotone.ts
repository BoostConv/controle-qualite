import { ScreenshotRequest } from '@/types';

const SCREENSHOTONE_API = 'https://api.screenshotone.com/take';

export async function captureScreenshot(req: ScreenshotRequest): Promise<string> {
  const apiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!apiKey) {
    throw new Error('SCREENSHOTONE_API_KEY is not configured');
  }

  const isDesktop = req.viewport === 'desktop';

  const params = new URLSearchParams({
    access_key: apiKey,
    url: req.url,
    viewport_width: isDesktop ? '1440' : '390',
    viewport_height: isDesktop ? '900' : '844',
    format: 'jpg',
    image_quality: '90',
    full_page: 'false',
  });

  const response = await fetch(`${SCREENSHOTONE_API}?${params.toString()}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ScreenshotOne error (${response.status}): ${text}`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return `data:image/jpeg;base64,${base64}`;
}
